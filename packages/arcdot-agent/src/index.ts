/**
 * @arcdot/agent — re-exports next-app agent helpers for scripts.
 * Import from here in tooling; Next app continues to use @/lib/agent/*.
 */

export {
  runPaidAgentRequest,
  agentPrivateKeyFromEnv,
  ARC_CHAIN_ID,
  type PaidAgentService,
  type RunPaidAgentRequestParams,
  type RunPaidAgentRequestResult,
} from "../../next-app/lib/agent/paidRequest";

export {
  isGateway402Body,
  parsePaymentRequired,
  gatewayErrorCode,
  paymentDepositArgs,
} from "../../next-app/lib/agent/parse402";

export {
  buildGatewayAuthMessage,
  getAuthChallengeText,
  callGatewayPaid,
  callGatewayDemo,
  type GatewayCallResult,
  type CallGatewayPaidParams,
  type CallGatewayDemoParams,
} from "../../next-app/lib/agent/client";
