import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";
import {
  DocsH2,
  DocsP,
  DocsProse,
} from "@/components/docs/DocsProse";

export const metadata = { title: "API: Catalog" };

export default function DocsApiCatalogPage() {
  return (
    <DocsProse
      pathname="/docs/api/catalog"
      title="API: Catalog"
      description="Machine-readable service list — source of truth for prices and sellers."
    >
      <DocsH2>GET /api/services</DocsH2>
      <CodeBlock title="http" code={`GET $ORIGIN/api/services`} />
      <DocsP>
        Returns protocol metadata (version 2), chainId, gateway, currency
        (USDC on Arc, 18 decimals), endpoints, x402 hints, and{" "}
        <code className="font-mono text-sm">services[]</code> with slug,
        price_usdc, price_wei, seller, seller_name, input schema, and example.
      </DocsP>
      <CodeBlock
        title="json (shape)"
        code={`{
  "protocol": "arcdot.gateway",
  "version": 2,
  "chainId": 5042,
  "gateway": "0x…",
  "docs": "/docs",
  "services": [
    {
      "slug": "quick-brief",
      "price_usdc": "0.01",
      "price_wei": "10000000000000000",
      "seller": "0x…",
      "seller_name": "arcdot."
    }
  ]
}`}
      />

      <DocsH2>GET /api/services/{"{slug}"}</DocsH2>
      <DocsP>
        Same envelope scoped to one service, plus a top-level{" "}
        <code className="font-mono text-sm">service</code> object.
      </DocsP>

      <DocsH2>Also useful</DocsH2>
      <DocsP>
        <code className="font-mono text-sm">GET /api/health</code> ·{" "}
        <code className="font-mono text-sm">GET /api/telemetry</code> ·{" "}
        <Link href="/docs/discovery" className="underline underline-offset-4 text-foreground">
          Discovery manifests
        </Link>
      </DocsP>
    </DocsProse>
  );
}
