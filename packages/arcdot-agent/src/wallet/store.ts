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

export class NoWalletError extends Error {
  readonly code = "NO_WALLET" as const;

  constructor(message?: string) {
    super(
      message ??
        "No agent wallet found. Run: npx --yes @arcdot/agent wallet create",
    );
    this.name = "NoWalletError";
  }
}

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
    throw new NoWalletError();
  }
  return stored.privateKey;
}

/**
 * Load local wallet. Missing, empty, or corrupt files return null or throw
 * NoWalletError — never raw JSON.parse failures for the MCP host to surface.
 */
export function loadWallet(): StoredWallet | null {
  const path = walletPath();
  if (!existsSync(path)) return null;

  let text: string;
  try {
    text = readFileSync(path, "utf8").trim();
  } catch {
    throw new NoWalletError(
      `Could not read agent wallet at ${path}. Re-create with: npx --yes @arcdot/agent wallet create`,
    );
  }

  if (!text) {
    // Empty file after a wipe — treat as missing, not a parse crash.
    return null;
  }

  let raw: StoredWallet;
  try {
    raw = JSON.parse(text) as StoredWallet;
  } catch {
    throw new NoWalletError(
      `Agent wallet file is corrupt at ${path}. Delete it and run: npx --yes @arcdot/agent wallet create`,
    );
  }

  if (!raw.address || !isHexKey(raw.privateKey)) {
    throw new NoWalletError(
      `Agent wallet file is invalid at ${path}. Delete it and run: npx --yes @arcdot/agent wallet create`,
    );
  }
  return raw;
}

export function createWallet(opts?: { force?: boolean }): StoredWallet {
  const path = walletPath();
  if (existsSync(path) && !opts?.force) {
    const existing = (() => {
      try {
        return loadWallet();
      } catch {
        return null;
      }
    })();
    // Allow recreate when the file is empty/corrupt without requiring --force
    // only if load returned null (empty). Corrupt throws — user can --force.
    if (existing) {
      throw new Error(
        `Wallet already exists at ${path}. Pass --force to overwrite, or use wallet address.`,
      );
    }
    const size = existsSync(path) ? readFileSync(path).length : 0;
    if (size > 0) {
      throw new Error(
        `Wallet file exists but is unreadable at ${path}. Pass --force to overwrite.`,
      );
    }
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
