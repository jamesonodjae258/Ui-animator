/* ── Shot Planner Generator ─────────────────────────────────── */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { createServiceClient, createClient as createServerClient } from "@/lib/supabase/server";
import { SHOT_PLANNER_SYSTEM_PROMPT } from "./prompt";
import { validateSceneGraphResponse } from "./schema";
import type { ShotPlan } from "./types";
import { localStore } from "@/lib/local-store";
import type { FrameRow, ProjectRow } from "@/lib/supabase/types";

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

function getLLMClient(): ProviderClient | null {
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

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey && !openrouterKey.startsWith("your-")) {
    return {
      type: "nvidia",
      client: new OpenAI({
        apiKey: openrouterKey,
        baseURL: "https://openrouter.ai/api/v1",
      }),
      model: "anthropic/claude-3.5-sonnet",
    };
  }

  const anthropicKey =
    process.env.AGENTROUTER_API_KEY && !process.env.AGENTROUTER_API_KEY.startsWith("your-")
      ? process.env.AGENTROUTER_API_KEY
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

  return null;
}

export function generateFallbackNarrativePlan(
  frames: Array<{ id: string; name: string }>,
  brief: string,
  targetDurationSeconds: number,
  stylePreset: string,
) {
  const targetMs = targetDurationSeconds * 1000;
  const shotCount = Math.min(Math.max(frames.length, 3), 6);
  const baseDuration = Math.floor(targetMs / shotCount);
  const remainder = targetMs - baseDuration * shotCount;

  const sentences = brief.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 5);
  const hookCaption = sentences[0] ? `${sentences[0]}.` : "Turn product prototypes into motion stories.";
  const problemCaption = sentences[1] ? `${sentences[1]}.` : "Traditional screen recordings fail to hold viewer retention.";
  const payoffCaption = sentences[sentences.length - 1] ? `${sentences[sentences.length - 1]}.` : "High-converting motion graphics rendered in 60fps.";

  const beats: Array<"hook" | "problem" | "reveal" | "highlight" | "payoff"> = [];
  if (shotCount === 3) {
    beats.push("hook", "reveal", "payoff");
  } else if (shotCount === 4) {
    beats.push("hook", "problem", "reveal", "payoff");
  } else if (shotCount === 5) {
    beats.push("hook", "problem", "reveal", "highlight", "payoff");
  } else {
    beats.push("hook", "problem", "reveal", "reveal", "highlight", "payoff");
  }

  const cameraMoves: Array<"zoom_in_center" | "zoom_out" | "pan_left_to_right" | "ken_burns_subtle" | "static_hold"> = [
    "zoom_in_center",
    "pan_left_to_right",
    "ken_burns_subtle",
    "zoom_out",
    "static_hold",
    "zoom_in_center",
  ];

  const captions = [
    hookCaption,
    problemCaption,
    "One-click narrative timeline from Figma frames.",
    "Sub-pixel vector interpolation at 60fps.",
    "Designed to convert viewers into active users.",
    payoffCaption,
  ];

  const shots: ShotPlan[] = beats.map((beat, idx) => {
    const frameIndex = Math.min(idx, frames.length - 1);
    const duration = idx === beats.length - 1 ? baseDuration + remainder : baseDuration;
    return {
      shot_id: `s${idx + 1}`,
      frame_id: frames[frameIndex].id,
      narrative_beat: beat,
      camera_move: cameraMoves[idx % cameraMoves.length],
      duration_ms: duration,
      caption: captions[idx % captions.length],
      transition_in: idx === 0 ? "fade" : "cut",
    };
  });

  return {
    video_duration_target: targetDurationSeconds,
    style_preset: stylePreset,
    shots,
  };
}

export async function generateSceneGraph(projectId: string): Promise<{
  success: boolean;
  sceneGraphId?: string;
  error?: string;
}> {
  const supabase = await createServerClient();
  const serviceClient = createServiceClient();

  // 1. Fetch project data
  let project: ProjectRow | null = null;
  try {
    const { data: p, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (!projectError && p) {
      project = p as ProjectRow;
    }
  } catch (err) {
    console.warn("Supabase project fetch error, checking local store:", err);
  }

  if (!project) {
    project = localStore.getProject(projectId);
  }

  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  const projectBrief = project.brief?.trim() ?? "";
  const durationTarget = project.duration_seconds ?? 30;
  const stylePreset = project.style_preset ?? "clean_saas";

  // Pre-validate brief length (~10 words min)
  const wordCount = projectBrief.split(/\s+/).filter(Boolean).length;
  if (!projectBrief || wordCount < 10) {
    const errorMsg =
      "Project brief is missing or too short (minimum 10 words). Please describe your product on the import screen.";
    let errSceneGraphId = crypto.randomUUID();

    try {
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

      if (errRecord?.id) {
        errSceneGraphId = errRecord.id;
      }
    } catch {}

    localStore.upsertSceneGraph({
      id: errSceneGraphId,
      project_id: projectId,
      video_duration_target: durationTarget,
      style_preset: stylePreset,
      status: "error",
      error_message: errorMsg,
      shots: [],
    });

    return {
      success: false,
      sceneGraphId: errSceneGraphId,
      error: errorMsg,
    };
  }

  // 2. Fetch included frames
  let frames: FrameRow[] = [];
  try {
    const { data: dbFrames, error: framesError } = await supabase
      .from("frames")
      .select("*")
      .eq("project_id", projectId)
      .eq("included", true)
      .order("order_in_flow", { ascending: true });

    if (!framesError && dbFrames && dbFrames.length > 0) {
      frames = dbFrames as FrameRow[];
    }
  } catch (err) {
    console.warn("Supabase frames fetch error, checking local store:", err);
  }

  if (frames.length === 0) {
    frames = localStore.getFrames(projectId).filter((f) => f.included !== false);
  }

  if (frames.length < 3) {
    const errorMsg = `At least 3 included frames are required to generate a scene graph (found ${frames.length}).`;
    let errSceneGraphId = crypto.randomUUID();

    try {
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

      if (errRecord?.id) {
        errSceneGraphId = errRecord.id;
      }
    } catch {}

    localStore.upsertSceneGraph({
      id: errSceneGraphId,
      project_id: projectId,
      video_duration_target: durationTarget,
      style_preset: stylePreset,
      status: "error",
      error_message: errorMsg,
      shots: [],
    });

    return {
      success: false,
      sceneGraphId: errSceneGraphId,
      error: errorMsg,
    };
  }

  // Create initial scene_graph entry with status 'generating'
  let sceneGraphRecordId = crypto.randomUUID();
  try {
    const { data: sceneGraphRecord } = await supabase
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

    if (sceneGraphRecord?.id) {
      sceneGraphRecordId = sceneGraphRecord.id;
    }
  } catch (err) {
    console.warn("Supabase scene_graphs upsert failed, using local store:", err);
  }

  localStore.upsertSceneGraph({
    id: sceneGraphRecordId,
    project_id: projectId,
    video_duration_target: durationTarget,
    style_preset: stylePreset,
    status: "generating",
    error_message: null,
    shots: [],
  });

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

  if (!provider) {
    console.log("No external LLM provider configured. Generating deterministic narrative plan...");
    const fallback = generateFallbackNarrativePlan(
      frames.map((f) => ({ id: f.id, name: f.name })),
      projectBrief,
      durationTarget,
      stylePreset,
    );
    const validation = validateSceneGraphResponse(fallback, validFrameIds, durationTarget);
    return await handleValidationResult(supabase, projectId, sceneGraphRecordId, validation);
  }

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

      return await handleValidationResult(supabase, projectId, sceneGraphRecordId, validation);
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

      return await handleValidationResult(supabase, projectId, sceneGraphRecordId, validation);
    }
  } catch (err) {
    console.warn("Shot planner generation exception. Falling back to deterministic narrative planning:", err);
    try {
      const fallback = generateFallbackNarrativePlan(
        frames.map((f) => ({ id: f.id, name: f.name })),
        projectBrief,
        durationTarget,
        stylePreset,
      );
      const validation = validateSceneGraphResponse(fallback, validFrameIds, durationTarget);
      if (validation.valid) {
        return await handleValidationResult(supabase, projectId, sceneGraphRecordId, validation);
      }
    } catch (fallbackErr) {
      console.error("Fallback narrative generation error:", fallbackErr);
    }

    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Shot planner generation exception:", err);

    try {
      await supabase
        .from("scene_graphs")
        .update({
          status: "error",
          error_message: errorMsg,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sceneGraphRecordId);
    } catch {}

    localStore.upsertSceneGraph({
      id: sceneGraphRecordId,
      project_id: projectId,
      status: "error",
      error_message: errorMsg,
    });

    return {
      success: false,
      sceneGraphId: sceneGraphRecordId,
      error: errorMsg,
    };
  }
}

async function handleValidationResult(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  projectId: string,
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

    try {
      await supabase
        .from("scene_graphs")
        .update({
          status: "error",
          error_message: userMsg,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sceneGraphId);
    } catch {}

    localStore.upsertSceneGraph({
      id: sceneGraphId,
      project_id: projectId,
      status: "error",
      error_message: userMsg,
    });

    return {
      success: false,
      sceneGraphId,
      error: userMsg,
    };
  }

  if (!validation.valid || !validation.data || !validation.data.shots) {
    const errorMsg = `Scene graph validation failed: ${validation.errors.join("; ")}`;
    try {
      await supabase
        .from("scene_graphs")
        .update({
          status: "error",
          error_message: errorMsg,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sceneGraphId);
    } catch {}

    localStore.upsertSceneGraph({
      id: sceneGraphId,
      project_id: projectId,
      status: "error",
      error_message: errorMsg,
    });

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

  try {
    await supabase
      .from("scene_graphs")
      .update({
        status: "ready",
        error_message: null,
        shots: finalShots,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sceneGraphId);
  } catch {}

  localStore.upsertSceneGraph({
    id: sceneGraphId,
    project_id: projectId,
    status: "ready",
    error_message: null,
    shots: finalShots,
  });

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

