/** Client-safe MCP config snippets for the Integration Hub. */

import {
  AGENT_GIT_PACKAGE,
  agentInstallCommands,
  agentMcpProxyConfig,
} from "@/lib/agent/install";

export function mcpEndpoint(origin: string): string {
  return `${origin.replace(/\/$/, "")}/api/mcp`;
}

/** Cursor / IDE: local @arcdot/agent proxy via GitHub (until npm publish). */
export function editorMcpConfig(origin: string): string {
  return agentMcpProxyConfig(origin);
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
      install: AGENT_GIT_PACKAGE,
      remoteEndpoint: url,
      proxy: {
        command: "npx",
        args: [
          "--yes",
          `--package=${AGENT_GIT_PACKAGE}`,
          "arcdot",
          "mcp",
          "--origin",
          host,
        ],
      },
      methods: ["initialize", "tools/list", "tools/call", "ping"],
      discovery: {
        catalog: `${host}/api/services`,
        wellKnown: `${host}/.well-known/agent.json`,
      },
      payment: {
        chain: "arc-mainnet",
        chainId: 5042,
        note: `Buyer wallet via GitHub package (${AGENT_GIT_PACKAGE}). Local MCP proxy auto-settles; keys never leave the buyer machine.`,
      },
      docs: `${host}/hub`,
    },
    null,
    2,
  );
}

export function pythonHttpSnippet(origin: string): string {
  const host = origin.replace(/\/$/, "");
  return `# Prefer the buyer client — GitHub install (npm publish coming later)
#
#   ${agentInstallCommands.npxWalletCreate}
#   # fund the address on Arc, then:
#
#   ${agentInstallCommands.npmInstall}
#
from pathlib import Path
# Or use Node:
#   ${agentInstallCommands.npxUnlock(host)}

print("Use @arcdot/agent (Node) for settle + unlock. Origin:", "${host}")
`;
}

export function langchainStyleSnippet(origin: string): string {
  const host = origin.replace(/\/$/, "");
  return `# Buyer agent — keys stay on YOUR machine (never on arcdot. server)
#
# 1) ${agentInstallCommands.npxWalletCreate}
# 2) Fund the printed address with native USDC on Arc (5042)
# 3) Use the SDK or CLI (auto-settle)

# Node:
#   ${agentInstallCommands.npmInstall}
#
#   import { createArcdotAgent } from "@arcdot/agent";
#   const agent = await createArcdotAgent({ origin: "${host}" });
#   await agent.unlock({ service: "quick-brief", input: { prompt: "Hi" } });
#   # or: await agent.callMcpTool("arcdot_quick_brief", { prompt: "Hi" });

# CLI one-liner:
#   ${agentInstallCommands.npxUnlock(host)}

# Cursor: use the MCP proxy JSON from Hub (GitHub-backed npx)
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
