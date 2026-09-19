import { CodeBlock } from "@/components/docs/CodeBlock";
import {
  DocsH2,
  DocsP,
  DocsProse,
  DocsUl,
} from "@/components/docs/DocsProse";

export const metadata = { title: "Responses & errors" };

export default function DocsErrorsPage() {
  return (
    <DocsProse
      pathname="/docs/errors"
      title="Responses & errors"
      description="What successful unlocks and payment-required failures look like."
    >
      <DocsH2>Success — HTTP 200</DocsH2>
      <CodeBlock
        title="json"
        code={`{
  "ok": true,
  "status": 200,
  "settlement": {
    "txHash": "0x…",
    "payer": "0x…",
    "amountWei": "…",
    "amountUsdc": "0.01",
    "paymentId": "0x…",
    "blockNumber": 123,
    "verifiedAt": "…"
  },
  "result": { "text": "…" },
  "meta": {
    "requestId": "…",
    "service": "quick-brief",
    "mock": false,
    "demo": false
  }
}`}
      />

      <DocsH2>Payment required — HTTP 402</DocsH2>
      <DocsP>
        Missing or invalid payment returns a structured{" "}
        <code className="font-mono text-sm">error.payment</code> object: gateway,
        seller, feeWei, feeUsdc, rpcUrl, unlockPath, auth type — plus x402
        headers. Agents should follow that object rather than HTML.
      </DocsP>

      <DocsH2>Other codes</DocsH2>
      <DocsUl>
        <li>Paused or missing service</li>
        <li>Amount mismatch / wrong seller</li>
        <li>Replayed transaction</li>
        <li>Invalid signature</li>
        <li>Rate limited / upstream failure</li>
      </DocsUl>
      <DocsP>
        Machine codes live in the gateway error union (e.g.{" "}
        <code className="font-mono text-sm">SERVICE_PAUSED</code>,{" "}
        <code className="font-mono text-sm">TX_ALREADY_CONSUMED</code>).
      </DocsP>
    </DocsProse>
  );
}
