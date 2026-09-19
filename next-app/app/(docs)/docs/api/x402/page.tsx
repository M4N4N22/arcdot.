import Link from "next/link";
import {
  DocsH2,
  DocsP,
  DocsProse,
  DocsUl,
} from "@/components/docs/DocsProse";

export const metadata = { title: "API: x402" };

export default function DocsApiX402Page() {
  return (
    <DocsProse
      pathname="/docs/api/x402"
      title="x402 negotiation"
      description="How unpaid unlocks advertise payment — and how arcdot. settles on Arc."
    >
      <DocsH2>What you get on 402</DocsH2>
      <DocsUl>
        <li>
          JSON <code className="font-mono text-sm">error.payment</code> +{" "}
          <code className="font-mono text-sm">x402</code>
        </li>
        <li>
          Header{" "}
          <code className="font-mono text-sm">PAYMENT-REQUIRED</code> — base64
          JSON (x402 v2 shape)
        </li>
        <li>
          Convenience headers{" "}
          <code className="font-mono text-sm">X-Payment-Wallet</code>,{" "}
          <code className="font-mono text-sm">X-Payment-Amount</code> (wei),{" "}
          <code className="font-mono text-sm">X-Payment-Decimals: 18</code>
        </li>
      </DocsUl>

      <DocsH2>Settlement scheme</DocsH2>
      <DocsP>
        Advertised as{" "}
        <code className="font-mono text-sm text-foreground">
          ArcDotPromptGateway
        </code>
        : on-chain{" "}
        <code className="font-mono text-sm">depositPayment</code> on Arc Mainnet,
        then retry with{" "}
        <code className="font-mono text-sm">X-Arc-Tx-Hash</code>,{" "}
        <code className="font-mono text-sm">X-Arc-Address</code>, and{" "}
        <code className="font-mono text-sm">X-Arc-Signature</code>.
      </DocsP>
      <DocsP>
        This is <strong className="text-foreground">not</strong> Circle
        GatewayWalletBatched / EIP-3009 facilitator signing. Agents that only
        speak that path need the arcdot. deposit loop (or{" "}
        <Link href="/docs/cli" className="underline underline-offset-4 text-foreground">
          CLI agent:pay
        </Link>
        ).
      </DocsP>

      <DocsH2>Amounts</DocsH2>
      <DocsP>
        <code className="font-mono text-sm">X-Payment-Amount</code> and x402{" "}
        <code className="font-mono text-sm">accepts[].amount</code> are{" "}
        <strong className="text-foreground">18-decimal wei</strong>. See{" "}
        <Link href="/docs/payment" className="underline underline-offset-4 text-foreground">
          Payment on Arc
        </Link>
        .
      </DocsP>
    </DocsProse>
  );
}
