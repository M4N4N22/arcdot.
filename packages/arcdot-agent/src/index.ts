/** @arcdot/agent — buyer client for arcdot. (wallet stays local). */

export { ARC_CHAIN_ID, ARC_RPC_URL_DEFAULT, GATEWAY_FEE_WEI_DEFAULT } from "./constants.js";
export type { PaymentProof, GatewayAuthMessage } from "./constants.js";

export {
  createWallet,
  loadWallet,
  resolvePrivateKey,
  walletPath,
  walletAccountFromKey,
} from "./wallet/store.js";
export type { StoredWallet } from "./wallet/store.js";

export { settlePayment, getNativeBalance } from "./settle/pay.js";
export { makePaymentId } from "./settle/paymentId.js";

export {
  unlockWithAutoSettle,
  fetchService,
  resolveGateway,
} from "./client/gateway.js";
export type { GatewayCallResult, CatalogService } from "./client/gateway.js";

export {
  callMcpToolWithAutoSettle,
  mcpRpc,
} from "./client/mcp.js";

export {
  parsePaymentRequired,
  parseMcpPaymentNeeded,
  isGateway402Body,
  paymentDepositArgs,
} from "./client/paymentParse.js";

export { createArcdotAgent } from "./createAgent.js";
export type { ArcdotAgent, CreateArcdotAgentOptions } from "./createAgent.js";

export { runMcpProxy } from "./mcp/proxy.js";
export { toolNameForSlug, slugFromToolName } from "./mcp/toolNames.js";
