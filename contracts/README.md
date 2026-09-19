# arcdot. contracts

Hardhat package for `PromptGateway.sol` on **Arc Mainnet** (chain ID `5042`).

See the **[root README](../README.md)** for architecture and deploy steps.

Fee lock: **0.01 USDC** = `1e16` native wei (Arc 18-decimal USDC).

```bash
cp .env.example .env
npm install
npm test
npm run deploy:arc
GATEWAY_ADDRESS=0x... npm run deposit:arc
```
