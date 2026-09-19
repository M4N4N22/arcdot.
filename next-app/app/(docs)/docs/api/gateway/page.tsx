import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";
import {
  DocsH2,
  DocsP,
  DocsProse,
  DocsUl,
} from "@/components/docs/DocsProse";

export const metadata = { title: "API: Unlock" };

export default function DocsApiGatewayPage() {
  return (
    <DocsProse
      pathname="/docs/api/gateway"
      title="API: Unlock"
      description="POST /api/gateway — verify Arc settlement and return the service reply."
    >
      <DocsH2>Request</DocsH2>
      <CodeBlock
        title="http"
        code={`POST $ORIGIN/api/gateway
Content-Type: application/json
X-Arc-Tx-Hash: 0x…          # payment transaction
X-Arc-Address: 0x…          # payer wallet
X-Arc-Signature: 0x…        # EIP-191 over gateway challenge

{
  "service": "quick-brief",
  "input": { "prompt": "Your request" },
  "clientRequestId": "optional-id",
  "auth": {
    "issuedAt": 1710000000,
    "expiresAt": 1710000120
  }
}`}
      />
      <DocsP>
        Build the challenge with the gateway client helpers (
        <code className="font-mono text-sm">buildGatewayAuthMessage</code> /{" "}
        <code className="font-mono text-sm">getAuthChallengeText</code>). The
        signature proves the payer controls the wallet that settled on Arc.
      </DocsP>

      <DocsH2>Success</DocsH2>
      <DocsP>
        HTTP 200 with <code className="font-mono text-sm">settlement</code> +{" "}
        <code className="font-mono text-sm">result</code>. See{" "}
        <Link href="/docs/errors" className="underline underline-offset-4 text-foreground">
          Responses & errors
        </Link>
        .
      </DocsP>

      <DocsH2>Payment required</DocsH2>
      <DocsUl>
        <li>HTTP 402</li>
        <li>
          Body <code className="font-mono text-sm">error.payment</code> (+{" "}
          <code className="font-mono text-sm">x402</code>)
        </li>
        <li>
          Header <code className="font-mono text-sm">PAYMENT-REQUIRED</code>
        </li>
      </DocsUl>
      <DocsP>
        Full negotiation notes:{" "}
        <Link href="/docs/api/x402" className="underline underline-offset-4 text-foreground">
          x402
        </Link>
        .
      </DocsP>
    </DocsProse>
  );
}
