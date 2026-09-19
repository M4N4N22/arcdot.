/** Client-safe MCP config snippets for the Integration Hub. */

export function mcpEndpoint(origin: string): string {
  return `${origin.replace(/\/$/, "")}/api/mcp`;
}

/** Cursor / IDE: local @arcdot/agent proxy (auto-settle). Not raw remote URL. */
export function editorMcpConfig(origin: string): string {
  const host = origin.replace(/\/$/, "");
  return JSON.stringify(
    {
      mcpServers: {
        arcdot: {
          command: "npx",
          args: ["-y", "@arcdot/agent", "mcp", "--origin", host],
        },
      },
    },
    null,
    2,
  );
}

/** Universal descriptor agents and frameworks can ingest. */
export function universalMcpConfig(origin: string): string {
  const host = origin.replace(/\/$/, "");
  const url = mcpEndpoint(host);
  return JSON.stringify(
    {
      name: "arcdot",
      version: "0.1.0",
      protocol: "mcp",
      transport: "stdio-proxy",
      client: "@arcdot/agent",
      remoteEndpoint: url,
      proxy: {
        command: "npx",
        args: ["-y", "@arcdot/agent", "mcp", "--origin", host],
      },
      methods: ["initialize", "tools/list", "tools/call", "ping"],
      discovery: {
        catalog: `${host}/api/services`,
        wellKnown: `${host}/.well-known/agent.json`,
      },
      payment: {
        chain: "arc-mainnet",
        chainId: 5042,
        note: "Buyer wallet via npx @arcdot/agent wallet create (~/.arcdot/wallet.json). Local MCP proxy auto-settles; keys never leave the buyer machine.",
      },
      docs: `${host}/hub`,
    },
    null,
    2,
  );
}

export function pythonHttpSnippet(origin: string): string {
  return `# Prefer the SDK / CLI — no need to clone arcdot.
#
#   npx @arcdot/agent wallet create
#   # fund the address on Arc, then:
#
#   npm i @arcdot/agent
#
from pathlib import Path
# Or use Node:
#   npx @arcdot/agent unlock --origin ${origin.replace(/\/$/, "")} --service quick-brief --prompt "Hi"

print("Use @arcdot/agent (Node) for settle + unlock. Origin:", "${origin.replace(/\/$/, "")}")
`;
}

export function langchainStyleSnippet(origin: string): string {
  const host = origin.replace(/\/$/, "");
  return `# Buyer agent — keys stay on YOUR machine (never on arcdot. server)
#
# 1) npx @arcdot/agent wallet create
# 2) Fund the printed address with native USDC on Arc (5042)
# 3) Use the SDK or CLI (auto-settle)

# Node:
#   npm i @arcdot/agent
#
#   import { createArcdotAgent } from "@arcdot/agent";
#   const agent = await createArcdotAgent({ origin: "${host}" });
#   await agent.unlock({ service: "quick-brief", input: { prompt: "Hi" } });
#   # or: await agent.callMcpTool("arcdot_quick_brief", { prompt: "Hi" });

# CLI one-liner:
#   npx @arcdot/agent unlock --origin ${host} --service quick-brief --prompt "Hi"

# Cursor: use the MCP proxy JSON from Hub (npx @arcdot/agent mcp --origin …)
`;
}

export function curlHandshakeSnippet(origin: string): string {
  const url = mcpEndpoint(origin);
  return `# Descriptor (remote API — discovery only; payment uses @arcdot/agent)
curl -s "${url}" | jq .

# List tools
curl -s -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq .
`;
}
