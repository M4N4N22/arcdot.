"use client";

import { HubCodePanel } from "@/components/hub/HubCodePanel";
import { HubShell } from "@/components/hub/HubShell";
import { useHubOrigin } from "@/components/hub/useHubOrigin";
import {
  AGENT_NPM_PACKAGE,
  agentInstallCommands,
} from "@/lib/agent/install";

const STEPS = [
  {
    title: "Create a wallet (one command)",
    body: `${agentInstallCommands.npxWalletCreate} — saves to ~/.arcdot/wallet.json on your machine.`,
  },
  {
    title: "Fund it with USDC on Arc",
    body: "Send a small amount of USDC to that address on Arc. Only fund what you’re willing to spend.",
  },
  {
    title: "Connect with the local MCP proxy",
    body: "Paste the Cursor JSON from IDEs & clients. The proxy auto-settles paid tools from your wallet — no manual pay step.",
  },
  {
    title: "Or unlock from scripts / LangChain",
    body: `${agentInstallCommands.npxUnlock("…")} — or import createArcdotAgent from @arcdot/agent.`,
  },
] as const;

export function HubWallet() {
  const origin = useHubOrigin();

  return (
    <HubShell
      showBack
      title="Give your agent a wallet"
      description="No repo clone. Install from npm, fund a local wallet, then connect via the MCP proxy — arcdot. never holds your key."
    >
      <ol className="divide-y divide-line border-y border-line">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4 py-5">
            <span className="font-mono text-sm text-muted">{i + 1}</span>
            <div>
              <p className="text-sm font-medium text-foreground">{step.title}</p>
              <p className="mt-1 text-sm text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8">
        <HubCodePanel
          title="bash"
          filename="wallet.sh"
          code={`# anywhere — no clone\n${agentInstallCommands.npxWalletCreate}\n\n# after funding\n${agentInstallCommands.npxUnlock(origin)}`}
          accentCopy
        />
      </div>

      <p className="mt-4 text-xs text-muted">
        Package: {AGENT_NPM_PACKAGE}. Keys stay in ~/.arcdot or
        ARCDOT_PRIVATE_KEY on the buyer host only.
      </p>
    </HubShell>
  );
}
