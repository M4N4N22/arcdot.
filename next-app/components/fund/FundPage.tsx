"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { UsdcOnArcMark } from "@/components/brand/UsdcOnArcMark";
import { AgentFundPanel } from "@/components/fund/AgentFundPanel";
import { AgentWalletBackupHint } from "@/components/fund/AgentWalletBackupHint";
import { CopyButton } from "@/components/hub/CopyButton";
import { HubCodePanel } from "@/components/hub/HubCodePanel";
import {
  HubCallout,
  HubContinue,
  HubH2,
  HubP,
} from "@/components/hub/HubProse";
import { HubShell } from "@/components/hub/HubShell";
import { agentInstallCommands } from "@/lib/agent/install";

function FundPageInner() {
  const search = useSearchParams();
  const addressParam = search.get("address");

  return (
    <HubShell
      showBack
      title="Fund your agent"
      description="Top up the local agent wallet with USDC on Arc so unlocks can settle. This page only needs the address — never a private key."
      eyebrow="Step 2 of 3"
    >
      <div className="mb-2">
        <UsdcOnArcMark size="lg" />
      </div>

      <HubCallout title="Came from MCP?">
        Keep the address from the link or message, send about{" "}
        <strong className="font-medium text-foreground">
          0.05 USDC on Arc
        </strong>
        , refresh balance, then retry unlock in your IDE.
      </HubCallout>

      <HubH2>Receive USDC on Arc</HubH2>
      <AgentFundPanel initialAddress={addressParam} />
      <AgentWalletBackupHint className="mt-6" />

      <HubH2>No wallet yet?</HubH2>
      <HubP>
        Create one first (step 1), then paste the address above.
      </HubP>
      <HubCodePanel
        title="bash"
        filename="wallet.sh"
        code={`# create (once)\n${agentInstallCommands.npxWalletCreate}\n\n# check funds\n${agentInstallCommands.npxWalletStatus}`}
        accentCopy
      />
      <div className="flex flex-wrap gap-2">
        <CopyButton
          value={agentInstallCommands.npxWalletCreate}
          label="Copy create"
          variant="primary"
          className="h-9 rounded-lg px-4 text-sm"
        />
        <CopyButton
          value={agentInstallCommands.npxWalletStatus}
          label="Copy status"
          variant="soft"
          className="h-9 rounded-lg px-4 text-sm"
        />
        <Link
          href="/hub"
          className="inline-flex h-9 items-center rounded-lg border border-line px-4 text-sm font-medium text-foreground hover:bg-surface-muted"
        >
          Get started
        </Link>
      </div>

      <HubContinue
        links={[
          {
            href: "/hub/editors",
            title: "3. Connect IDE",
            description: "Paste the MCP proxy after funding with USDC on Arc.",
          },
          {
            href: "/hub",
            title: "Get started",
            description: "Full three-step overview.",
          },
        ]}
      />
    </HubShell>
  );
}

export function FundPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-6 py-10 text-muted">
          Loading…
        </main>
      }
    >
      <FundPageInner />
    </Suspense>
  );
}
