# arcdot. contracts

Hardhat package for **PromptGateway V3** on **Arc Mainnet** (chain ID `5042`).

Immutable escrow: native USDC deposits, seller / platform split, pull withdrawals. No proxy.

## Locks

| Param | Default |
|-------|---------|
| `minFee` | `1e16` (0.01 USDC, 18-decimal native) |
| `maxFee` | `10000e18` (fat-finger cap) |
| `platformFeeBps` | `1000` (10%) |
| `treasury` | deployer, or `PLATFORM_TREASURY` |

`depositPayment(paymentId, seller)` accepts `minFee ≤ msg.value ≤ maxFee`.

## Commands

```bash
cp .env.example .env
npm install
npm test
npm run deploy:arc
GATEWAY_ADDRESS=0x... SELLER=0x... npm run deposit:arc
```

See the **[root README](../README.md)** for architecture and app wiring.
