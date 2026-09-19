import { NextResponse } from "next/server";
import { recoverMessageAddress, type Hex } from "viem";
import { buildSignedReadChallenge } from "@/lib/auth/signedReadChallenge";
import { listRequestsForSeller } from "@/lib/catalog/store";

export const runtime = "nodejs";

async function verifyReadSignature(params: {
  address: string;
  signature: string;
  issuedAt: string;
}): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const issuedAt = Number(params.issuedAt);
  if (!Number.isFinite(issuedAt) || issuedAt <= 0) {
    return { ok: false, status: 400, error: "issuedAt required" };
  }
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - issuedAt) > 300) {
    return { ok: false, status: 401, error: "Signature expired" };
  }
  if (!params.signature || !/^0x[a-fA-F0-9]+$/.test(params.signature)) {
    return { ok: false, status: 401, error: "Signature required" };
  }

  const challenge = buildSignedReadChallenge({
    purpose: "sales",
    address: params.address,
    issuedAt,
  });

  let recovered: string;
  try {
    recovered = await recoverMessageAddress({
      message: challenge,
      signature: params.signature as Hex,
    });
  } catch {
    return { ok: false, status: 401, error: "Invalid signature" };
  }

  if (recovered.toLowerCase() !== params.address.toLowerCase()) {
    return { ok: false, status: 401, error: "Wrong signer" };
  }
  return { ok: true };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const address = url.searchParams.get("address");
  const signature = url.searchParams.get("signature") ?? "";
  const issuedAt = url.searchParams.get("issuedAt") ?? "";

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }

  const auth = await verifyReadSignature({ address, signature, issuedAt });
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const sales = await listRequestsForSeller(address);
    return NextResponse.json({ sales });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not load sales" }, { status: 500 });
  }
}
