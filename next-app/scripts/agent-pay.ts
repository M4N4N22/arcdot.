/**
 * Paid agent unlock on Arc (software → software).
 *
 * Usage (from next-app/, server running, funded agent wallet on Arc):
 *   AGENT_PRIVATE_KEY=0x... npx tsx scripts/agent-pay.ts quick-brief "Summarize this in one line"
 *
 * Optional:
 *   ARCDOT_BASE_URL=http://localhost:3000
 *   ARC_RPC_URL=https://rpc.mainnet.arc.io
 */

import {
  agentPrivateKeyFromEnv,
  runPaidAgentRequest,
} from "../lib/agent/paidRequest";

async function main() {
  const args = process.argv.slice(2);
  const service = args[0] || "quick-brief";
  const prompt =
    args.slice(1).join(" ") || "Say hello in one short sentence.";
  const baseUrl = process.env.ARCDOT_BASE_URL ?? "http://localhost:3000";

  console.error(
    JSON.stringify({
      step: "start",
      service,
      baseUrl,
      promptPreview: prompt.slice(0, 80),
    }),
  );

  const result = await runPaidAgentRequest({
    baseUrl,
    service,
    input: { prompt },
    privateKey: agentPrivateKeyFromEnv(),
    clientRequestId: `agent-pay-${Date.now()}`,
  });

  console.log(
    JSON.stringify(
      {
        paymentId: result.paymentId,
        txHash: result.txHash,
        gateway: result.gateway,
      },
      null,
      2,
    ),
  );

  if (!result.gateway.ok) process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
