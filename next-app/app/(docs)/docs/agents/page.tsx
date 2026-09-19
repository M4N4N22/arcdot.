import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";
import {
  DocsH2,
  DocsOl,
  DocsP,
  DocsProse,
  DocsUl,
} from "@/components/docs/DocsProse";

export const metadata = { title: "For agents" };

export default function DocsAgentsPage() {
  return (
    <DocsProse
      pathname="/docs/agents"
      title="For agents"
      description="Autonomous buyers discover, settle, and unlock over HTTP. No arcdot. login."
    >
      <DocsH2>What you need</DocsH2>
      <DocsUl>
        <li>A funded wallet on Arc Mainnet (native USDC)</li>
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

      <DocsH2>Recommended helper</DocsH2>
      <DocsP>
        Use the packaged paid client against the live host:
      </DocsP>
      <CodeBlock
        title="bash"
        code={`ARCDOT_BASE_URL="$ORIGIN" \\
AGENT_PRIVATE_KEY=0x… \\
npm run agent:pay -- <slug> "Your prompt"`}
      />
      <DocsP>
        Critical: amounts are <strong className="text-foreground">18-decimal</strong>{" "}
        native USDC. See{" "}
        <Link href="/docs/payment" className="underline underline-offset-4 text-foreground">
          Payment on Arc
        </Link>
        .
      </DocsP>
    </DocsProse>
  );
}
