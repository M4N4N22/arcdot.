import type { Metadata } from "next";
import { HubInstall } from "@/components/hub/HubInstall";

export const metadata: Metadata = {
  title: "Get started · Hub",
  description:
    "Create a local agent wallet, fund it, and connect your IDE — no project install for MCP clients.",
};

export default function HubPage() {
  return <HubInstall />;
}
