import type { Metadata } from "next";
import { HubConfig } from "@/components/hub/HubConfig";

export const metadata: Metadata = {
  title: "Advanced · Hub",
  description:
    "Machine-readable MCP descriptor for scripts and custom clients. Prefer Connect IDE for chat hosts.",
};

export default function HubConfigPage() {
  return <HubConfig />;
}
