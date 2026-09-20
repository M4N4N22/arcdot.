import { completeWithGemini } from "@/lib/llm/gemini";

/** First-party demo agent — Gemini-backed, seller-upstream compatible. */
export const DEMO_BRIEF_SYSTEM = [
  "You are a sharp product analyst for arcdot.",
  "Reply in exactly two short sentences.",
  "Be concrete and practical. No bullet lists.",
].join(" ");

export const FIRST_PARTY_AGENT_PATHS = {
  "/api/agents/demo-brief": {
    systemPrompt: DEMO_BRIEF_SYSTEM,
    label: "demo-brief",
  },
} as const;

export type FirstPartyAgentPath = keyof typeof FIRST_PARTY_AGENT_PATHS;

export function normalizeAgentPath(pathname: string): string {
  const p = pathname.replace(/\/+$/, "") || "/";
  return p;
}

export function getFirstPartyAgent(
  pathname: string,
): (typeof FIRST_PARTY_AGENT_PATHS)[FirstPartyAgentPath] | null {
  const key = normalizeAgentPath(pathname);
  if (key in FIRST_PARTY_AGENT_PATHS) {
    return FIRST_PARTY_AGENT_PATHS[key as FirstPartyAgentPath];
  }
  return null;
}

export async function runDemoBriefAgent(prompt: string): Promise<{
  text: string;
  mock: boolean;
}> {
  return completeWithGemini(prompt, DEMO_BRIEF_SYSTEM);
}
