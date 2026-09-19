import { mkdirSync, readFileSync, writeFileSync, existsSync, chmodSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export type StoredWallet = {
  address: `0x${string}`;
  privateKey: Hex;
  createdAt: string;
};

function walletDir(): string {
  return process.env.ARCDOT_HOME?.trim() || join(homedir(), ".arcdot");
}

export function walletPath(): string {
  return join(walletDir(), "wallet.json");
}

function isHexKey(key: string): key is Hex {
  return /^0x[a-fA-F0-9]{64}$/.test(key);
}

/** Prefer ARCDOT_PRIVATE_KEY, then AGENT_PRIVATE_KEY, then ~/.arcdot/wallet.json */
export function resolvePrivateKey(): Hex {
  const fromEnv =
    process.env.ARCDOT_PRIVATE_KEY?.trim() ||
    process.env.AGENT_PRIVATE_KEY?.trim();
  if (fromEnv) {
    if (!isHexKey(fromEnv)) {
      throw new Error(
        "ARCDOT_PRIVATE_KEY / AGENT_PRIVATE_KEY must be a 0x-prefixed 32-byte hex key.",
      );
    }
    return fromEnv;
  }
  const stored = loadWallet();
  if (!stored) {
    throw new Error(
      "No agent wallet found. Run: npx @arcdot/agent wallet create",
    );
  }
  return stored.privateKey;
}

export function loadWallet(): StoredWallet | null {
  const path = walletPath();
  if (!existsSync(path)) return null;
  const raw = JSON.parse(readFileSync(path, "utf8")) as StoredWallet;
  if (!raw.address || !isHexKey(raw.privateKey)) {
    throw new Error(`Corrupt wallet file at ${path}`);
  }
  return raw;
}

export function createWallet(opts?: { force?: boolean }): StoredWallet {
  const path = walletPath();
  if (existsSync(path) && !opts?.force) {
    throw new Error(
      `Wallet already exists at ${path}. Pass --force to overwrite, or use wallet address.`,
    );
  }
  mkdirSync(walletDir(), { recursive: true });
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  const wallet: StoredWallet = {
    address: account.address,
    privateKey,
    createdAt: new Date().toISOString(),
  };
  writeFileSync(path, JSON.stringify(wallet, null, 2) + "\n", {
    encoding: "utf8",
    mode: 0o600,
  });
  try {
    chmodSync(path, 0o600);
  } catch {
    // Windows may ignore mode; best-effort
  }
  return wallet;
}

export function walletAccountFromKey(privateKey: Hex) {
  return privateKeyToAccount(privateKey);
}
