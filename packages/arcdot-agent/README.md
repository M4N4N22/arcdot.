# @arcdot/agent

Buyer agent client for **arcdot.** — local wallet, auto-settle on Arc, MCP proxy for Cursor.

**Buyer keys never leave your machine.** The arcdot. server does not hold or spend your USDC.

## Install

```bash
# one-shot CLI
npx --yes @arcdot/agent wallet create

# as a dependency
npm install @arcdot/agent
```

From this monorepo (contributors):

```bash
cd packages/arcdot-agent && npm install && npm run build && npm link
arcdot wallet create
```

## Quick start

```bash
# 1) Create a dedicated agent wallet (saved to ~/.arcdot/wallet.json)
npx --yes @arcdot/agent wallet create

# 2) Fund the printed address with native USDC on Arc Mainnet (chain 5042)

# 3a) Cursor / IDE — local MCP proxy (auto-pays on tool calls)
# mcp.json:
# {
#   "mcpServers": {
#     "arcdot": {
#       "command": "npx",
#       "args": ["--yes", "@arcdot/agent", "mcp", "--origin", "https://YOUR_HOST"]
#     }
#   }
# }

# 3b) Or unlock from the CLI
npx --yes @arcdot/agent unlock \
  --origin https://YOUR_HOST --service quick-brief --prompt "Hi"
```

## SDK

```ts
import { createArcdotAgent } from "@arcdot/agent";

const agent = await createArcdotAgent({ origin: "https://YOUR_HOST" });
await agent.unlock({ service: "quick-brief", input: { prompt: "Hi" } });
await agent.callMcpTool("arcdot_quick_brief", { prompt: "Hi" });
```

## Env

| Variable | Meaning |
|----------|---------|
| `ARCDOT_ORIGIN` | Default host |
| `ARCDOT_PRIVATE_KEY` | Override wallet file |
| `AGENT_PRIVATE_KEY` | Alias |
| `ARC_RPC_URL` | Arc RPC |
| `ARCDOT_GATEWAY` | Gateway address override |
| `ARCDOT_HOME` | Config directory (default `~/.arcdot`) |
