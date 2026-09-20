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
        "No agent wallet found. Run: npx --yes @arcdot/agent wallet create   OR   wallet import --key 0x… / --from-env",
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

export function isHexPrivateKey(key: string): key is Hex {
  return /^0x[a-fA-F0-9]{64}$/.test(key);
}

/** Prefer ARCDOT_PRIVATE_KEY, then AGENT_PRIVATE_KEY, then ~/.arcdot/wallet.json */
export function resolvePrivateKey(): Hex {
  const fromEnv =
    process.env.ARCDOT_PRIVATE_KEY?.trim() ||
    process.env.AGENT_PRIVATE_KEY?.trim();
  if (fromEnv) {
    if (!isHexPrivateKey(fromEnv)) {
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
      `Could not read agent wallet at ${path}. Re-create with wallet create, or wallet import.`,
    );
  }

  if (!text) {
    return null;
  }

  let raw: StoredWallet;
  try {
    raw = JSON.parse(text) as StoredWallet;
  } catch {
    throw new NoWalletError(
      `Agent wallet file is corrupt at ${path}. Delete it and run wallet create or wallet import --force.`,
    );
  }

  if (!raw.address || !isHexPrivateKey(raw.privateKey)) {
    throw new NoWalletError(
      `Agent wallet file is invalid at ${path}. Delete it and run wallet create or wallet import --force.`,
    );
  }
  return raw;
}

/** Refuse overwrite unless force, empty file, or missing. */
function assertCanWriteWallet(opts?: { force?: boolean }) {
  const path = walletPath();
  if (!existsSync(path) || opts?.force) return;

  const existing = (() => {
    try {
      return loadWallet();
    } catch {
      return null;
    }
  })();
  if (existing) {
    throw new Error(
      `Wallet already exists at ${path}. Pass --force to overwrite, or use wallet address / status.`,
    );
  }
  const size = readFileSync(path).length;
  if (size > 0) {
    throw new Error(
      `Wallet file exists but is unreadable at ${path}. Pass --force to overwrite.`,
    );
  }
}

function writeWalletFile(wallet: StoredWallet): void {
  const path = walletPath();
  mkdirSync(walletDir(), { recursive: true });
  writeFileSync(path, JSON.stringify(wallet, null, 2) + "\n", {
    encoding: "utf8",
    mode: 0o600,
  });
  try {
    chmodSync(path, 0o600);
  } catch {
    // Windows may ignore mode; best-effort
  }
}

export function createWallet(opts?: { force?: boolean }): StoredWallet {
  assertCanWriteWallet(opts);
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  const wallet: StoredWallet = {
    address: account.address,
    privateKey,
    createdAt: new Date().toISOString(),
  };
  writeWalletFile(wallet);
  return wallet;
}

/**
 * Save an existing key to ~/.arcdot/wallet.json (local only).
 * Never paste keys into chat or arcdot. websites.
 */
export function importWallet(
  privateKeyInput: string,
  opts?: { force?: boolean },
): StoredWallet {
  const privateKey = privateKeyInput.trim();
  if (!isHexPrivateKey(privateKey)) {
    throw new Error(
      "Private key must be a 0x-prefixed 32-byte hex string (66 characters).",
    );
  }
  assertCanWriteWallet(opts);
  const account = privateKeyToAccount(privateKey);
  const wallet: StoredWallet = {
    address: account.address,
    privateKey,
    createdAt: new Date().toISOString(),
  };
  writeWalletFile(wallet);
  return wallet;
}

export function walletAccountFromKey(privateKey: Hex) {
  return privateKeyToAccount(privateKey);
}
