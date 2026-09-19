import { defineChain } from "viem";
import { ARC_CHAIN_ID, ARC_RPC_URL_DEFAULT } from "@/lib/types/gateway";

export const arcMainnet = defineChain({
  id: ARC_CHAIN_ID,
  name: "Arc",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_ARC_RPC_URL ??
          process.env.ARC_RPC_URL ??
          ARC_RPC_URL_DEFAULT,
      ],
    },
  },
  blockExplorers: {
    default: { name: "Arc Explorer", url: "https://explorer.arc.io" },
  },
});
