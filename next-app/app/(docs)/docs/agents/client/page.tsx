import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";
import {
  DocsCallout,
  DocsH2,
  DocsOl,
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
      description="Local buyer client (@arcdot/agent): wallet, auto-settle, MCP proxy. Keys never leave your machine."
    >
      <DocsCallout title="IDE vs Frameworks">
        <strong className="font-medium text-foreground">
          Any stdio MCP IDE
        </strong>{" "}
        (Cursor, VS Code, Claude Desktop, Windsurf, …): use <code>npx</code>{" "}
        only — no project <code>npm install</code>.{" "}
        <strong className="font-medium text-foreground">Frameworks / SDK:</strong>{" "}
        then <code>npm install {AGENT_NPM_PACKAGE}</code>. Hub walkthrough:{" "}
        <Link href="/hub" className="underline underline-offset-4">
          Get started
        </Link>
        .
      </DocsCallout>

      <DocsH2>1. Create a wallet</DocsH2>
      <DocsP>
        One command. Saves to <code className="font-mono text-sm">~/.arcdot/wallet.json</code>.
        Back up the recovery key it prints.
      </DocsP>
      <CodeBlock title="bash" code={agentInstallCommands.npxWalletCreate} />

      <DocsH2>2. Fund</DocsH2>
      <DocsOl>
        <li>
          Open{" "}
          <Link href="/fund" className="underline underline-offset-4">
            /fund
          </Link>{" "}
          and paste the printed address (or use the deep link with{" "}
          <code className="font-mono text-sm">?address=</code>).
        </li>
        <li>Send about 0.05 USDC on Arc (not other networks).</li>
        <li>
          Optional check:{" "}
          <code className="font-mono text-sm">
            {agentInstallCommands.npxWalletStatus}
          </code>
        </li>
      </DocsOl>

      <DocsH2>3a. IDE — MCP proxy</DocsH2>
      <DocsP>
        Do not paste the raw remote{" "}
        <code className="font-mono text-sm">/api/mcp</code> URL if you need
        auto-pay. Use the local proxy in any stdio MCP host (
        <code className="font-mono text-sm">npx</code> runs the client):
      </DocsP>
      <CodeBlock title="mcp.json" code={agentMcpProxyConfig("$ORIGIN")} />
      <DocsUl>
        <li>Wallet keys stay on the buyer machine</li>
        <li>Proxy settles Arc payments, then forwards tool calls</li>
        <li>
          Copy-ready UI:{" "}
          <Link href="/hub/editors" className="underline underline-offset-4">
            Hub → Connect IDE
          </Link>
        </li>
      </DocsUl>

      <DocsH2>3b. CLI unlock</DocsH2>
      <CodeBlock
        title="bash"
        code={`${agentInstallCommands.npxUnlock("$ORIGIN").replace("quick-brief", "<slug>")}`}
      />

      <DocsH2>3c. Frameworks / SDK (optional)</DocsH2>
      <DocsP>
        Only when you import the package in Node/Python wrappers:
      </DocsP>
      <CodeBlock title="bash" code={agentInstallCommands.npmInstall} />
      <DocsP>
        SDK: <code className="font-mono text-sm">createArcdotAgent</code> —{" "}
        <code className="font-mono text-sm">unlock</code> and{" "}
        <code className="font-mono text-sm">callMcpTool</code> auto-settle from
        the same local wallet.
      </DocsP>

      <DocsH2>Package</DocsH2>
      <DocsP>
        <a
          href={`https://www.npmjs.com/package/${AGENT_NPM_PACKAGE}`}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          {AGENT_NPM_PACKAGE}
        </a>{" "}
        on npm.
      </DocsP>
    </DocsProse>
  );
}
