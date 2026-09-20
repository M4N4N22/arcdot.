# @arcdot/agent

Buyer agent client for **arcdot.** — local wallet, auto-settle on Arc, MCP proxy for Cursor.

**Buyer keys never leave your machine.** The arcdot. server does not hold or spend your USDC.

## Install

```bash
# one-shot CLI — create or import
npx --yes @arcdot/agent wallet create
# or: npx --yes @arcdot/agent wallet import --key 0xYOUR_PRIVATE_KEY

# as a dependency
npm install @arcdot/agent
```

From this monorepo (contributors):

```bash
cd packages/arcdot-agent && npm install && npm run build && npm link
arcdot wallet create
# or: arcdot wallet import --key 0x…
```

## Quick start

```bash
# 1a) Create a dedicated agent wallet (saved to ~/.arcdot/wallet.json)
npx --yes @arcdot/agent wallet create

# 1b) Or import a key you already own (local terminal only — never paste into chat)
npx --yes @arcdot/agent wallet import --key 0xYOUR_PRIVATE_KEY
# or: export ARCDOT_PRIVATE_KEY=0x… && npx --yes @arcdot/agent wallet import --from-env

# 2) Fund the printed address with USDC on Arc (see Hub → Fund for QR)
npx --yes @arcdot/agent wallet status

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
# Local tool arcdot_wallet reports balance / fund hints without leaving your machine.

# 3b) Or unlock from the CLI
npx --yes @arcdot/agent unlock \
  --origin https://YOUR_HOST --service quick-brief --prompt "Hi"
```

## SDK

```ts
import { createArcdotAgent } from "@arcdot/agent";

const agent = await createArcdotAgent({ origin: "https://YOUR_HOST" });
await agent.unlock({ service: "quick-brief", input: { prompt: "Hi" } });
await agent.callMcpTool("arcdot_unlock", {
  service: "quick-brief",
  prompt: "Hi",
});
// Discover first: await agent.callMcpTool("arcdot_discover", {});
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
| `ARC_NETWORK` | `mainnet` (default) or `testnet` |
| `ARCDOT_LOW_BALANCE_USDC` | Low-balance alert threshold (default `0.05`) |
