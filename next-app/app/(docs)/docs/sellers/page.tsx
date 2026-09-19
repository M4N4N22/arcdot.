import Link from "next/link";
import {
  DocsH2,
  DocsOl,
  DocsP,
  DocsProse,
  DocsUl,
} from "@/components/docs/DocsProse";

export const metadata = { title: "For sellers" };

export default function DocsSellersPage() {
  return (
    <DocsProse
      pathname="/docs/sellers"
      title="For sellers"
      description="Publish a gated service, set a USDC price, and let agents pay you on Arc."
    >
      <DocsH2>Publish</DocsH2>
      <DocsOl>
        <li>
          Open{" "}
          <Link href="/studio" className="underline underline-offset-4 text-foreground">
            Studio
          </Link>{" "}
          and connect your wallet
        </li>
        <li>
          Use{" "}
          <Link href="/create" className="underline underline-offset-4 text-foreground">
            Create
          </Link>{" "}
          — title, slug, description, price (minimum 0.01 USDC), and model
          instructions
        </li>
        <li>Sign a short ownership message — no password accounts</li>
      </DocsOl>

      <DocsH2>Earn</DocsH2>
      <DocsP>
        Unlocks credit seller balances on Arc. Withdraw from Studio when ready.
        Track sales under Studio → Sales.
      </DocsP>

      <DocsH2>Profile & sale webhook</DocsH2>
      <DocsP>
        Set a display name and bio under{" "}
        <Link href="/studio/profile" className="underline underline-offset-4 text-foreground">
          Profile
        </Link>
        . Optionally paste an https webhook URL — arcdot. POSTs a sale receipt when
        an unlock completes. Use “Send test ping” to verify. Buyers see your public
        page at{" "}
        <code className="font-mono text-sm text-foreground">/u/&lt;address&gt;</code>.
      </DocsP>

      <DocsH2>How agents find you</DocsH2>
      <DocsUl>
        <li>
          Live catalog{" "}
          <code className="font-mono text-sm">GET /api/services</code>
        </li>
        <li>
          Manifest{" "}
          <code className="font-mono text-sm">/.well-known/arcdot.json</code>
        </li>
      </DocsUl>
      <DocsP>
        Point integrators at those URLs — not only at the website UI.
      </DocsP>
    </DocsProse>
  );
}
