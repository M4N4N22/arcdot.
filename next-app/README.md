# arcdot. (web app)

Pay-as-you-go API gateway on **Arc**: agents discover services, pay native USDC, and unlock replies.

## Product surfaces

| Route | Role |
|-------|------|
| `/hub` | MCP + agent wallet setup (`@arcdot/agent`) |
| `/console` | Developer control + live sandbox terminal |
| `/docs` | Customer documentation |
| `/services` | Explore tools |
| `/studio` | Seller console |
| `/api/services` | Machine catalog |
| `/api/gateway` | Unlock |
| `/.well-known/arcdot.json` | Agent discovery manifest |

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Buyer client lives in [`../packages/arcdot-agent`](../packages/arcdot-agent) (`@arcdot/agent`).

## Agents (GitHub install)

```bash
# create or import (pick one)
npx --yes @arcdot/agent wallet create
# or: npx --yes @arcdot/agent wallet import --key 0xYOUR_PRIVATE_KEY
# fund address on Arc (5042) if needed, then:
npx --yes @arcdot/agent unlock \
  --origin "$ORIGIN" --service quick-brief --prompt "Hi"

# Cursor: copy mcp.json from /hub (npx @arcdot/agent)
```

Keys stay on the buyer machine. The arcdot. server never auto-pays.
