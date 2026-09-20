import { ARC_EXPLORER } from "./constants.js";
import { unlockWithAutoSettle } from "./client/gateway.js";
import { getNativeBalance } from "./settle/pay.js";
import { runMcpProxy } from "./mcp/proxy.js";
import {
  formatWalletStatusHuman,
  getWalletStatus,
} from "./wallet/status.js";
import {
  createWallet,
  importWallet,
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
  arcdot wallet import --key 0x… [--force]
  arcdot wallet import --from-env [--force]
  arcdot wallet address
  arcdot wallet balance
  arcdot wallet status
  arcdot unlock --origin <url> --service <slug> [--prompt <text>]
  arcdot mcp --origin <url>

Env:
  ARCDOT_ORIGIN            Default origin for unlock / mcp
  ARCDOT_PRIVATE_KEY       Override ~/.arcdot/wallet.json (or source for import --from-env)
  AGENT_PRIVATE_KEY        Alias for ARCDOT_PRIVATE_KEY
  ARC_RPC_URL              Arc RPC (default https://rpc.mainnet.arc.io)
  ARC_NETWORK              mainnet | testnet
  ARCDOT_GATEWAY           Override gateway address
  ARCDOT_HOME              Override config dir (default ~/.arcdot)
  ARCDOT_LOW_BALANCE_USDC  Alert threshold (default 0.05)

Security:
  Never paste a private key into chat, browsers, or arcdot. websites.
  Prefer a dedicated agent spend wallet — not your main treasury key.
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

function printWalletReady(
  wallet: { address: string },
  kind: "Created" | "Imported",
) {
  console.log(`
${kind} agent wallet (local only)
=================================
Address:  ${wallet.address}
File:     ${walletPath()}

BACKUP
• Keep a copy of ${walletPath()} or the private key offline.
• Losing the backup = losing access to funds on this address.

NEXT STEPS
1. Confirm USDC on Arc: arcdot wallet status
2. If low, fund ${wallet.address} on Arc
   ${ARC_EXPLORER}/address/${wallet.address}
   Or open /fund?address=${wallet.address}
3. Retry unlock in your IDE, or:
   arcdot unlock --origin https://YOUR_HOST --service <slug> --prompt "Hi"
`);
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

BACKUP (do this now)
• The recovery key is printed once below — save it in a password manager
  or encrypted note. Anyone with that key can spend the wallet's USDC.
• Or copy ${walletPath()} to a safe offline location.
• A new machine needs that file, wallet import, or ARCDOT_PRIVATE_KEY in MCP env.
• This site never stores your key. Losing the backup = losing access to funds.

NEXT STEPS
1. Fund ${wallet.address} with USDC on Arc (not other networks).
   ${ARC_EXPLORER}/address/${wallet.address}
   Or open /fund?address=${wallet.address} for a QR + live balance.
2. Check: arcdot wallet status
3. Add MCP in Cursor with the local proxy (see Hub), or:
   arcdot unlock --origin https://YOUR_HOST --service quick-brief --prompt "Hi"

Do NOT put this key on the arcdot. server or paste it into the browser.

Private key: ${wallet.privateKey}
`);
      return;
    }
    if (sub === "import") {
      const force = hasFlag(argv, "--force");
      let key = argValue(argv, "--key")?.trim();
      if (hasFlag(argv, "--from-env")) {
        key =
          process.env.ARCDOT_PRIVATE_KEY?.trim() ||
          process.env.AGENT_PRIVATE_KEY?.trim();
        if (!key) {
          console.error(
            "import --from-env requires ARCDOT_PRIVATE_KEY (or AGENT_PRIVATE_KEY) in the environment.",
          );
          process.exit(1);
        }
      }
      if (!key) {
        console.error(`Missing key source.

Use one of:
  arcdot wallet import --key 0x… [--force]
  arcdot wallet import --from-env [--force]

Never paste the key into IDE chat. Run this in your own terminal.`);
        process.exit(1);
      }
      const wallet = importWallet(key, { force });
      printWalletReady(wallet, "Imported");
      return;
    }
    if (sub === "address") {
      const w = loadWallet();
      if (!w) {
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
        JSON.stringify(
          { address, balanceUsdc: formatted, wei: wei.toString() },
          null,
          2,
        ),
      );
      return;
    }
    if (sub === "status") {
      const status = await getWalletStatus();
      console.log(formatWalletStatusHuman(status));
      console.log("");
      console.log(JSON.stringify(status, null, 2));
      if (status.lowBalance) process.exitCode = 2;
      return;
    }
    console.error(
      "Unknown wallet command. Use create | import | address | balance | status",
    );
    process.exit(1);
  }

  if (cmd === "unlock") {
    const origin =
      argValue(argv, "--origin") || process.env.ARCDOT_ORIGIN || "";
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
      argValue(argv, "--origin") || process.env.ARCDOT_ORIGIN || "";
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
