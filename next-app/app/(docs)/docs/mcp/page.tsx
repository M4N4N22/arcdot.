import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";
import {
  DocsH2,
  DocsOl,
  DocsP,
  DocsProse,
  DocsUl,
} from "@/components/docs/DocsProse";

export const metadata = { title: "MCP reference" };

export default function DocsMcpPage() {
  return (
    <DocsProse
      pathname="/docs/mcp"
      title="MCP reference"
      description="Protocol details for the arcdot. MCP adapter. For setup and copy-paste configs, use the Integration Hub."
    >
      <DocsP>
        Prefer the visual setup flow? Open the{" "}
        <Link
          href="/hub"
          className="underline underline-offset-4 text-foreground"
        >
          MCP Hub
        </Link>{" "}
        — IDE setup, framework snippets, and one-click config copy.
      </DocsP>

      <DocsH2>Endpoint</DocsH2>
      <DocsP>
        Streamable HTTP JSON-RPC at{" "}
        <code className="font-mono text-sm">POST /api/mcp</code>.{" "}
        <code className="font-mono text-sm">GET /api/mcp</code> returns a short
        descriptor. This is an adapter over the existing gateway — not a separate
        marketplace.
      </DocsP>

      <DocsH2>Handshake</DocsH2>
      <CodeBlock
        title="bash"
        code={`curl -s "$ORIGIN/api/mcp" | jq .

curl -s -X POST "$ORIGIN/api/mcp" \\
  -H 'Content-Type: application/json' \\
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"curl","version":"0"}}}'

curl -s -X POST "$ORIGIN/api/mcp" \\
  -H 'Content-Type: application/json' \\
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' | jq .`}
      />

      <DocsH2>Tools</DocsH2>
      <DocsUl>
        <li>
          <code className="font-mono text-sm">arcdot_catalog</code> — free
          discovery
        </li>
        <li>
          <code className="font-mono text-sm">arcdot_health</code> — free health
        </li>
        <li>
          <code className="font-mono text-sm">arcdot_&lt;slug&gt;</code> — one
          tool per published service (hyphens → underscores)
        </li>
      </DocsUl>

      <DocsH2>Paid call</DocsH2>
      <DocsOl>
        <li>
          <code className="font-mono text-sm">tools/call</code> without payment →
          tool content with payment instructions (
          <code className="font-mono text-sm">price_wei</code>, seller, gateway)
        </li>
        <li>
          On Arc:{" "}
          <code className="font-mono text-sm">
            depositPayment(paymentId, seller)
          </code>{" "}
          with <code className="font-mono text-sm">msg.value == price_wei</code>
        </li>
        <li>
          Retry with{" "}
          <code className="font-mono text-sm">
            arguments.payment {"{ txHash, address, signature }"}
          </code>
        </li>
      </DocsOl>
      <DocsP>
        Rehearsal: pass header{" "}
        <code className="font-mono text-sm">X-Arc-Demo-Secret</code> (same as
        gateway demo unlock). Optional server auto-pay:{" "}
        <code className="font-mono text-sm">MCP_AUTO_PAY=true</code> +{" "}
        <code className="font-mono text-sm">AGENT_PRIVATE_KEY</code>.
      </DocsP>
      <CodeBlock
        title="bash"
        code={`curl -s -X POST "$ORIGIN/api/mcp" \\
  -H 'Content-Type: application/json' \\
  -H "X-Arc-Demo-Secret: $DEMO_AGENT_SECRET" \\
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"arcdot_quick_brief","arguments":{"prompt":"Say hello in one line"}}}'`}
      />

      <DocsH2>Related</DocsH2>
      <DocsUl>
        <li>
          <Link
            href="/hub"
            className="underline underline-offset-4 text-foreground"
          >
            MCP Hub
          </Link>
        </li>
        <li>
          <Link
            href="/docs/agents"
            className="underline underline-offset-4 text-foreground"
          >
            For agents
          </Link>
        </li>
        <li>
          <Link
            href="/docs/api/gateway"
            className="underline underline-offset-4 text-foreground"
          >
            Unlock API
          </Link>
        </li>
        <li>
          <Link
            href="/docs/discovery"
            className="underline underline-offset-4 text-foreground"
          >
            Discovery
          </Link>
        </li>
      </DocsUl>
    </DocsProse>
  );
}
