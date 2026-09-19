/**
 * Demo unlock helper (no on-chain payment). Prefer scripts/agent-pay.ts for real settlement.
 *
 * Usage (from next-app/, with server running):
 *   npx tsx scripts/agent-request.ts [slug] "What is arcdot?"
 *
 * Requires DEMO_AGENT_SECRET in the environment (same value as .env.local).
 */

import { callGatewayDemo } from "../lib/agent/client";

async function main() {
  const args = process.argv.slice(2);
  let service = "quick-brief";
  let promptParts = args;
  if (args[0] && !args[0].includes(" ") && /^[a-z0-9-]+$/.test(args[0])) {
    service = args[0];
    promptParts = args.slice(1);
  }
  const prompt =
    promptParts.join(" ") || "Say hello in one sentence.";
  const baseUrl = process.env.ARCDOT_BASE_URL ?? "http://localhost:3000";
  const demoSecret = process.env.DEMO_AGENT_SECRET;

  if (!demoSecret) {
    console.error("Set DEMO_AGENT_SECRET to match the Next.js server env.");
    console.error("For a real Arc payment, use: npm run agent:pay");
    process.exit(1);
  }

  const result = await callGatewayDemo({
    baseUrl,
    service,
    input: { prompt },
    demoSecret,
    clientRequestId: `cli-demo-${Date.now()}`,
  });

  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
