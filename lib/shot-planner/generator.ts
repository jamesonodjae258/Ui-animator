/* ── Shot Planner Generator ─────────────────────────────────── */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { createServiceClient, createClient as createServerClient } from "@/lib/supabase/server";
import { SHOT_PLANNER_SYSTEM_PROMPT } from "./prompt";
import { validateSceneGraphResponse } from "./schema";
import type { ShotPlan } from "./types";

interface FramePayload {
  id: string;
  name: string;
  order: number;
  base64Image: string | null;
}

type ProviderClient =
  | {
      type: "nvidia";
      client: OpenAI;
      model: string;
    }
  | {
      type: "anthropic";
      client: Anthropic;
      model: string;
    };

function getLLMClient(): ProviderClient {
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  if (nvidiaKey && !nvidiaKey.startsWith("your-")) {
    const baseURL = process.env.NVIDIA_BASE_URL?.trim() || "https://integrate.api.nvidia.com/v1";
    const model = process.env.NVIDIA_MODEL?.trim() || "meta/llama-3.3-70b-instruct";

    return {
      type: "nvidia",
      client: new OpenAI({
        apiKey: nvidiaKey,
        baseURL,
      }),
      model,
    };
  }

  const anthropicKey =
    process.env.AGENTROUTER_API_KEY && !process.env.AGENTROUTER_API_KEY.startsWith("your-")
      ? process.env.AGENTROUTER_API_KEY
      : process.env.OPENROUTER_API_KEY && !process.env.OPENROUTER_API_KEY.startsWith("your-")
      ? process.env.OPENROUTER_API_KEY
      : process.env.ANTHROPIC_API_KEY;

  if (anthropicKey && !anthropicKey.startsWith("your-")) {
    const baseURL = process.env.AGENTROUTER_BASE_URL?.trim() || undefined;
    return {
      type: "anthropic",
      client: new Anthropic({
        apiKey: anthropicKey,
        ...(baseURL ? { baseURL } : {}),
      }),
      model: "claude-3-5-sonnet-20241022",
    };
  }

  throw new Error(
    "No valid AI API key found. Please configure NVIDIA_API_KEY, ANTHROPIC_API_KEY, or OPENROUTER_API_KEY in .env.local",
  );
}

export async function generateSceneGraph(projectId: string): Promise<{
  success: boolean;
  sceneGraphId?: string;
  error?: string;
}> {
  const supabase = await createServerClient();
  const serviceClient = createServiceClient();

  // 1. Fetch project data
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    throw new Error(`Project not found: ${projectError?.message ?? projectId}`);
  }

  const projectBrief = project.brief?.trim() ?? "";
  const durationTarget = project.duration_seconds ?? 30;
  const stylePreset = project.style_preset ?? "clean_saas";

  // Pre-validate brief length (~10 words min)
  const wordCount = projectBrief.split(/\s+/).filter(Boolean).length;
  if (!projectBrief || wordCount < 10) {
    const { data: errRecord } = await supabase
      .from("scene_graphs")
      .upsert(
        {
          project_id: projectId,
          video_duration_target: durationTarget,
          style_preset: stylePreset,
          status: "error",
          error_message:
            "Project brief is missing or too short (minimum 10 words). Please describe your product on the import screen.",
          shots: [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: "project_id" },
      )
      .select()
      .single();

    return {
      success: false,
      sceneGraphId: errRecord?.id,
      error:
        "Project brief is missing or too short (minimum 10 words). Please describe your product on the import screen.",
    };
  }

  // 2. Fetch included frames
  const { data: frames, error: framesError } = await supabase
    .from("frames")
    .select("*")
    .eq("project_id", projectId)
    .eq("included", true)
    .order("order_in_flow", { ascending: true });

  if (framesError || !frames || frames.length < 3) {
    const errorMsg = `At least 3 included frames are required to generate a scene graph (found ${
      frames?.length ?? 0
    }).`;

    const { data: errRecord } = await supabase
      .from("scene_graphs")
      .upsert(
        {
          project_id: projectId,
          video_duration_target: durationTarget,
          style_preset: stylePreset,
          status: "error",
          error_message: errorMsg,
          shots: [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: "project_id" },
      )
      .select()
      .single();

    return {
      success: false,
      sceneGraphId: errRecord?.id,
      error: errorMsg,
    };
  }

  // Create initial scene_graph entry with status 'generating'
  const { data: sceneGraphRecord, error: sgInitError } = await supabase
    .from("scene_graphs")
    .upsert(
      {
        project_id: projectId,
        video_duration_target: durationTarget,
        style_preset: stylePreset,
        status: "generating",
        error_message: null,
        shots: [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "project_id" },
    )
    .select()
    .single();

  if (sgInitError || !sceneGraphRecord) {
    throw new Error(`Failed to initialize scene graph record: ${sgInitError?.message}`);
  }

  const validFrameIds = frames.map((f) => f.id);

  // Download thumbnails and prepare frame data
  const framePayloads: FramePayload[] = [];
  for (const frame of frames) {
    let base64Image: string | null = null;
    if (frame.thumbnail_storage_path) {
      try {
        const { data: fileData, error: downloadError } = await serviceClient.storage
          .from("frame-thumbnails")
          .download(frame.thumbnail_storage_path);

        if (!downloadError && fileData) {
          const buffer = Buffer.from(await fileData.arrayBuffer());
          base64Image = buffer.toString("base64");
        }
      } catch (err) {
        console.warn(`Could not download thumbnail for frame ${frame.id}:`, err);
      }
    }

    framePayloads.push({
      id: frame.id,
      name: frame.name,
      order: frame.order_in_flow,
      base64Image,
    });
  }

  const provider = getLLMClient();

  try {
    let rawText = "";

    if (provider.type === "nvidia") {
      const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [
        {
          type: "text",
          text: `INPUT DATA:\n- project_brief: "${projectBrief}"\n- target_duration_seconds: ${durationTarget}\n- style_preset: "${stylePreset}"\n\nFRAMES LIST:`,
        },
      ];

      for (const fp of framePayloads) {
        userContent.push({
          type: "text",
          text: `\nFrame ID: "${fp.id}" | Name: "${fp.name}" | Order: ${fp.order}`,
        });
        if (fp.base64Image) {
          userContent.push({
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${fp.base64Image}`,
            },
          });
        }
      }

      userContent.push({
        type: "text",
        text: "\nBuild the narrative scene graph now. Return ONLY raw valid JSON.",
      });

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: SHOT_PLANNER_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ];

      const response = await provider.client.chat.completions.create({
        model: provider.model,
        messages,
        temperature: 0.2,
        response_format: { type: "json_object" },
      });

      rawText = response.choices[0]?.message?.content ?? "";

      let parsedJson = tryParseJson(rawText);
      let validation = validateSceneGraphResponse(parsedJson, validFrameIds, durationTarget);

      // Retry once if invalid
      if (!validation.valid && (!validation.data || !validation.data.error)) {
        console.warn("NVIDIA NIM Scene graph validation failed on attempt 1. Retrying once:", validation.errors);

        messages.push({
          role: "assistant",
          content: rawText,
        });
        messages.push({
          role: "user",
          content: `Your JSON output was invalid for the following reasons:\n- ${validation.errors.join(
            "\n- ",
          )}\n\nPlease correct these issues and output ONLY valid JSON matching the schema.`,
        });

        const retryResponse = await provider.client.chat.completions.create({
          model: provider.model,
          messages,
          temperature: 0.1,
          response_format: { type: "json_object" },
        });

        rawText = retryResponse.choices[0]?.message?.content ?? "";
        parsedJson = tryParseJson(rawText);
        validation = validateSceneGraphResponse(parsedJson, validFrameIds, durationTarget);
      }

      return await handleValidationResult(supabase, sceneGraphRecord.id, validation);
    } else {
      // Anthropic Provider
      const contentBlocks: Anthropic.Messages.ContentBlockParam[] = [
        {
          type: "text",
          text: `INPUT DATA:\n- project_brief: "${projectBrief}"\n- target_duration_seconds: ${durationTarget}\n- style_preset: "${stylePreset}"\n\nFRAMES LIST:`,
        },
      ];

      for (const fp of framePayloads) {
        contentBlocks.push({
          type: "text",
          text: `\nFrame ID: "${fp.id}" | Name: "${fp.name}" | Order: ${fp.order}`,
        });
        if (fp.base64Image) {
          contentBlocks.push({
            type: "image",
            source: {
              type: "base64",
              media_type: "image/png",
              data: fp.base64Image,
            },
          });
        }
      }

      contentBlocks.push({
        type: "text",
        text: "\nBuild the narrative scene graph now. Return ONLY raw valid JSON.",
      });

      const messages: Anthropic.Messages.MessageParam[] = [
        {
          role: "user",
          content: contentBlocks,
        },
      ];

      let response = await provider.client.messages.create({
        model: provider.model,
        max_tokens: 4000,
        temperature: 0.2,
        system: SHOT_PLANNER_SYSTEM_PROMPT,
        messages,
      });

      rawText = extractMessageText(response);
      let parsedJson = tryParseJson(rawText);
      let validation = validateSceneGraphResponse(parsedJson, validFrameIds, durationTarget);

      // Retry once if invalid
      if (!validation.valid && (!validation.data || !validation.data.error)) {
        console.warn("Anthropic Scene graph validation failed on attempt 1. Retrying once:", validation.errors);

        messages.push({
          role: "assistant",
          content: rawText,
        });
        messages.push({
          role: "user",
          content: `Your JSON output was invalid for the following reasons:\n- ${validation.errors.join(
            "\n- ",
          )}\n\nPlease correct these issues and output ONLY valid JSON matching the schema.`,
        });

        response = await provider.client.messages.create({
          model: provider.model,
          max_tokens: 4000,
          temperature: 0.1,
          system: SHOT_PLANNER_SYSTEM_PROMPT,
          messages,
        });

        rawText = extractMessageText(response);
        parsedJson = tryParseJson(rawText);
        validation = validateSceneGraphResponse(parsedJson, validFrameIds, durationTarget);
      }

      return await handleValidationResult(supabase, sceneGraphRecord.id, validation);
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Shot planner generation exception:", err);

    await supabase
      .from("scene_graphs")
      .update({
        status: "error",
        error_message: errorMsg,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sceneGraphRecord.id);

    return {
      success: false,
      sceneGraphId: sceneGraphRecord.id,
      error: errorMsg,
    };
  }
}

async function handleValidationResult(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  sceneGraphId: string,
  validation: ReturnType<typeof validateSceneGraphResponse>,
): Promise<{ success: boolean; sceneGraphId?: string; error?: string }> {
  if (validation.valid && validation.data?.error) {
    const errType = validation.data.error;
    let userMsg = "The AI could not generate a scene graph.";
    if (errType === "insufficient_brief") {
      userMsg =
        "The project brief is too vague to identify a core story. Please elaborate on what your product does and why it matters on the import screen.";
    } else if (errType === "insufficient_content") {
      userMsg =
        "Not enough distinct content in selected frames. Please select more frames on the import screen.";
    } else if (typeof errType === "string") {
      userMsg = errType;
    }

    await supabase
      .from("scene_graphs")
      .update({
        status: "error",
        error_message: userMsg,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sceneGraphId);

    return {
      success: false,
      sceneGraphId,
      error: userMsg,
    };
  }

  if (!validation.valid || !validation.data || !validation.data.shots) {
    const errorMsg = `Scene graph validation failed: ${validation.errors.join("; ")}`;
    await supabase
      .from("scene_graphs")
      .update({
        status: "error",
        error_message: errorMsg,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sceneGraphId);

    return {
      success: false,
      sceneGraphId,
      error: errorMsg,
    };
  }

  const finalShots: ShotPlan[] = validation.data.shots.map((s, idx) => ({
    ...s,
    shot_id: s.shot_id || `s${idx + 1}`,
  }));

  await supabase
    .from("scene_graphs")
    .update({
      status: "ready",
      error_message: null,
      shots: finalShots,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sceneGraphId);

  return {
    success: true,
    sceneGraphId,
  };
}

function extractMessageText(message: Anthropic.Messages.Message): string {
  return message.content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

function tryParseJson(text: string): unknown {
  try {
    const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

