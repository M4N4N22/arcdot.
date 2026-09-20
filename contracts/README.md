# arcdot. contracts

Hardhat package for **PromptGateway V3** on Arc.

| Network | Chain ID | Command |
|---------|----------|---------|
| **Testnet** (E2E) | `5042002` | `npm run deploy:testnet` |
| **Mainnet** (submit) | `5042` | `npm run deploy:arc` |

Immutable escrow: native USDC deposits, seller / platform split, pull withdrawals. No proxy.

## Locks

| Param | Default |
|-------|---------|
| `minFee` | `1e16` (0.01 USDC, 18-decimal native) |
| `maxFee` | `10000e18` (fat-finger cap) |
| `platformFeeBps` | `1000` (10%) |
| `treasury` | deployer, or `PLATFORM_TREASURY` |

`depositPayment(paymentId, seller)` accepts `minFee ≤ msg.value ≤ maxFee`.

Gas on Arc is **USDC** — no separate gas token.

## Commands

```bash
cp .env.example .env
# Set DEPLOYER_PRIVATE_KEY_TESTNET= (funded with testnet USDC)
npm install
npm test
npm run deploy:testnet
GATEWAY_ADDRESS=0x... SELLER=0x... npm run deposit:testnet
```

Mainnet (when ready to submit):

```bash
# Set DEPLOYER_PRIVATE_KEY_MAINNET=
npm run deploy:arc
```

See the **[root README](../README.md)** for architecture and app wiring.
