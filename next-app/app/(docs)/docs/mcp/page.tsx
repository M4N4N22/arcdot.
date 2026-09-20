import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";
import {
  DocsCallout,
  DocsH2,
  DocsOl,
  DocsP,
  DocsProse,
  DocsUl,
} from "@/components/docs/DocsProse";
import {
  agentInstallCommands,
  agentMcpProxyConfig,
} from "@/lib/agent/install";

export const metadata = { title: "MCP reference" };

export default function DocsMcpPage() {
  return (
    <DocsProse
      pathname="/docs/mcp"
      title="MCP reference"
      eyebrow="Guides"
      description="Protocol details for the arcdot. MCP adapter. For the real buyer setup, use Hub Get started."
    >
      <DocsCallout title="Two different MCP paths">
        <strong className="font-medium text-foreground">
          Local IDE proxy:
        </strong>{" "}
        stdio <code>@arcdot/agent</code> in Cursor, VS Code, Claude Desktop,
        Windsurf, etc. (auto-pay).{" "}
        <strong className="font-medium text-foreground">Remote host:</strong>{" "}
        <code>POST /api/mcp</code> lists tools and returns payment instructions —
        it does not settle for you. Setup:{" "}
        <Link href="/hub" className="underline underline-offset-4">
          Hub → Get started
        </Link>
        .
      </DocsCallout>

      <DocsH2>Buyer setup (auto-pay)</DocsH2>
      <DocsOl>
        <li>
          Create wallet:{" "}
          <code className="font-mono text-sm">
            {agentInstallCommands.npxWalletCreate}
          </code>
        </li>
        <li>
          Fund with USDC on Arc on{" "}
          <Link href="/fund" className="underline underline-offset-4">
            /fund
          </Link>
        </li>
        <li>
          Paste the local proxy into your IDE’s MCP settings (see{" "}
          <Link href="/hub/editors" className="underline underline-offset-4">
            Connect IDE
          </Link>
          )
        </li>
      </DocsOl>
      <CodeBlock title="mcp.json" code={agentMcpProxyConfig("$ORIGIN")} />

      <DocsH2>Remote endpoint</DocsH2>
      <DocsP>
        Streamable HTTP JSON-RPC at{" "}
        <code className="font-mono text-sm">POST /api/mcp</code>.{" "}
        <code className="font-mono text-sm">GET /api/mcp</code> returns a short
        descriptor. Adapter over the gateway — not a separate marketplace.
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
      <DocsP>
        Published services are <strong>not</strong> MCP tools. Agents discover
        them, then unlock by slug.
      </DocsP>
      <DocsUl>
        <li>
          <code className="font-mono text-sm">arcdot_discover</code> — free
          catalog (optional <code className="font-mono text-sm">query</code>{" "}
          filter). Alias: <code className="font-mono text-sm">arcdot_catalog</code>
        </li>
        <li>
          <code className="font-mono text-sm">arcdot_health</code> — free health
        </li>
        <li>
          <code className="font-mono text-sm">arcdot_unlock</code> —{" "}
          <code className="font-mono text-sm">{`{ service, prompt }`}</code>{" "}
          then pay / retry with{" "}
          <code className="font-mono text-sm">payment</code>
        </li>
      </DocsUl>

      <DocsH2>Paid call</DocsH2>
      <DocsOl>
        <li>
          Remote <code className="font-mono text-sm">tools/call</code> without
          payment → payment instructions in tool content
        </li>
        <li>
          Local <code className="font-mono text-sm">@arcdot/agent</code> proxy /
          SDK runs deposit + EIP-191 and retries with{" "}
          <code className="font-mono text-sm">arguments.payment</code>
        </li>
      </DocsOl>
      <DocsP>
        Rehearsal only: header{" "}
        <code className="font-mono text-sm">X-Arc-Demo-Secret</code>. Production
        buyers fund with USDC on Arc on{" "}
        <Link href="/fund" className="underline underline-offset-4">
          /fund
        </Link>
        . arcdot. never holds buyer keys.
      </DocsP>
      <CodeBlock
        title="bash"
        code={`curl -s -X POST "$ORIGIN/api/mcp" \\
  -H 'Content-Type: application/json' \\
  -H "X-Arc-Demo-Secret: $DEMO_AGENT_SECRET" \\
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"arcdot_unlock","arguments":{"service":"quick-brief","prompt":"Say hello in one line"}}}'`}
      />

      <DocsH2>Related</DocsH2>
      <DocsUl>
        <li>
          <Link
            href="/hub"
            className="underline underline-offset-4 text-foreground"
          >
            Hub → Get started
          </Link>
        </li>
        <li>
          <Link
            href="/docs/agents/client"
            className="underline underline-offset-4 text-foreground"
          >
            Agent client
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
      </DocsUl>
    </DocsProse>
  );
}
