import { ARC_EXPLORER } from "./constants.js";
import { unlockWithAutoSettle } from "./client/gateway.js";
import { getNativeBalance } from "./settle/pay.js";
import { runMcpProxy } from "./mcp/proxy.js";
import {
  createWallet,
  loadWallet,
  resolvePrivateKey,
  walletAccountFromKey,
  walletPath,
} from "./wallet/store.js";

function usage() {
  console.log(`
arcdot — buyer agent client (keys stay on your machine)

Usage:
  arcdot wallet create [--force]
  arcdot wallet address
  arcdot wallet balance
  arcdot unlock --origin <url> --service <slug> [--prompt <text>]
  arcdot mcp --origin <url>

Env:
  ARCDOT_ORIGIN       Default origin for unlock / mcp
  ARCDOT_PRIVATE_KEY  Override ~/.arcdot/wallet.json
  AGENT_PRIVATE_KEY   Alias for ARCDOT_PRIVATE_KEY
  ARC_RPC_URL         Arc RPC (default https://rpc.mainnet.arc.io)
  ARCDOT_GATEWAY      Override gateway address
  ARCDOT_HOME         Override config dir (default ~/.arcdot)
`);
}

function argValue(args: string[], name: string): string | undefined {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  return args[i + 1];
}

function hasFlag(args: string[], name: string): boolean {
  return args.includes(name);
}

async function main() {
  const argv = process.argv.slice(2);
  const cmd = argv[0];

  if (!cmd || cmd === "-h" || cmd === "--help") {
    usage();
    process.exit(cmd ? 0 : 1);
  }

  if (cmd === "wallet") {
    const sub = argv[1];
    if (sub === "create") {
      const wallet = createWallet({ force: hasFlag(argv, "--force") });
      console.log(`
Created agent wallet (local only)
=================================
Address:  ${wallet.address}
File:     ${walletPath()}

NEXT STEPS
1. Fund ${wallet.address} with native USDC on Arc Mainnet (chain 5042).
   ${ARC_EXPLORER}/address/${wallet.address}
2. Add MCP in Cursor with the local proxy (see Hub), or:
   arcdot unlock --origin https://YOUR_HOST --service quick-brief --prompt "Hi"

Private key is stored at ${walletPath()} (mode 0600).
It was also printed once below — save it offline if you need a backup.
Do NOT put this key on the arcdot. server.

Private key: ${wallet.privateKey}
`);
      return;
    }
    if (sub === "address") {
      const w = loadWallet();
      if (!w) {
        // env-only
        const key = resolvePrivateKey();
        console.log(walletAccountFromKey(key).address);
        return;
      }
      console.log(w.address);
      return;
    }
    if (sub === "balance") {
      const key = resolvePrivateKey();
      const address = walletAccountFromKey(key).address;
      const { formatted, wei } = await getNativeBalance(address);
      console.log(
        JSON.stringify({ address, balanceUsdc: formatted, wei: wei.toString() }, null, 2),
      );
      return;
    }
    console.error("Unknown wallet command. Use create | address | balance");
    process.exit(1);
  }

  if (cmd === "unlock") {
    const origin =
      argValue(argv, "--origin") ||
      process.env.ARCDOT_ORIGIN ||
      "";
    const service = argValue(argv, "--service") || "quick-brief";
    const prompt =
      argValue(argv, "--prompt") || "Say hello in one short sentence.";
    if (!origin) {
      console.error("Missing --origin or ARCDOT_ORIGIN");
      process.exit(1);
    }
    const result = await unlockWithAutoSettle({
      origin,
      service,
      input: { prompt },
      clientRequestId: `arcdot-cli-${Date.now()}`,
    });
    console.log(JSON.stringify(result, null, 2));
    if (!result.gateway.ok) process.exit(1);
    return;
  }

  if (cmd === "mcp") {
    const origin =
      argValue(argv, "--origin") ||
      process.env.ARCDOT_ORIGIN ||
      "";
    if (!origin) {
      console.error("Missing --origin or ARCDOT_ORIGIN");
      process.exit(1);
    }
    await runMcpProxy(origin);
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  usage();
  process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
