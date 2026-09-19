/** Client-safe MCP config snippets for the Integration Hub. */

export function mcpEndpoint(origin: string): string {
  return `${origin.replace(/\/$/, "")}/api/mcp`;
}

/** IDE / client style MCP server entry (streamable HTTP). */
export function editorMcpConfig(origin: string): string {
  const url = mcpEndpoint(origin);
  return JSON.stringify(
    {
      mcpServers: {
        arcdot: {
          url,
        },
      },
    },
    null,
    2,
  );
}

/** Universal descriptor agents and frameworks can ingest. */
export function universalMcpConfig(origin: string): string {
  const url = mcpEndpoint(origin);
  return JSON.stringify(
    {
      name: "arcdot",
      version: "0.1.0",
      protocol: "mcp",
      transport: "streamable-http",
      endpoint: url,
      methods: ["initialize", "tools/list", "tools/call", "ping"],
      discovery: {
        catalog: `${origin.replace(/\/$/, "")}/api/services`,
        wellKnown: `${origin.replace(/\/$/, "")}/.well-known/agent.json`,
      },
      payment: {
        chain: "arc-mainnet",
        chainId: 5042,
        note: "Unpaid tools/call returns payment instructions in tool content. Retry with payment { txHash, address, signature } after settling on Arc.",
      },
      docs: `${origin.replace(/\/$/, "")}/hub`,
    },
    null,
    2,
  );
}

export function pythonHttpSnippet(origin: string): string {
  const url = mcpEndpoint(origin);
  return `import json
import urllib.request

MCP = "${url}"

def mcp(method: str, params: dict | None = None, id: int = 1) -> dict:
    body = json.dumps({
        "jsonrpc": "2.0",
        "id": id,
        "method": method,
        "params": params or {},
    }).encode()
    req = urllib.request.Request(
        MCP,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req) as res:
        return json.load(res)

# 1) List tools (includes live catalog tools)
print(mcp("tools/list"))

# 2) Call a tool — unpaid calls return payment instructions
print(mcp("tools/call", {
    "name": "arcdot_catalog",
    "arguments": {},
}))
`;
}

export function langchainStyleSnippet(origin: string): string {
  const url = mcpEndpoint(origin);
  return `# Drop-in pattern for LangChain / CrewAI / AutoGPT-style runners:
# treat arcdot as an MCP HTTP tool server, not a chat model.

ARCDOT_MCP = "${url}"

# Pseudocode — wire your framework's MCP or HTTP tool adapter to ARCDOT_MCP.
# 1. initialize
# 2. tools/list  → bind tools to the agent
# 3. tools/call  → on payment needed, settle on Arc, retry with
#    arguments.payment = { "txHash", "address", "signature" }

tools = mcp_client.list_tools(ARCDOT_MCP)
agent.bind_tools(tools)
agent.run("Summarize today's catalog highlights")
`;
}

export function curlHandshakeSnippet(origin: string): string {
  const url = mcpEndpoint(origin);
  return `# Descriptor
curl -s "${url}" | jq .

# List tools
curl -s -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq .
`;
}
