/**
 * SSRF-safe proxy to seller-owned upstream APIs after Arc settlement.
 */

import type { GatewaySettlement } from "@/lib/types/gateway";
import { lookup } from "dns/promises";
import { isIP } from "net";

const MAX_RESPONSE_BYTES = 256 * 1024;
const TIMEOUT_MS = 15_000;

export class UpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UpstreamError";
  }
}

function isPrivateOrLocalIp(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === "127.0.0.1" || v === "::1" || v === "0.0.0.0") return true;
  if (v.startsWith("10.")) return true;
  if (v.startsWith("192.168.")) return true;
  if (v.startsWith("169.254.")) return true;
  if (v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80")) return true;
  // 172.16.0.0 – 172.31.255.255
  const m = /^172\.(\d+)\./.exec(v);
  if (m) {
    const second = Number(m[1]);
    if (second >= 16 && second <= 31) return true;
  }
  // 100.64.0.0/10 CGNAT
  const m100 = /^100\.(\d+)\./.exec(v);
  if (m100) {
    const second = Number(m100[1]);
    if (second >= 64 && second <= 127) return true;
  }
  return false;
}

/** Validate https URL and resolve host to non-private addresses. */
export async function assertSafeUpstreamUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new UpstreamError("Invalid upstream URL");
  }
  if (url.protocol !== "https:") {
    throw new UpstreamError("Upstream URL must be https");
  }
  if (url.username || url.password) {
    throw new UpstreamError("Upstream URL must not include credentials");
  }
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host === "metadata.google.internal"
  ) {
    throw new UpstreamError("Upstream host is not allowed");
  }

  const literal = isIP(host);
  if (literal) {
    if (isPrivateOrLocalIp(host)) {
      throw new UpstreamError("Upstream host is not allowed");
    }
    return url;
  }

  let records: { address: string; family: number }[];
  try {
    records = await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new UpstreamError("Could not resolve upstream host");
  }
  if (!records.length) {
    throw new UpstreamError("Could not resolve upstream host");
  }
  for (const r of records) {
    if (isPrivateOrLocalIp(r.address)) {
      throw new UpstreamError("Upstream host resolves to a private address");
    }
  }
  return url;
}

export type UpstreamCallParams = {
  upstreamUrl: string;
  upstreamBearer?: string | null;
  prompt: string;
  input: unknown;
  service: string;
  requestId: string;
  settlement: GatewaySettlement;
};

export async function callSellerUpstream(
  params: UpstreamCallParams,
): Promise<{ text: string }> {
  const url = await assertSafeUpstreamUrl(params.upstreamUrl);

  const body = JSON.stringify({
    prompt: params.prompt,
    input: params.input,
    service: params.service,
    requestId: params.requestId,
    settlement: {
      txHash: params.settlement.txHash,
      paymentId: params.settlement.paymentId,
      payer: params.settlement.payer,
    },
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "arcdot-gateway/1",
  };
  const bearer = params.upstreamBearer?.trim();
  if (bearer) {
    headers.Authorization = bearer.toLowerCase().startsWith("bearer ")
      ? bearer
      : `Bearer ${bearer}`;
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: "POST",
      headers,
      body,
      redirect: "error",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    throw new UpstreamError(
      err instanceof Error ? err.message : "Upstream request failed",
    );
  }

  const buf = await res.arrayBuffer();
  if (buf.byteLength > MAX_RESPONSE_BYTES) {
    throw new UpstreamError("Upstream response too large");
  }
  const raw = new TextDecoder().decode(buf);

  if (!res.ok) {
    throw new UpstreamError(
      `Upstream returned HTTP ${res.status}: ${raw.slice(0, 200)}`,
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new UpstreamError("Upstream response must be JSON");
  }

  if (!json || typeof json !== "object") {
    throw new UpstreamError("Upstream response must be a JSON object");
  }
  const obj = json as Record<string, unknown>;
  if (typeof obj.text === "string") {
    return { text: obj.text };
  }
  if (typeof obj.result === "string") {
    return { text: obj.result };
  }
  throw new UpstreamError(
    'Upstream JSON must include string field "text" or "result"',
  );
}

/** Validate URL shape for create/update (DNS check deferred to fulfill). */
export function isValidUpstreamUrlShape(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}
