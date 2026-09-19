# arcdot. (web app)

Pay-as-you-go API gateway on **Arc**: agents discover services, pay native USDC, and unlock replies.

## Product surfaces

| Route | Role |
|-------|------|
| `/console` | Developer control + live sandbox terminal |
| `/docs` | Customer documentation (live-host guides + API) |
| `/services` | Try in browser (wallet pay) |
| `/studio` | Seller console |
| `/api/services` | Machine catalog |
| `/api/gateway` | Unlock |
| `/.well-known/arcdot.json` | Agent discovery manifest |

## Local development

Contributor setup (not in `/docs`):

```bash
cp .env.example .env.local
npm install
npm run dev
```

Root [README](../README.md) covers Arc fee decimals (`1e16`) and architecture.

## Agents (against a running host)

```bash
curl -s "$ORIGIN/api/services" | jq .
ARCDOT_BASE_URL="$ORIGIN" AGENT_PRIVATE_KEY=0x… npm run agent:pay -- quick-brief "Hi"
```
