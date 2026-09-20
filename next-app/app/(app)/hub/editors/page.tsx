import type { Metadata } from "next";
import { HubEditors } from "@/components/hub/HubEditors";

export const metadata: Metadata = {
  title: "IDEs & clients · MCP Hub",
  description:
    "Connect Cursor, VS Code, and other MCP clients to arcdot. with the local settle proxy.",
};

export default function HubEditorsPage() {
  return <HubEditors />;
}
