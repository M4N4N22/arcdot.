/** Parse gateway 402 and MCP payment-needed payloads. */

export type PaymentInstructions = {
  chainId: number;
  gateway: `0x${string}`;
  seller: `0x${string}` | null;
  feeWei: string;
  feeUsdc?: string;
  method?: string;
  rpcUrl?: string;
};

export function isGateway402Body(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.ok !== false || v.status !== 402) return false;
  const err = v.error;
  if (!err || typeof err !== "object") return false;
  return Boolean((err as { payment?: unknown }).payment);
}

export function parsePaymentRequired(
  body: unknown,
): PaymentInstructions | null {
  if (!isGateway402Body(body)) return null;
  const payment = (body as { error: { payment: PaymentInstructions } }).error
    .payment;
  if (!payment?.gateway || !payment.feeWei) return null;
  return payment;
}

/** MCP tools/call often returns payment JSON as text content. */
export function parseMcpPaymentNeeded(toolResult: unknown): {
  payment: PaymentInstructions;
  serviceSlug: string;
  raw: unknown;
} | null {
  const text = extractMcpText(toolResult);
  if (!text) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;
  const err = obj.error as
    | {
        code?: string;
        payment?: PaymentInstructions;
        service?: { slug?: string };
      }
    | undefined;
  if (obj.status === 402 || err?.code === "PAYMENT_REQUIRED") {
    const payment = err?.payment;
    if (!payment?.gateway || !payment.feeWei) return null;
    const slug =
      err?.service?.slug ||
      (typeof obj.service === "string" ? obj.service : "") ||
      "";
    return { payment, serviceSlug: slug, raw: parsed };
  }
  return null;
}

function extractMcpText(toolResult: unknown): string | null {
  if (!toolResult || typeof toolResult !== "object") return null;
  const r = toolResult as {
    content?: Array<{ type?: string; text?: string }>;
    structuredContent?: unknown;
  };
  if (Array.isArray(r.content)) {
    const texts = r.content
      .filter((c) => c?.type === "text" && typeof c.text === "string")
      .map((c) => c.text as string);
    if (texts.length) return texts.join("\n");
  }
  if (typeof (toolResult as { text?: string }).text === "string") {
    return (toolResult as { text: string }).text;
  }
  return null;
}

export function paymentDepositArgs(payment: PaymentInstructions): {
  feeWei: bigint;
  seller: `0x${string}`;
  gateway: `0x${string}`;
  chainId?: number;
  rpcUrl?: string;
} {
  if (!payment.seller) {
    throw new Error("Payment instructions missing seller address");
  }
  return {
    feeWei: BigInt(payment.feeWei),
    seller: payment.seller,
    gateway: payment.gateway,
    chainId: payment.chainId,
    rpcUrl: payment.rpcUrl,
  };
}
