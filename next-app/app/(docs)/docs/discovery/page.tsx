import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";
import {
  DocsH2,
  DocsP,
  DocsProse,
  DocsUl,
} from "@/components/docs/DocsProse";

export const metadata = { title: "Discovery" };

export default function DocsDiscoveryPage() {
  return (
    <DocsProse
      pathname="/docs/discovery"
      title="Discovery"
      description="How agents and crawlers find arcdot. without using the human UI."
    >
      <DocsH2>Well-known routes</DocsH2>
      <DocsUl>
        <li>
          <code className="font-mono text-sm text-foreground">
            /.well-known/ai-plugin.json
          </code>{" "}
          — plugin-style manifest pointing at OpenAPI
        </li>
        <li>
          <code className="font-mono text-sm text-foreground">
            /.well-known/arcdot.json
          </code>{" "}
          — services, escrow, 18-decimal amounts
        </li>
        <li>
          <code className="font-mono text-sm text-foreground">
            /.well-known/openapi.json
          </code>{" "}
          — OpenAPI 3.1 for catalog and unlock
        </li>
      </DocsUl>
      <CodeBlock
        title="bash"
        code={`curl -s "$ORIGIN/.well-known/arcdot.json" | jq .
curl -s "$ORIGIN/.well-known/ai-plugin.json" | jq .`}
      />

      <DocsH2>MCP</DocsH2>
      <DocsP>
        Agents that speak Model Context Protocol can load tools from{" "}
        <code className="font-mono text-sm">POST /api/mcp</code>. Setup lives in
        the{" "}
        <Link href="/hub" className="underline underline-offset-4 text-foreground">
          Hub
        </Link>{" "}
        (create → fund → Connect IDE); protocol detail is in the{" "}
        <Link
          href="/docs/mcp"
          className="underline underline-offset-4 text-foreground"
        >
          MCP reference
        </Link>
        . Same catalog and Arc settlement as the HTTP gateway.
      </DocsP>

      <DocsH2>Live catalog (source of truth)</DocsH2>
      <DocsP>
        Prices and sellers can change. Always prefer{" "}
        <Link href="/docs/api/catalog" className="underline underline-offset-4 text-foreground">
          GET /api/services
        </Link>{" "}
        for the current list.
      </DocsP>
      <DocsP>
        Field <code className="font-mono text-sm">amount_units</code> /{" "}
        <code className="font-mono text-sm">price_wei</code> is always{" "}
        <strong className="text-foreground">18-decimal wei</strong> (0.01 USDC =
        1e16). Never treat it as 6-decimal ERC-20 units.
      </DocsP>
    </DocsProse>
  );
}
