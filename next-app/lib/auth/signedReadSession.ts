/** Client-side cache for EIP-191 private-read sessions (Activity / Sales / Profile). */

import {
  buildSignedReadChallenge,
  SIGNED_READ_TTL_SEC,
  type SignedReadPurpose,
} from "@/lib/auth/signedReadChallenge";

export type SignedReadSession = {
  address: string;
  purpose: SignedReadPurpose;
  signature: string;
  issuedAt: number;
};

const STORAGE_PREFIX = "arcdot.signedRead.v1:";
const inflight = new Map<string, Promise<SignedReadSession>>();

function storageKey(address: string, purpose: SignedReadPurpose): string {
  return `${STORAGE_PREFIX}${purpose}:${address.toLowerCase()}`;
}

function isFresh(issuedAt: number, nowSec = Math.floor(Date.now() / 1000)): boolean {
  // renew a bit before server expiry
  const skew = 60;
  return nowSec - issuedAt < SIGNED_READ_TTL_SEC - skew && nowSec - issuedAt >= 0;
}

export function readCachedSignedSession(
  address: string,
  purpose: SignedReadPurpose = "session",
): SignedReadSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey(address, purpose));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SignedReadSession;
    if (
      !parsed?.signature ||
      !parsed?.issuedAt ||
      parsed.address?.toLowerCase() !== address.toLowerCase() ||
      parsed.purpose !== purpose
    ) {
      return null;
    }
    if (!isFresh(parsed.issuedAt)) {
      sessionStorage.removeItem(storageKey(address, purpose));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCachedSignedSession(session: SignedReadSession): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      storageKey(session.address, session.purpose),
      JSON.stringify(session),
    );
  } catch {
    // ignore quota / private mode
  }
}

export function clearSignedReadSessions(address?: string): void {
  if (typeof window === "undefined") return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (!k?.startsWith(STORAGE_PREFIX)) continue;
      if (address && !k.toLowerCase().includes(address.toLowerCase())) continue;
      keys.push(k);
    }
    for (const k of keys) sessionStorage.removeItem(k);
  } catch {
    // ignore
  }
}

/**
 * Return a cached session or prompt the wallet once.
 * Concurrent callers share one in-flight signature request.
 */
export async function ensureSignedReadSession(params: {
  address: string;
  signMessageAsync: (args: { message: string }) => Promise<string>;
  purpose?: SignedReadPurpose;
  /** If true, never prompt — return null when cache miss. */
  silent?: boolean;
}): Promise<SignedReadSession | null> {
  const purpose = params.purpose ?? "session";
  const cached = readCachedSignedSession(params.address, purpose);
  if (cached) return cached;
  if (params.silent) return null;

  const key = storageKey(params.address, purpose);
  const existing = inflight.get(key);
  if (existing) return existing;

  const promise = (async (): Promise<SignedReadSession> => {
    const issuedAt = Math.floor(Date.now() / 1000);
    const challenge = buildSignedReadChallenge({
      purpose,
      address: params.address,
      issuedAt,
    });
    const signature = await params.signMessageAsync({ message: challenge });
    const session: SignedReadSession = {
      address: params.address.toLowerCase(),
      purpose,
      signature,
      issuedAt,
    };
    writeCachedSignedSession(session);
    return session;
  })().finally(() => {
    inflight.delete(key);
  });

  inflight.set(key, promise);
  return promise;
}

export function signedReadQuery(session: SignedReadSession): string {
  return new URLSearchParams({
    address: session.address,
    signature: session.signature,
    issuedAt: String(session.issuedAt),
  }).toString();
}
