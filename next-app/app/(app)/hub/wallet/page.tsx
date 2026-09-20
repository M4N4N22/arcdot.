import type { Metadata } from "next";
import { HubWallet } from "@/components/hub/HubWallet";

export const metadata: Metadata = {
  title: "Agent wallet · MCP Hub",
  description:
    "Create and fund a local buyer wallet so agents can settle paid tools on arcdot.",
};

export default function HubWalletPage() {
  return <HubWallet />;
}
