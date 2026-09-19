/**
 * Process-local spent tx hashes.
 * Survives warm invocations; resets on cold start (acceptable for demo).
 * On-chain usedPaymentId still prevents double-deposit.
 */
const globalStore = globalThis as typeof globalThis & {
  __arcdotSpentTxHashes?: Map<string, number>;
};

function store(): Map<string, number> {
  if (!globalStore.__arcdotSpentTxHashes) {
    globalStore.__arcdotSpentTxHashes = new Map();
  }
  return globalStore.__arcdotSpentTxHashes;
}

export function hasConsumedTx(txHash: string): boolean {
  return store().has(txHash.toLowerCase());
}

export function markConsumedTx(txHash: string): void {
  store().set(txHash.toLowerCase(), Date.now());
}
