/**
 * Manual agent request helper (demo unlock).
 *
 * Usage (from next-app/, with server running):
 *   npx tsx scripts/agent-request.ts "What is arcdot?"
 *
 * Requires DEMO_AGENT_SECRET in the environment (same value as .env.local).
 */

import { callGatewayDemo } from "../lib/agent/client";

async function main() {
  const prompt = process.argv.slice(2).join(" ") || "Say hello in one sentence.";
  const baseUrl = process.env.ARCDOT_BASE_URL ?? "http://localhost:3000";
  const demoSecret = process.env.DEMO_AGENT_SECRET;

  if (!demoSecret) {
    console.error("Set DEMO_AGENT_SECRET to match the Next.js server env.");
    process.exit(1);
  }

  const result = await callGatewayDemo({
    baseUrl,
    service: "llm.chat",
    input: { prompt },
    demoSecret,
    clientRequestId: `cli-${Date.now()}`,
  });

  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
