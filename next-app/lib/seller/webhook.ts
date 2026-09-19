import { createHmac } from "crypto";
import { getProfile } from "@/lib/catalog/store";

export type SaleReceipt = {
  event: "sale.fulfilled";
  txHash: string | null;
  paymentId: string | null;
  service: string;
  amountUsdc: string;
  sellerAmountUsdc: string | null;
  at: string;
};

export function signWebhookBody(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export async function notifySellerWebhook(params: {
  sellerAddress: string;
  receipt: SaleReceipt;
  /** Override profile webhook (e.g. Studio test ping). */
  webhookUrl?: string | null;
}): Promise<void> {
  const secret = process.env.WEBHOOK_HMAC_SECRET;
  const profile = await getProfile(params.sellerAddress).catch(() => null);
  const url = (params.webhookUrl ?? profile?.webhook_url)?.trim();
  if (!url || !/^https:\/\//i.test(url)) return;

  const body = JSON.stringify(params.receipt);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "arcdot-webhook/1",
  };
  if (secret) {
    headers["X-ArcDot-Signature"] = signWebhookBody(body, secret);
  }

  try {
    await fetch(url, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    console.error("seller webhook failed", err);
  }
}
