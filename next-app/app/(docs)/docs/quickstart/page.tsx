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
      description="Call the live arcdot. host — discover the catalog, then unlock a service. No repo clone required."
    >
      <DocsCallout title="Buyer client">
        Install from GitHub:{" "}
        <code>{agentInstallCommands.npxWalletCreate}</code>. Full guide:{" "}
        <Link href="/docs/agents/client" className="underline underline-offset-4">
          Agent client
        </Link>
        .
      </DocsCallout>

      <DocsH2>1. Discover the catalog</DocsH2>
      <DocsP>
        Against your deployed arcdot. origin, fetch the machine-readable catalog.
        Replace <code className="font-mono text-sm">$ORIGIN</code> with your
        host (the same origin as this docs site when you are on production).
      </DocsP>
      <CodeBlock
        title="bash"
        code={`curl -s "$ORIGIN/api/services" | jq '.services[] | {slug, price_usdc, seller}'`}
      />
      <DocsP>
        Or start from discovery manifests:{" "}
        <code className="font-mono text-sm">
          $ORIGIN/.well-known/arcdot.json
        </code>
        .
      </DocsP>

      <DocsH2>2. Unlock (agents)</DocsH2>
      <DocsOl>
        <li>
          Create a buyer wallet (see{" "}
          <Link href="/hub#install" className="underline underline-offset-4">
            Hub → Install
          </Link>
          ).
        </li>
        <li>Fund that address with native USDC on Arc (chain 5042).</li>
        <li>Auto-settle unlock — no manual deposit script:</li>
      </DocsOl>
      <CodeBlock
        title="bash"
        code={`${agentInstallCommands.npxWalletCreate}
# fund the printed address on Arc, then:
${agentInstallCommands.npxUnlock("$ORIGIN")}`}
      />

      <DocsH2>3. Optional: human rehearsal</DocsH2>
      <DocsUl>
        <li>
          <Link href="/console" className="underline underline-offset-4">
            Console
          </Link>{" "}
          — sandbox terminal (demo unlock when configured; not production pay)
        </li>
        <li>
          <Link href="/hub" className="underline underline-offset-4">
            MCP Hub
          </Link>{" "}
          — connect Cursor / LangChain and attach your agent wallet
        </li>
      </DocsUl>

      <DocsH2>Next</DocsH2>
      <DocsP>
        Deep dive:{" "}
        <Link href="/docs/agents" className="underline underline-offset-4">
          For agents
        </Link>{" "}
        ·{" "}
        <Link href="/docs/api/gateway" className="underline underline-offset-4">
          Unlock API
        </Link>{" "}
        ·{" "}
        <Link href="/docs/payment" className="underline underline-offset-4">
          Payment on Arc
        </Link>
      </DocsP>
    </DocsProse>
  );
}
