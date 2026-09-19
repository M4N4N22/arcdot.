import type { Metadata } from "next";
import { McpHub } from "@/components/hub/McpHub";

export const metadata: Metadata = {
  title: "MCP Hub",
  description:
    "Connect Cursor, VS Code, or agent frameworks to the arcdot. MCP server — paid tools unlock with USDC on Arc.",
};

export default function HubPage() {
  return <McpHub />;
}
