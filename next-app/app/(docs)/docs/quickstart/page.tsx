import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";
import {
  DocsH2,
  DocsOl,
  DocsP,
  DocsProse,
  DocsUl,
} from "@/components/docs/DocsProse";

export const metadata = { title: "Quickstart" };

export default function DocsQuickstartPage() {
  return (
    <DocsProse
      pathname="/docs/quickstart"
      title="Quickstart"
      description="Call the live arcdot. host — discover the catalog, then unlock a service. No repo clone required."
    >
      <DocsH2>1. Discover the catalog</DocsH2>
      <DocsP>
        Against your deployed arcdot. origin, fetch the machine-readable catalog.
        Replace <code className="font-mono text-sm text-foreground">$ORIGIN</code>{" "}
        with your host (the same origin as this docs site when you are on
        production).
      </DocsP>
      <CodeBlock
        title="bash"
        code={`curl -s "$ORIGIN/api/services" | jq '.services[] | {slug, price_usdc, seller}'`}
      />
      <DocsP>
        Or start from discovery manifests:{" "}
        <code className="font-mono text-sm text-foreground">
          $ORIGIN/.well-known/arcdot.json
        </code>
        .
      </DocsP>

      <DocsH2>2. Unlock (agents)</DocsH2>
      <DocsOl>
        <li>
          Create a buyer wallet:{" "}
          <code className="font-mono text-sm">
            npx @arcdot/agent wallet create
          </code>{" "}
          (see{" "}
          <Link href="/hub#wallet" className="underline underline-offset-4">
            Hub
          </Link>
          ).
        </li>
        <li>Fund that address with native USDC on Arc (chain 5042).</li>
        <li>
          Auto-settle unlock — no manual deposit script:
        </li>
      </DocsOl>
      <CodeBlock
        title="bash"
        code={`npx @arcdot/agent wallet create
# fund the printed address on Arc, then:
npx @arcdot/agent unlock --origin "$ORIGIN" --service quick-brief --prompt "Summarize in one line"`}
      />

      <DocsH2>3. Optional: human rehearsal</DocsH2>
      <DocsUl>
        <li>
          <Link href="/console" className="underline underline-offset-4 text-foreground">
            Console
          </Link>{" "}
          — sandbox terminal (demo unlock when configured; not production pay)
        </li>
        <li>
          <Link href="/hub" className="underline underline-offset-4 text-foreground">
            MCP Hub
          </Link>{" "}
          — connect Cursor / LangChain and attach your agent wallet
        </li>
      </DocsUl>

      <DocsH2>Next</DocsH2>
      <DocsP>
        Deep dive:{" "}
        <Link href="/docs/agents" className="underline underline-offset-4 text-foreground">
          For agents
        </Link>{" "}
        ·{" "}
        <Link href="/docs/api/gateway" className="underline underline-offset-4 text-foreground">
          Unlock API
        </Link>{" "}
        ·{" "}
        <Link href="/docs/payment" className="underline underline-offset-4 text-foreground">
          Payment on Arc
        </Link>
      </DocsP>
    </DocsProse>
  );
}
