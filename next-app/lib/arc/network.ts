/**
 * Arc network selection — mainnet (submission) vs testnet (local E2E).
 *
 * Set NEXT_PUBLIC_ARC_NETWORK=testnet | mainnet (default: mainnet).
 * Prefer network-suffixed env vars; bare PROMPT_GATEWAY_ADDRESS / ARC_RPC_URL
 * remain mainnet aliases for backward compatibility.
 */

export type ArcNetworkId = "mainnet" | "testnet";

export const ARC_MAINNET_CHAIN_ID = 5042 as const;
export const ARC_TESTNET_CHAIN_ID = 5042002 as const;

export const ARC_MAINNET_RPC_DEFAULT = "https://rpc.mainnet.arc.io" as const;
export const ARC_TESTNET_RPC_DEFAULT = "https://rpc.testnet.arc.io" as const;

export const ARC_MAINNET_EXPLORER = "https://explorer.arc.io" as const;
export const ARC_TESTNET_EXPLORER = "https://testnet.arcscan.app" as const;

function parseNetwork(raw: string | undefined): ArcNetworkId {
  const v = (raw ?? "mainnet").trim().toLowerCase();
  if (v === "testnet" || v === "arc-testnet" || v === "5042002") return "testnet";
  return "mainnet";
}

/** Active Arc network for this process / browser build. */
export function getArcNetwork(): ArcNetworkId {
  return parseNetwork(
    process.env.NEXT_PUBLIC_ARC_NETWORK ?? process.env.ARC_NETWORK,
  );
}

export function isArcTestnet(): boolean {
  return getArcNetwork() === "testnet";
}

export function getArcChainId(): number {
  return getArcNetwork() === "testnet"
    ? ARC_TESTNET_CHAIN_ID
    : ARC_MAINNET_CHAIN_ID;
}

export function getArcRpcUrl(): string {
  if (getArcNetwork() === "testnet") {
    return (
      process.env.NEXT_PUBLIC_ARC_TESTNET_RPC_URL?.trim() ||
      process.env.ARC_TESTNET_RPC_URL?.trim() ||
      ARC_TESTNET_RPC_DEFAULT
    );
  }
  return (
    process.env.NEXT_PUBLIC_ARC_MAINNET_RPC_URL?.trim() ||
    process.env.ARC_MAINNET_RPC_URL?.trim() ||
    process.env.NEXT_PUBLIC_ARC_RPC_URL?.trim() ||
    process.env.ARC_RPC_URL?.trim() ||
    ARC_MAINNET_RPC_DEFAULT
  );
}

export function getArcExplorerBase(): string {
  if (getArcNetwork() === "testnet") {
    return (
      process.env.NEXT_PUBLIC_ARC_TESTNET_EXPLORER?.trim() ||
      ARC_TESTNET_EXPLORER
    );
  }
  return (
    process.env.NEXT_PUBLIC_ARC_MAINNET_EXPLORER?.trim() || ARC_MAINNET_EXPLORER
  );
}

export function getArcExplorerTxBase(): string {
  return `${getArcExplorerBase().replace(/\/$/, "")}/tx/`;
}

export function getArcExplorerAddressBase(): string {
  return `${getArcExplorerBase().replace(/\/$/, "")}/address/`;
}

/** PromptGateway for the active network. */
export function getPromptGatewayAddress(): `0x${string}` | "" {
  if (getArcNetwork() === "testnet") {
    const a =
      process.env.PROMPT_GATEWAY_ADDRESS_TESTNET?.trim() ||
      process.env.NEXT_PUBLIC_PROMPT_GATEWAY_ADDRESS_TESTNET?.trim() ||
      "";
    return a as `0x${string}` | "";
  }
  const a =
    process.env.PROMPT_GATEWAY_ADDRESS_MAINNET?.trim() ||
    process.env.NEXT_PUBLIC_PROMPT_GATEWAY_ADDRESS_MAINNET?.trim() ||
    process.env.PROMPT_GATEWAY_ADDRESS?.trim() ||
    process.env.NEXT_PUBLIC_PROMPT_GATEWAY_ADDRESS?.trim() ||
    "";
  return a as `0x${string}` | "";
}
