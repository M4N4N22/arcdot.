"use client";

import Link from "next/link";
import { UsdcOnArcMark } from "@/components/brand/UsdcOnArcMark";
import { CopyButton } from "@/components/hub/CopyButton";
import { HubCodePanel } from "@/components/hub/HubCodePanel";
import {
  HubCallout,
  HubContinue,
  HubH2,
  HubP,
} from "@/components/hub/HubProse";
import { HubShell } from "@/components/hub/HubShell";
import { useHubOrigin } from "@/components/hub/useHubOrigin";
import {
  AGENT_GITHUB_URL,
  agentInstallCommands,
  agentMcpProxyConfig,
} from "@/lib/agent/install";
import { BUYER_STEPS } from "@/lib/hub/nav";

const WALLET_SETUP_SH = `# A) new wallet (once)
${agentInstallCommands.npxWalletCreate}

# B) already have a key — local terminal only (never paste into chat)
${agentInstallCommands.npxWalletImport}
# or: set ARCDOT_PRIVATE_KEY then
${agentInstallCommands.npxWalletImportFromEnv}

# check
${agentInstallCommands.npxWalletStatus}`;

export function HubInstall() {
  const origin = useHubOrigin();
  const mcpJson = agentMcpProxyConfig(origin);

  return (
    <HubShell
      title="Get started with arcdot."
      description="Three steps: create or import a local agent wallet, fund it with USDC on Arc, connect your IDE. No project install needed for MCP clients."
    >
      <HubCallout title="True path for IDEs">
        <code>npx</code> creates/imports the wallet and runs the MCP proxy.
        Works in Cursor, VS Code, Claude Desktop, Windsurf, and other stdio MCP
        hosts.{" "}
        <strong className="font-medium text-foreground">
          npm install is only for Frameworks / SDK code
        </strong>
        — not required to chat with paid tools in your IDE. Full guide:{" "}
        <Link href="/docs/agents/client">Agent client</Link>.
      </HubCallout>

      <ol className="mt-2 grid gap-3 sm:grid-cols-3">
        {BUYER_STEPS.map((step) => (
          <li
            key={step.n}
            className="rounded-xl border border-line bg-surface/60 px-4 py-4"
          >
            <p className="font-mono text-xs text-muted">{step.n}</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {step.title}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              {step.body}
            </p>
            <Link
              href={step.href}
              className="mt-3 inline-block text-[13px] font-medium text-foreground underline underline-offset-4"
            >
              Open →
            </Link>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-wrap items-center gap-2.5">
        <CopyButton
          value={agentInstallCommands.npxWalletCreate}
          label="Copy: create"
          variant="primary"
          className="h-10 rounded-lg px-5 text-sm"
        />
        <CopyButton
          value={agentInstallCommands.npxWalletImport}
          label="Copy: import"
          variant="soft"
          className="h-10 rounded-lg px-5 text-sm"
        />
        <Link
          href="/fund"
          className="inline-flex h-10 items-center rounded-lg border border-line bg-surface px-5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
        >
          Fund
        </Link>
        <Link
          href="/hub/editors"
          className="inline-flex h-10 items-center rounded-lg border border-line bg-surface px-5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
        >
          Connect IDE
        </Link>
        <a
          href={AGENT_GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center px-3 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          GitHub
        </a>
      </div>

      <HubH2>1. Create or import a wallet</HubH2>
      <HubP>
        Pick one. Both save to <code>~/.arcdot/wallet.json</code> on your
        machine. Back up create’s recovery key. Import runs in your own
        terminal — never paste a private key into chat or this site. More
        detail: <Link href="/hub/wallet">Wallet help</Link>.
      </HubP>
      <HubCodePanel
        title="bash"
        filename="wallet-setup.sh"
        code={WALLET_SETUP_SH}
        accentCopy
      />

      <HubH2>2. Fund it</HubH2>
      <div className="mb-2">
        <UsdcOnArcMark size="sm" />
      </div>
      <HubP>
        Paste the wallet address on <Link href="/fund">/fund</Link>, send about{" "}
        <strong className="font-medium text-foreground">0.05 USDC on Arc</strong>
        , then refresh balance. Other networks will not credit this wallet.
        Skip if you imported an already-funded address.
      </HubP>

      <HubH2>3. Connect your IDE</HubH2>
      <HubP>
        Paste this into your IDE’s MCP settings (or see{" "}
        <Link href="/hub/editors">Connect IDE</Link> for a walkthrough). The
        proxy auto-pays from your local wallet — do not use the raw{" "}
        <code>/api/mcp</code> URL if you want auto-settle.
      </HubP>
      <HubCodePanel
        title="mcp.json"
        filename="mcp.json"
        code={mcpJson}
        accentCopy
      />

      <HubH2>Optional: Frameworks / SDK</HubH2>
      <HubP>
        Building a LangChain bot or importing in Node? Then install the package
        in your project — see <Link href="/hub/frameworks">Frameworks</Link>.
      </HubP>
      <HubCodePanel
        title="bash"
        filename="optional-sdk.sh"
        code={`# only if you import @arcdot/agent in code\n${agentInstallCommands.npmInstall}`}
        accentCopy
      />

      <HubContinue
        links={[
          {
            href: "/hub/wallet",
            title: "Wallet help",
            description: "Create, import, fund, and backup.",
          },
          {
            href: "/fund",
            title: "Fund",
            description: "QR, live balance, backup reminder.",
          },
          {
            href: "/hub/editors",
            title: "Connect IDE",
            description: "Paste the stdio MCP proxy into your IDE.",
          },
        ]}
      />
    </HubShell>
  );
}
