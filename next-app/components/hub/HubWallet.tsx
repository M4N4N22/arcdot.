"use client";

import Link from "next/link";
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
import {
  AGENT_NPM_PACKAGE,
  agentInstallCommands,
} from "@/lib/agent/install";

export function HubWallet() {
  return (
    <HubShell
      showBack
      title="Wallet help"
      description="Create or import → fund with USDC on Arc → connect. Same wallet the MCP proxy uses to pay — arcdot. never holds your key."
    >
      <HubCallout title="Prefer the short links?">
        Day-to-day top-ups: <Link href="/fund">/fund</Link>. Full path from
        zero: <Link href="/hub">Get started</Link>.
      </HubCallout>

      <HubH2 id="create">1. Create or import</HubH2>
      <HubP>
        New to arcdot.? Create a wallet (no <code>npm install</code>). Already
        have a funded agent key? Import it locally — never paste the key into
        chat or this website.
      </HubP>
      <HubCodePanel
        title="bash"
        filename="wallet.sh"
        code={`# A) create (once)\n${agentInstallCommands.npxWalletCreate}\n\n# B) import a key you already own (local terminal only)\n${agentInstallCommands.npxWalletImport}\n# or: set ARCDOT_PRIVATE_KEY then\n${agentInstallCommands.npxWalletImportFromEnv}\n\n# check anytime\n${agentInstallCommands.npxWalletStatus}`}
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
          value={agentInstallCommands.npxWalletImport}
          label="Copy import"
          variant="soft"
          className="h-9 rounded-lg px-4 text-sm"
        />
        <CopyButton
          value={agentInstallCommands.npxWalletStatus}
          label="Copy status"
          variant="soft"
          className="h-9 rounded-lg px-4 text-sm"
        />
      </div>

      <HubH2 id="fund">2. Fund with USDC on Arc</HubH2>
      <div className="mb-3">
        <UsdcOnArcMark size="md" />
      </div>
      <HubP>
        Paste the address below (or use <Link href="/fund">/fund</Link>). Send
        about{" "}
        <strong className="font-medium text-foreground">
          0.05 USDC on Arc
        </strong>
        . Other networks will not credit this wallet.
      </HubP>
      <AgentFundPanel />
      <AgentWalletBackupHint className="mt-6" />

      <HubH2 id="connect">3. Connect IDE</HubH2>
      <HubP>
        After the balance shows ready, paste the MCP proxy in{" "}
        <Link href="/hub/editors">Connect IDE</Link>. Unlocks settle from this
        wallet automatically.
      </HubP>

      <p className="mt-6 text-xs text-muted">
        Package: {AGENT_NPM_PACKAGE}. Keys stay in ~/.arcdot or{" "}
        <code className="font-mono">ARCDOT_PRIVATE_KEY</code> on the buyer host
        only.
      </p>

      <HubContinue
        links={[
          {
            href: "/hub",
            title: "Get started",
            description: "Three-step overview with MCP JSON.",
          },
          {
            href: "/hub/editors",
            title: "Connect IDE",
            description: "Paste MCP proxy into your IDE.",
          },
          {
            href: "/fund",
            title: "Fund",
            description: "Short link for USDC on Arc top-ups.",
          },
        ]}
      />
    </HubShell>
  );
}
