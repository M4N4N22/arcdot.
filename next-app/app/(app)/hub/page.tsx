import type { Metadata } from "next";
import { McpHub } from "@/components/hub/McpHub";

export const metadata: Metadata = {
  title: "MCP Hub",
  description:
    "Connect any MCP client to the arcdot. server — paid tools unlock with USDC on Arc.",
};

export default function HubPage() {
  return <McpHub />;
}
