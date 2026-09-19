import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";
import {
  DocsCallout,
  DocsH2,
  DocsP,
  DocsProse,
  DocsUl,
} from "@/components/docs/DocsProse";
import {
  AGENT_GIT_PACKAGE,
  AGENT_GITHUB_URL,
  agentInstallCommands,
  agentMcpProxyConfig,
} from "@/lib/agent/install";

export const metadata = { title: "Agent client" };

export default function DocsAgentClientPage() {
  return (
    <DocsProse
      pathname="/docs/agents/client"
      title="Agent client"
      eyebrow="Agents"
      description="Install @arcdot/agent from GitHub — wallet, auto-settle, and MCP proxy without cloning this repo."
    >
      <DocsCallout title="GitHub-only for now">
        npm publish comes later. Until then, install from{" "}
        <a
          href={AGENT_GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          {AGENT_GITHUB_URL.replace("https://", "")}
        </a>
        .
      </DocsCallout>

      <DocsH2>Install</DocsH2>
      <CodeBlock
        title="bash"
        code={`# one-shot CLI
${agentInstallCommands.npxWalletCreate}

# as a dependency
${agentInstallCommands.npmInstall}

# package: ${AGENT_GIT_PACKAGE}`}
      />

      <DocsH2>Wallet + unlock</DocsH2>
      <CodeBlock
        title="bash"
        code={`${agentInstallCommands.npxWalletCreate}
# fund the address on Arc Mainnet (5042), then:
npx --yes --package="${AGENT_GIT_PACKAGE}" arcdot unlock --origin "$ORIGIN" --service <slug> --prompt "Your prompt"`}
      />
      <DocsP>
        SDK:{" "}
        <code className="font-mono text-sm">createArcdotAgent</code> from{" "}
        <code className="font-mono text-sm">@arcdot/agent</code> —{" "}
        <code className="font-mono text-sm">unlock</code> and{" "}
        <code className="font-mono text-sm">callMcpTool</code> auto-settle.
      </DocsP>

      <DocsH2>Cursor MCP proxy</DocsH2>
      <DocsP>
        Do not paste the raw remote{" "}
        <code className="font-mono text-sm">/api/mcp</code> URL if you need
        paid tools. Use the local proxy from{" "}
        <Link href="/hub" className="underline underline-offset-4">
          MCP Hub
        </Link>
        :
      </DocsP>
      <CodeBlock
        title="mcp.json"
        code={agentMcpProxyConfig("$ORIGIN")}
      />

      <DocsH2>Clone + link (contributors)</DocsH2>
      <CodeBlock title="bash" code={agentInstallCommands.cloneLink} />

      <DocsH2>Probe a host</DocsH2>
      <DocsP>
        From this monorepo (contributors): confirms well-known, health, catalog,
        and payment-needed instructions:
      </DocsP>
      <CodeBlock title="bash" code={`npm run agent:probe -- "$ORIGIN"`} />

      <DocsH2>Paid but failed</DocsH2>
      <DocsP>
        If settlement succeeded but the upstream reply failed, follow unlock
        credit rules in the gateway docs — do not double-pay.
      </DocsP>
      <DocsUl>
        <li>
          <Link
            href="/docs/api/gateway"
            className="underline underline-offset-4"
          >
            Unlock API
          </Link>
        </li>
        <li>
          <Link href="/docs/errors" className="underline underline-offset-4">
            Errors
          </Link>
        </li>
      </DocsUl>
    </DocsProse>
  );
}
