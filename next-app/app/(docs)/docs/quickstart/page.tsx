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
import { agentInstallCommands } from "@/lib/agent/install";

export const metadata = { title: "Quickstart" };

export default function DocsQuickstartPage() {
  return (
    <DocsProse
      pathname="/docs/quickstart"
      title="Quickstart"
      eyebrow="Get started"
      description="Create a local agent wallet, fund it, then unlock a service — from your IDE or the CLI."
    >
      <DocsCallout title="Buyer path">
        <Link href="/hub" className="underline underline-offset-4">
          Hub → Get started
        </Link>{" "}
        walks create → fund → connect IDE. No project{" "}
        <code>npm install</code> for MCP IDE chat.
      </DocsCallout>

      <DocsH2>1. Create + fund the agent wallet</DocsH2>
      <DocsOl>
        <li>
          <code className="font-mono text-sm">
            {agentInstallCommands.npxWalletCreate}
          </code>
        </li>
        <li>
          Fund the printed address via{" "}
          <Link href="/fund" className="underline underline-offset-4">
            /fund
          </Link>{" "}
          (~0.05 USDC on Arc — not other networks).
        </li>
      </DocsOl>

      <DocsH2>2. Unlock from your IDE</DocsH2>
      <DocsP>
        Paste the MCP proxy from{" "}
        <Link href="/hub/editors" className="underline underline-offset-4">
          Connect IDE
        </Link>
        into Cursor, VS Code, Claude Desktop, Windsurf, or another stdio MCP
        client, then ask your agent to discover and unlock a service. The proxy
        settles payment from your local wallet.
      </DocsP>

      <DocsH2>3. Or unlock from the CLI</DocsH2>
      <CodeBlock
        title="bash"
        code={`${agentInstallCommands.npxWalletCreate}
# fund on /fund, then:
${agentInstallCommands.npxUnlock("$ORIGIN")}`}
      />

      <DocsH2>Optional: browse the catalog</DocsH2>
      <CodeBlock
        title="bash"
        code={`curl -s "$ORIGIN/api/services" | jq '.services[] | {slug, price_usdc, seller}'`}
      />

      <DocsH2>Rehearsal only</DocsH2>
      <DocsUl>
        <li>
          <Link href="/console" className="underline underline-offset-4">
            Console
          </Link>{" "}
          — demo unlock when configured (not production pay)
        </li>
      </DocsUl>

      <DocsH2>Next</DocsH2>
      <DocsP>
        <Link href="/docs/agents/client" className="underline underline-offset-4">
          Agent client
        </Link>{" "}
        ·{" "}
        <Link href="/docs/mcp" className="underline underline-offset-4">
          MCP
        </Link>{" "}
        ·{" "}
        <Link href="/docs/payment" className="underline underline-offset-4">
          Payment on Arc
        </Link>
      </DocsP>
    </DocsProse>
  );
}
