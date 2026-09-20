/** @arcdot/agent — buyer client for arcdot. (wallet stays local). */

export { ARC_CHAIN_ID, ARC_RPC_URL_DEFAULT, GATEWAY_FEE_WEI_DEFAULT } from "./constants.js";
export type { PaymentProof, GatewayAuthMessage } from "./constants.js";

export {
  createWallet,
  importWallet,
  loadWallet,
  resolvePrivateKey,
  walletPath,
  walletAccountFromKey,
  isHexPrivateKey,
  NoWalletError,
} from "./wallet/store.js";
export type { StoredWallet } from "./wallet/store.js";

export {
  getWalletStatus,
  formatWalletStatusHuman,
  DEFAULT_LOW_BALANCE_USDC,
} from "./wallet/status.js";
export type { WalletStatus } from "./wallet/status.js";
export {
  formatFundsNeededMessage,
  formatUsdcDisplay,
} from "./wallet/fundsNeeded.js";
export {
  formatNoWalletGuide,
  fundUrlFor,
  hostAgentShellDirective,
  hostAgentCreateShellDirective,
  WALLET_CREATE_CMD,
  WALLET_IMPORT_CMD,
  WALLET_IMPORT_FROM_ENV_CMD,
  WALLET_STATUS_CMD,
} from "./wallet/guide.js";

export {
  settlePayment,
  getNativeBalance,
  InsufficientFundsError,
} from "./settle/pay.js";
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
