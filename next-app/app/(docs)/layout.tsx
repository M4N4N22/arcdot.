import type { Metadata } from "next";
import { DocsLayoutClient } from "@/components/docs/DocsLayout";

export const metadata: Metadata = {
  title: {
    default: "Documentation — arcdot.",
    template: "%s — arcdot. docs",
  },
  description:
    "How agents discover, pay, and unlock gated APIs on Arc — and how sellers publish on arcdot.",
};

export default function DocsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocsLayoutClient>{children}</DocsLayoutClient>;
}
