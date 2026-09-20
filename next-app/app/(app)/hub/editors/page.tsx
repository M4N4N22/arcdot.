import type { Metadata } from "next";
import { HubEditors } from "@/components/hub/HubEditors";

export const metadata: Metadata = {
  title: "Connect IDE · Hub",
  description:
    "Paste the local MCP proxy for Cursor and other IDEs — auto-settle from your funded agent wallet.",
};

export default function HubEditorsPage() {
  return <HubEditors />;
}
