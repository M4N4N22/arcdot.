import { NextResponse } from "next/server";
import { recoverMessageAddress, type Hex } from "viem";
import { z } from "zod";
import { buildUpdateProfileChallenge } from "@/lib/auth/updateProfileChallenge";
import { getProfile } from "@/lib/catalog/store";
import { notifySellerWebhook, type SaleReceipt } from "@/lib/seller/webhook";

export const runtime = "nodejs";

const bodySchema = z.object({
  owner_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
  issuedAt: z.number().int().positive(),
  display_name: z.string().max(80).optional(),
  webhook_url: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const body = parsed.data;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - body.issuedAt) > 300) {
    return NextResponse.json({ error: "Signature expired" }, { status: 401 });
  }

  const profile = await getProfile(body.owner_address).catch(() => null);
  const display_name =
    body.display_name ?? profile?.display_name ?? "";
  const webhook_url =
    body.webhook_url ?? profile?.webhook_url ?? "";

  const challenge = buildUpdateProfileChallenge({
    owner_address: body.owner_address,
    display_name,
    webhook_url,
    issuedAt: body.issuedAt,
  });

  let recovered: string;
  try {
    recovered = await recoverMessageAddress({
      message: challenge,
      signature: body.signature as Hex,
    });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (recovered.toLowerCase() !== body.owner_address.toLowerCase()) {
    return NextResponse.json({ error: "Wrong signer" }, { status: 401 });
  }

  if (!webhook_url || !/^https:\/\//i.test(webhook_url)) {
    return NextResponse.json(
      { error: "Save an https webhook URL first" },
      { status: 400 },
    );
  }

  const receipt: SaleReceipt = {
    event: "sale.fulfilled",
    txHash: null,
    paymentId: null,
    service: "webhook-ping",
    amountUsdc: "0",
    sellerAmountUsdc: null,
    at: new Date().toISOString(),
  };

  await notifySellerWebhook({
    sellerAddress: body.owner_address,
    receipt,
    webhookUrl: webhook_url,
  });

  return NextResponse.json({ ok: true, sent: true, receipt });
}
