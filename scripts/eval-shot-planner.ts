/* ── OpenRouter Shot Planner Evaluation Harness ─────────────── */

import fs from "fs";
import path from "path";
import { SHOT_PLANNER_SYSTEM_PROMPT } from "../lib/shot-planner/prompt";
import { validateSceneGraphResponse } from "../lib/shot-planner/schema";
import type { ShotPlan } from "../lib/shot-planner/types";

// Zero-dependency loader for .env.local
function loadEnvLocal() {
  const envLocalPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envLocalPath)) {
    const lines = fs.readFileSync(envLocalPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnvLocal();

/* ── Evaluation Configuration ──────────────────────────────── */

const DEFAULT_MODELS = [
  "anthropic/claude-3.5-sonnet",
  "openai/gpt-4o-mini",
  "google/gemini-2.5-flash",
];

const BANNED_PHRASES = [
  "streamline your workflow",
  "revolutionize",
  "game-changing",
  "seamlessly",
  "unlock",
  "empower",
  "take it to the next level",
  "in just minutes",
  "!",
];

interface FixtureFrame {
  frame_id: string;
  name: string;
  order_in_flow: number;
  thumbnail_path: string;
}

interface Fixture {
  name: string;
  project_brief: string;
  target_duration_seconds: number;
  style_preset: string;
  frames: FixtureFrame[];
}

interface EvalResult {
  model: string;
  fixtureName: string;
  honoredJsonFormat: boolean;
  schemaPass: boolean;
  bannedPhrasesPass: boolean;
  bannedPhrasesFound: string[];
  captions: string[];
  errors: string[];
  rawResponsePath: string;
}

/* ── Helpers ───────────────────────────────────────────────── */

function getOpenRouterApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || key.startsWith("your-")) {
    console.warn(
      "\n⚠️ WARNING: OPENROUTER_API_KEY is not configured in .env.local or process.env.",
    );
    console.warn(
      "The eval script will run in DRY-RUN validation mode against mock/cached responses.\n",
    );
    return "";
  }
  return key;
}

function loadFixtures(): Fixture[] {
  const fixturesDir = path.join(process.cwd(), "scripts", "eval-fixtures");
  if (!fs.existsSync(fixturesDir)) {
    throw new Error(`Fixtures directory not found at ${fixturesDir}`);
  }

  const files = fs.readdirSync(fixturesDir).filter((f) => f.endsWith(".json"));
  return files.map((file) => {
    const filePath = path.join(fixturesDir, file);
    const content = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(content);
    return {
      name: path.basename(file, ".json"),
      ...data,
    };
  });
}

function checkBannedPhrases(shots: ShotPlan[]): { pass: boolean; found: string[] } {
  const foundSet = new Set<string>();

  for (const shot of shots) {
    if (!shot.caption) continue;
    const text = shot.caption.toLowerCase();

    for (const phrase of BANNED_PHRASES) {
      if (phrase === "!") {
        if (shot.caption.includes("!")) {
          foundSet.add("exclamation mark (!)");
        }
      } else if (text.includes(phrase)) {
        foundSet.add(phrase);
      }
    }
  }

  return {
    pass: foundSet.size === 0,
    found: Array.from(foundSet),
  };
}

/* ── Main Runner ───────────────────────────────────────────── */

async function runEval() {
  console.log("==================================================");
  console.log("  Shot-Planner LLM Evaluation Harness (OpenRouter)");
  console.log("==================================================\n");

  const apiKey = getOpenRouterApiKey();
  const fixtures = loadFixtures();
  const resultsDir = path.join(process.cwd(), "scripts", "eval-results");

  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const evalResults: EvalResult[] = [];

  for (const fixture of fixtures) {
    console.log(`\n📌 Fixture: ${fixture.name} (${fixture.frames.length} frames, ${fixture.target_duration_seconds}s target)`);
    console.log(`   Brief: "${fixture.project_brief.slice(0, 70)}..."`);

    const validFrameIds = fixture.frames.map((f) => f.frame_id);

    for (const model of DEFAULT_MODELS) {
      console.log(`\n   🤖 Testing Model: ${model}...`);
      const safeModelSlug = model.replace(/[\/:]/g, "-");
      const rawResultPath = path.join(resultsDir, `${safeModelSlug}-${fixture.name}.json`);

      let rawContent = "";
      let honoredJsonFormat = true;

      if (apiKey) {
        // Construct OpenRouter Multi-modal Request
        const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
          {
            type: "text",
            text: `INPUT DATA:
- project_brief: "${fixture.project_brief}"
- target_duration_seconds: ${fixture.target_duration_seconds}
- style_preset: "${fixture.style_preset}"

FRAMES LIST:`,
          },
        ];

        for (const frame of fixture.frames) {
          userContent.push({
            type: "text",
            text: `\nFrame ID: "${frame.frame_id}" | Name: "${frame.name}" | Order: ${frame.order_in_flow}`,
          });

          const imgPath = path.join(process.cwd(), frame.thumbnail_path);
          if (fs.existsSync(imgPath)) {
            const b64 = fs.readFileSync(imgPath).toString("base64");
            userContent.push({
              type: "image_url",
              image_url: { url: `data:image/png;base64,${b64}` },
            });
          }
        }

        userContent.push({
          type: "text",
          text: "\nBuild the narrative scene graph now. Return ONLY raw valid JSON.",
        });

        try {
          let response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://uianimator.app",
              "X-Title": "UI Animator Shot-Planner Eval",
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: SHOT_PLANNER_SYSTEM_PROMPT },
                { role: "user", content: userContent },
              ],
              response_format: { type: "json_object" },
              temperature: 0.2,
            }),
          });

          if (!response.ok) {
            honoredJsonFormat = false;
            response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://uianimator.app",
                "X-Title": "UI Animator Shot-Planner Eval",
              },
              body: JSON.stringify({
                model,
                messages: [
                  { role: "system", content: SHOT_PLANNER_SYSTEM_PROMPT },
                  { role: "user", content: userContent },
                ],
                temperature: 0.2,
              }),
            });
          }

          const apiJson = await response.json();
          fs.writeFileSync(rawResultPath, JSON.stringify(apiJson, null, 2));

          rawContent = apiJson.choices?.[0]?.message?.content ?? "";
        } catch (apiErr) {
          console.error(`      ❌ API call failed for ${model}:`, apiErr);
          rawContent = "";
        }
      } else {
        // DRY RUN / MOCK fallback when OPENROUTER_API_KEY is not set
        honoredJsonFormat = true;
        const mockResponse = {
          video_duration_target: fixture.target_duration_seconds,
          style_preset: fixture.style_preset,
          shots: [
            {
              shot_id: "s1",
              frame_id: fixture.frames[0].frame_id,
              narrative_beat: "hook",
              camera_move: "zoom_in_center",
              duration_ms: 6000,
              caption: "Every case, one unified timeline",
              transition_in: "fade",
            },
            {
              shot_id: "s2",
              frame_id: fixture.frames[1]?.frame_id ?? fixture.frames[0].frame_id,
              narrative_beat: "problem",
              camera_move: "static_hold",
              duration_ms: 5000,
              caption: "Stop digging through scattered emails",
              transition_in: "fade",
            },
            {
              shot_id: "s3",
              frame_id: fixture.frames[2]?.frame_id ?? fixture.frames[0].frame_id,
              narrative_beat: "reveal",
              camera_move: "pan_left_to_right",
              duration_ms: 6000,
              caption: "Automated deadline tracking in action",
              transition_in: "fade",
            },
            {
              shot_id: "s4",
              frame_id: fixture.frames[3]?.frame_id ?? fixture.frames[0].frame_id,
              narrative_beat: "highlight",
              camera_move: "ken_burns_subtle",
              duration_ms: 6000,
              caption: "Real-time updates for your entire firm",
              transition_in: "fade",
            },
            {
              shot_id: "s5",
              frame_id: fixture.frames[fixture.frames.length - 1].frame_id,
              narrative_beat: "payoff",
              camera_move: "zoom_out",
              duration_ms: 7000,
              caption: "Case closed. Nothing missed.",
              transition_in: "fade",
            },
          ],
        };
        rawContent = JSON.stringify(mockResponse);
        fs.writeFileSync(rawResultPath, rawContent);
      }

      // Parse & Validate Response
      let parsedData: unknown = null;
      try {
        const cleaned = rawContent.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
        parsedData = JSON.parse(cleaned);
      } catch {
        parsedData = null;
      }

      const validation = validateSceneGraphResponse(
        parsedData,
        validFrameIds,
        fixture.target_duration_seconds,
      );

      const shots = (validation.data?.shots ?? []) as ShotPlan[];
      const bannedCheck = checkBannedPhrases(shots);
      const captions = shots.map((s) => `[${s.narrative_beat}] "${s.caption ?? ""}"`);

      evalResults.push({
        model,
        fixtureName: fixture.name,
        honoredJsonFormat,
        schemaPass: validation.valid,
        bannedPhrasesPass: bannedCheck.pass,
        bannedPhrasesFound: bannedCheck.found,
        captions,
        errors: validation.errors,
        rawResponsePath: rawResultPath,
      });

      const schemaBadge = validation.valid ? "✅ PASS" : "❌ FAIL";
      const bannedBadge = bannedCheck.pass ? "✅ PASS" : `❌ BANNED (${bannedCheck.found.join(", ")})`;
      console.log(`      Schema Validation: ${schemaBadge}`);
      console.log(`      Banned Phrase Check: ${bannedBadge}`);
    }
  }

  // Build Summary Markdown Table
  const summaryMarkdown = generateSummaryMarkdown(evalResults);
  const summaryPath = path.join(resultsDir, "summary.md");
  fs.writeFileSync(summaryPath, summaryMarkdown);

  console.log("\n==================================================");
  console.log(`🎉 Evaluation Complete! Summary saved to:\n   ${summaryPath}`);
  console.log("==================================================\n");
  console.log(summaryMarkdown);
}

function generateSummaryMarkdown(results: EvalResult[]): string {
  let md = "# Shot-Planner Evaluation Summary Report\n\n";
  md += `*Generated at: ${new Date().toISOString()}*\n\n`;

  md += "## 1. Quantitative Benchmark Matrix\n\n";
  md += "| Model | Fixture | Strict JSON Format | Schema Valid | Banned Phrases | Shots Count |\n";
  md += "|-------|---------|--------------------|--------------|----------------|-------------|\n";

  for (const r of results) {
    const jsonFmt = r.honoredJsonFormat ? "Yes" : "Fallback";
    const schemaVal = r.schemaPass ? "✅ Pass" : "❌ Fail";
    const bannedVal = r.bannedPhrasesPass
      ? "✅ Pass"
      : `❌ Found: ${r.bannedPhrasesFound.join(", ")}`;
    const shotCount = r.captions.length;

    md += `| \`${r.model}\` | **${r.fixtureName}** | ${jsonFmt} | ${schemaVal} | ${bannedVal} | ${shotCount} |\n`;
  }

  md += "\n## 2. Sample Captions & Narrative Arc Review\n\n";

  const fixtureNames = Array.from(new Set(results.map((r) => r.fixtureName)));

  for (const fName of fixtureNames) {
    md += `### Fixture: \`${fName}\`\n\n`;
    const fResults = results.filter((r) => r.fixtureName === fName);

    for (const res of fResults) {
      md += `#### Model: \`${res.model}\`\n`;
      if (res.errors.length > 0) {
        md += `> ⚠️ **Validation Errors:** ${res.errors.join("; ")}\n\n`;
      }

      if (res.captions.length > 0) {
        md += "```text\n";
        res.captions.forEach((c) => {
          md += `${c}\n`;
        });
        md += "```\n\n";
      } else {
        md += "_No valid captions returned._\n\n";
      }
    }
  }

  return md;
}

runEval().catch((err) => {
  console.error("Eval script fatal error:", err);
  process.exit(1);
});
