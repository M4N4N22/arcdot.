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
  AGENT_NPM_PACKAGE,
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
      description="Install @arcdot/agent from npm — wallet, auto-settle, and MCP proxy without cloning this repo."
    >
      <DocsCallout title="On npm">
        Install{" "}
        <a
          href={`https://www.npmjs.com/package/${AGENT_NPM_PACKAGE}`}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          {AGENT_NPM_PACKAGE}
        </a>{" "}
        with npx or npm.
      </DocsCallout>

      <DocsH2>Install</DocsH2>
      <CodeBlock
        title="bash"
        code={`# one-shot CLI
${agentInstallCommands.npxWalletCreate}

# as a dependency
${agentInstallCommands.npmInstall}`}
      />

      <DocsH2>Wallet + unlock</DocsH2>
      <CodeBlock
        title="bash"
        code={`${agentInstallCommands.npxWalletCreate}
# fund the address on Arc Mainnet (5042), then:
npx --yes ${AGENT_NPM_PACKAGE} unlock --origin "$ORIGIN" --service <slug> --prompt "Your prompt"`}
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
        auto-pay. Use the local proxy:
      </DocsP>
      <CodeBlock title="mcp.json" code={agentMcpProxyConfig("$ORIGIN")} />
      <DocsUl>
        <li>Wallet keys stay on the buyer machine</li>
        <li>Proxy settles Arc payments, then forwards tool calls</li>
        <li>
          Copy the ready-made snippet from{" "}
          <Link href="/hub" className="underline underline-offset-4">
            MCP Hub
          </Link>
        </li>
      </DocsUl>
    </DocsProse>
  );
}
