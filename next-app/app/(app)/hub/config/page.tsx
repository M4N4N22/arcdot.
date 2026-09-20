import type { Metadata } from "next";
import { HubConfig } from "@/components/hub/HubConfig";

export const metadata: Metadata = {
  title: "Universal config · MCP Hub",
  description:
    "One MCP config schema for scripts, CI, SDKs, and custom clients on arcdot.",
};

export default function HubConfigPage() {
  return <HubConfig />;
}
