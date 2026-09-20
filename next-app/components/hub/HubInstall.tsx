"use client";

import Link from "next/link";
import { CopyButton } from "@/components/hub/CopyButton";
import { HubCodePanel } from "@/components/hub/HubCodePanel";
import { HubShell } from "@/components/hub/HubShell";
import { useHubOrigin } from "@/components/hub/useHubOrigin";
import {
  AGENT_GITHUB_URL,
  AGENT_NPM_PACKAGE,
  agentInstallCommands,
} from "@/lib/agent/install";
import { mcpEndpoint } from "@/lib/hub/mcpConfig";

export function HubInstall() {
  const origin = useHubOrigin();
  const endpoint = mcpEndpoint(origin);

  return (
    <HubShell
      title="Connect any MCP client"
      description="Point editors and frameworks at arcdot. with @arcdot/agent from npm — local wallet, auto-settle, no API keys on our server."
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <CopyButton
          value={agentInstallCommands.npxWalletCreate}
          label="Copy install"
          variant="primary"
          className="h-10 rounded-none px-5 text-sm"
        />
        <CopyButton
          value={endpoint}
          label="Copy MCP link"
          variant="soft"
          className="h-10 rounded-none px-5 text-sm"
        />
        <Link
          href="/docs/agents/client"
          className="inline-flex h-10 items-center border border-line bg-surface px-5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
        >
          Install guide
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

      <p className="mt-4 break-all font-mono text-[11px] text-muted">
        {endpoint}
      </p>

      <section className="mt-12">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
          Install buyer client
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Distributed from npm. One command creates a local wallet — no clone
          required for day-to-day use.
        </p>

        <div className="mt-6">
          <HubCodePanel
            title="bash"
            filename="install.sh"
            code={`# Create wallet\n${agentInstallCommands.npxWalletCreate}\n\n# Add as a dependency\n${agentInstallCommands.npmInstall}\n\n# Package: ${AGENT_NPM_PACKAGE}`}
            accentCopy
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <CopyButton
            value={agentInstallCommands.npxWalletCreate}
            label="Copy wallet create"
            variant="primary"
            className="h-10 rounded-none px-4 text-sm"
          />
          <CopyButton
            value={agentInstallCommands.npmInstall}
            label="Copy npm install"
            variant="soft"
            className="h-10 rounded-none px-4 text-sm"
          />
          <Link
            href="/docs/agents/client"
            className="inline-flex h-10 items-center px-3 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Full install docs
          </Link>
        </div>
      </section>

      <footer className="mt-14 border-t border-line pt-8">
        <p className="text-sm text-muted">Continue</p>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          <li>
            <Link
              href="/docs"
              className="group flex items-baseline justify-between gap-4 py-4"
            >
              <div>
                <p className="font-medium group-hover:underline group-hover:underline-offset-4">
                  See docs
                </p>
                <p className="mt-1 text-sm text-muted">
                  Guides, API shapes, and payment on Arc.
                </p>
              </div>
              <span className="text-sm text-muted">→</span>
            </Link>
          </li>
          <li>
            <Link
              href="/services"
              className="group flex items-baseline justify-between gap-4 py-4"
            >
              <div>
                <p className="font-medium group-hover:underline group-hover:underline-offset-4">
                  Browse tools
                </p>
                <p className="mt-1 text-sm text-muted">
                  See what&apos;s live on the network.
                </p>
              </div>
              <span className="text-sm text-muted">→</span>
            </Link>
          </li>
          <li>
            <Link
              href="/create"
              className="group flex items-baseline justify-between gap-4 py-4"
            >
              <div>
                <p className="font-medium group-hover:underline group-hover:underline-offset-4">
                  Publish a tool
                </p>
                <p className="mt-1 text-sm text-muted">
                  List your endpoint and earn USDC.
                </p>
              </div>
              <span className="text-sm text-muted">→</span>
            </Link>
          </li>
        </ul>
      </footer>
    </HubShell>
  );
}
