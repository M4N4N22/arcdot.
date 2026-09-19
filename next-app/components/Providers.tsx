"use client";

import "@rainbow-me/rainbowkit/styles.css";

import {
  getDefaultConfig,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { http, WagmiProvider } from "wagmi";
import { arcMainnet } from "@/lib/wallet/arcChain";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "arcdot_local_dev_placeholder";

const config = getDefaultConfig({
  appName: "arcdot.",
  projectId,
  chains: [arcMainnet],
  transports: {
    [arcMainnet.id]: http(
      process.env.NEXT_PUBLIC_ARC_RPC_URL ?? "https://rpc.mainnet.arc.io",
    ),
  },
  ssr: true,
});

const rkTheme = lightTheme({
  accentColor: "#1a1a1a",
  accentColorForeground: "#faf9f6",
  borderRadius: "small",
  fontStack: "system",
  overlayBlur: "small",
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={rkTheme}
          modalSize="compact"
          initialChain={arcMainnet}
          appInfo={{
            appName: "arcdot.",
            learnMoreUrl: "https://docs.arc.io",
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
