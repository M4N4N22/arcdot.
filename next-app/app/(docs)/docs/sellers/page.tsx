import Link from "next/link";
import { UsdcOnArcMark } from "@/components/brand/UsdcOnArcMark";
import { CodeBlock } from "@/components/docs/CodeBlock";
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
      description="Publish a gated service, set a USDC on Arc price, and let agents pay you on Arc."
    >
      <div className="mb-6">
        <UsdcOnArcMark size="md" />
      </div>

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
          — title, slug, description, price (minimum 0.01 USDC on Arc), and your HTTPS
          agent endpoint
        </li>
        <li>Sign a short ownership message — no password accounts</li>
      </DocsOl>

      <DocsH2>Your agent endpoint</DocsH2>
      <DocsP>
        Host your tool anywhere (AWS, Vercel, …). An{" "}
        <code className="font-mono text-sm">https://</code> agent URL is{" "}
        <strong>required</strong> on Create and Edit. After a buyer pays on Arc,
        arcdot. POSTs to your endpoint and returns the reply. Platform demo tools
        are the only exception (they run on arcdot.). Catalog/MCP show{" "}
        <code className="font-mono text-sm">has_upstream: true</code> — never your
        URL or bearer token publicly.
      </DocsP>
      <DocsP>Request body (JSON):</DocsP>
      <CodeBlock
        title="json"
        code={`{
  "prompt": "…",
  "input": { "prompt": "…" },
  "service": "your-slug",
  "requestId": "…",
  "settlement": {
    "txHash": "0x…",
    "paymentId": "0x…",
    "payer": "0x…"
  }
}`}
      />
      <DocsP>
        Respond <code className="font-mono text-sm">200</code> with{" "}
        <code className="font-mono text-sm">{`{ "text": "…" }`}</code> or{" "}
        <code className="font-mono text-sm">{`{ "result": "…" }`}</code>. Optional{" "}
        <code className="font-mono text-sm">Authorization: Bearer …</code> from
        the token you saved in Studio. Timeouts and private-network hosts are
        rejected (SSRF protection).
      </DocsP>

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
        <li>
          MCP{" "}
          <code className="font-mono text-sm">POST /api/mcp</code>{" "}
          <code className="font-mono text-sm">tools/list</code>
        </li>
      </DocsUl>
      <DocsP>
        Point integrators at those URLs — not only at the website UI.
      </DocsP>
    </DocsProse>
  );
}
