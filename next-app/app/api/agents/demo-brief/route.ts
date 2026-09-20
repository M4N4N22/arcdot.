import { NextResponse } from "next/server";
import { z } from "zod";
import { runDemoBriefAgent } from "@/lib/agents/demoBrief";

export const runtime = "nodejs";

/**
 * Seller-compatible agent endpoint for SDK / MCP testing.
 *
 * Contract (same as gateway → seller upstream):
 *   POST JSON { prompt, input?, service?, requestId?, settlement? }
 *   → 200 { text: string, mock?: boolean }
 *
 * Publish a tool with Agent endpoint:
 *   http://localhost:3000/api/agents/demo-brief   (local)
 *   https://<your-host>/api/agents/demo-brief     (deployed)
 *
 * Optional: set DEMO_AGENT_BEARER and paste the same value as the tool bearer.
 */
const bodySchema = z.object({
  prompt: z.string().max(8000).optional(),
  input: z.unknown().optional(),
  service: z.string().max(80).optional(),
  requestId: z.string().max(128).optional(),
  settlement: z.unknown().optional(),
});

function extractPrompt(body: z.infer<typeof bodySchema>): string {
  if (typeof body.prompt === "string" && body.prompt.trim()) {
    return body.prompt.trim();
  }
  if (body.input && typeof body.input === "object" && body.input !== null) {
    const p = (body.input as { prompt?: unknown }).prompt;
    if (typeof p === "string" && p.trim()) return p.trim();
  }
  if (typeof body.input === "string" && body.input.trim()) {
    return body.input.trim();
  }
  return "";
}

function bearerOk(request: Request): boolean {
  const expected = process.env.DEMO_AGENT_BEARER?.trim();
  if (!expected) return true;
  const auth = request.headers.get("authorization")?.trim() ?? "";
  const token = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : auth;
  return token === expected;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    agent: "demo-brief",
    protocol: "arcdot.seller-upstream",
    usage:
      'POST JSON { "prompt": "…" } → { "text": "…" }. Optional bearer: DEMO_AGENT_BEARER.',
  });
}

export async function POST(request: Request) {
  if (!bearerOk(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const prompt = extractPrompt(parsed.data);
  if (!prompt) {
    return NextResponse.json(
      { error: "Missing prompt (body.prompt or body.input.prompt)" },
      { status: 400 },
    );
  }

  try {
    const result = await runDemoBriefAgent(prompt);
    return NextResponse.json({
      text: result.text,
      mock: result.mock,
      agent: "demo-brief",
      requestId: parsed.data.requestId ?? null,
    });
  } catch (err) {
    console.error("demo-brief agent failed", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Agent failed",
      },
      { status: 502 },
    );
  }
}
