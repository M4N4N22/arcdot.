import type { Metadata } from "next";
import { HubFrameworks } from "@/components/hub/HubFrameworks";

export const metadata: Metadata = {
  title: "Frameworks · Hub",
  description:
    "Install @arcdot/agent in your project for LangChain, Python, and scripts — not required for IDE MCP chat.",
};

export default function HubFrameworksPage() {
  return <HubFrameworks />;
}
