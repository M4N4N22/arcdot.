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

export const metadata = { title: "For agents" };

export default function DocsAgentsPage() {
  return (
    <DocsProse
      pathname="/docs/agents"
      title="For agents"
      eyebrow="Guides"
      description="Autonomous buyers discover, settle, and unlock over HTTP. No arcdot. login."
    >
      <DocsCallout title="Skip the hand-roll">
        Prefer the Hub path:{" "}
        <Link href="/hub" className="underline underline-offset-4">
          create or import → fund → connect IDE
        </Link>
        . Or use{" "}
        <Link href="/docs/agents/client" className="underline underline-offset-4">
          @arcdot/agent
        </Link>{" "}
        — auto-settles and runs the local MCP proxy. No project{" "}
        <code>npm install</code> for IDE chat.
      </DocsCallout>
      <DocsH2>What you need</DocsH2>
      <DocsUl>
        <li>A funded wallet on Arc with USDC on Arc (native gas token)</li>
        <li>HTTP access to the live arcdot. origin</li>
        <li>Ability to sign EIP-191 messages and send transactions</li>
      </DocsUl>

      <DocsH2>Loop</DocsH2>
      <DocsOl>
        <li>
          <strong className="text-foreground">Discover</strong> —{" "}
          <code className="font-mono text-sm">GET /api/services</code> or{" "}
          <code className="font-mono text-sm">/.well-known/arcdot.json</code>
        </li>
        <li>
          <strong className="text-foreground">Pay</strong> — call{" "}
          <code className="font-mono text-sm">depositPayment(paymentId, seller)</code>{" "}
          with <code className="font-mono text-sm">msg.value == price_wei</code>
        </li>
        <li>
          <strong className="text-foreground">Unlock</strong> — wait for the
          receipt, sign the challenge,{" "}
          <code className="font-mono text-sm">POST /api/gateway</code>
        </li>
      </DocsOl>

      <DocsH2>If you call unlock unpaid</DocsH2>
      <DocsP>
        The gateway returns <strong className="text-foreground">HTTP 402</strong>{" "}
        with machine-readable payment instructions (JSON + x402{" "}
        <code className="font-mono text-sm">PAYMENT-REQUIRED</code> header). Follow{" "}
        <code className="font-mono text-sm">error.payment</code> — do not scrape the
        website.
      </DocsP>
      <DocsP>
        Details:{" "}
        <Link href="/docs/api/x402" className="underline underline-offset-4 text-foreground">
          x402 negotiation
        </Link>
        .
      </DocsP>

      <DocsH2>Probe first</DocsH2>
      <DocsP>
        Before paying, confirm the host is a live toll booth:
      </DocsP>
      <CodeBlock
        title="bash"
        code={`npm run agent:probe -- "$ORIGIN"`}
      />
      <DocsP>
        Full client notes:{" "}
        <Link
          href="/docs/agents/client"
          className="underline underline-offset-4 text-foreground"
        >
          Agent client
        </Link>
        . MCP tools:{" "}
        <Link
          href="/hub"
          className="underline underline-offset-4 text-foreground"
        >
          MCP Hub
        </Link>
        {" · "}
        <Link
          href="/docs/mcp"
          className="underline underline-offset-4 text-foreground"
        >
          reference
        </Link>
        .
      </DocsP>

      <DocsH2>Recommended: @arcdot/agent</DocsH2>
      <DocsP>
        Buyer client on npm — local wallet, auto-settle, MCP proxy for IDEs.
        Keys never touch the arcdot. server. Create or import → fund → connect
        (no project install for IDE chat):
      </DocsP>
      <CodeBlock
        title="bash"
        code={`${agentInstallCommands.npxWalletCreate}
# or: ${agentInstallCommands.npxWalletImport}
npx --yes ${AGENT_NPM_PACKAGE} unlock --origin "$ORIGIN" --service <slug> --prompt "Your prompt"

# Cursor mcp.json — local proxy (auto-pays):
${agentMcpProxyConfig("$ORIGIN")}`}
      />
      <DocsP>
        Critical: amounts are{" "}
        <strong className="text-foreground">18-decimal</strong> USDC on Arc. See{" "}
        <Link
          href="/docs/payment"
          className="underline underline-offset-4 text-foreground"
        >
          Payment on Arc
        </Link>
        .
      </DocsP>
    </DocsProse>
  );
}
