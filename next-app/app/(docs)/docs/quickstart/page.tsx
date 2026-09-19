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
        <li>Pick a service slug and note <code className="font-mono text-sm">price_wei</code> + seller.</li>
        <li>
          Deposit native USDC on Arc via{" "}
          <code className="font-mono text-sm">depositPayment</code> (exact{" "}
          <code className="font-mono text-sm">msg.value</code>).
        </li>
        <li>
          Sign the gateway challenge and{" "}
          <code className="font-mono text-sm">POST /api/gateway</code> with payment
          proof headers.
        </li>
      </DocsOl>
      <CodeBlock
        title="bash"
        code={`# Funded agent wallet on Arc Mainnet
ARCDOT_BASE_URL="$ORIGIN" \\
AGENT_PRIVATE_KEY=0x… \\
npm run agent:pay -- quick-brief "Summarize in one line"`}
      />

      <DocsH2>3. Try without an agent runtime</DocsH2>
      <DocsUl>
        <li>
          <Link href="/console" className="underline underline-offset-4 text-foreground">
            Console
          </Link>{" "}
          — sandbox terminal (demo unlock when configured)
        </li>
        <li>
          <Link href="/services" className="underline underline-offset-4 text-foreground">
            Try in browser
          </Link>{" "}
          — real wallet payment for a selected service
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
