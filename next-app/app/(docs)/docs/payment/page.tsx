import Link from "next/link";
import { UsdcOnArcMark } from "@/components/brand/UsdcOnArcMark";
import {
  DocsCallout,
  DocsH2,
  DocsP,
  DocsProse,
  DocsUl,
} from "@/components/docs/DocsProse";

export const metadata = { title: "Payment on Arc" };

export default function DocsPaymentPage() {
  return (
    <DocsProse
      pathname="/docs/payment"
      title="Payment on Arc"
      description="USDC on Arc settlement for gated unlocks — network, decimals, and method that agents must get right."
    >
      <div className="mb-6">
        <UsdcOnArcMark size="lg" />
      </div>

      <DocsCallout title="Wrong network = invisible funds">
        Buyers must send <strong className="font-medium text-foreground">USDC on Arc</strong>.
        The same address on Ethereum, Base, Solana, or elsewhere will not credit
        the agent wallet or settle unlocks. Fund UI:{" "}
        <Link href="/fund" className="underline underline-offset-4">
          /fund
        </Link>
        .
      </DocsCallout>

      <DocsH2>Network</DocsH2>
      <DocsUl>
        <li>Arc Mainnet · chainId 5042 · CAIP-2 eip155:5042</li>
        <li>Explorer: explorer.arc.io</li>
      </DocsUl>

      <DocsH2>Decimals (critical)</DocsH2>
      <DocsP>
        Arc native USDC uses{" "}
        <strong className="text-foreground">18 decimals</strong>. The platform
        floor is 0.01 USDC ={" "}
        <code className="font-mono text-sm text-foreground">
          10000000000000000
        </code>{" "}
        (<code className="font-mono text-sm">1e16</code>) wei.
      </DocsP>
      <DocsP>
        Do <strong className="text-foreground">not</strong> use 6-decimal ERC-20
        USDC units (e.g. 10000) as{" "}
        <code className="font-mono text-sm">msg.value</code> — that underpays by
        ~1e12.
      </DocsP>

      <DocsH2>Contract call</DocsH2>
      <DocsUl>
        <li>
          Method:{" "}
          <code className="font-mono text-sm">
            depositPayment(paymentId, seller)
          </code>{" "}
          (payable)
        </li>
        <li>
          <code className="font-mono text-sm">paymentId</code> must be a unique
          bytes32 per deposit
        </li>
        <li>
          <code className="font-mono text-sm">seller</code> comes from the catalog
        </li>
        <li>Value must equal the service price exactly</li>
      </DocsUl>
      <DocsP>
        After confirmation, unlock with{" "}
        <Link
          href="/docs/api/gateway"
          className="underline underline-offset-4 text-foreground"
        >
          POST /api/gateway
        </Link>
        .
      </DocsP>
    </DocsProse>
  );
}
