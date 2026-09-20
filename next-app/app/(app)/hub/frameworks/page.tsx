import type { Metadata } from "next";
import { HubFrameworks } from "@/components/hub/HubFrameworks";

export const metadata: Metadata = {
  title: "Frameworks · MCP Hub",
  description:
    "Wire Python, LangChain, CrewAI, and curl into arcdot. paid tools.",
};

export default function HubFrameworksPage() {
  return <HubFrameworks />;
}
