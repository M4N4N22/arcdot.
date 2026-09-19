import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isGateway402Body,
  parseMcpPaymentNeeded,
  parsePaymentRequired,
  paymentDepositArgs,
} from "../src/client/paymentParse.js";
import { slugFromToolName, toolNameForSlug } from "../src/mcp/toolNames.js";
import { makePaymentId } from "../src/settle/paymentId.js";

describe("paymentParse", () => {
  it("parses gateway 402 bodies", () => {
    const body = {
      ok: false,
      status: 402,
      error: {
        code: "PAYMENT_REQUIRED",
        message: "pay",
        payment: {
          chainId: 5042,
          gateway: "0x1111111111111111111111111111111111111111",
          seller: "0x2222222222222222222222222222222222222222",
          feeWei: "10000000000000000",
        },
      },
    };
    assert.equal(isGateway402Body(body), true);
    const p = parsePaymentRequired(body);
    assert.ok(p);
    const args = paymentDepositArgs(p!);
    assert.equal(args.feeWei, 10_000_000_000_000_000n);
    assert.equal(args.seller, body.error.payment.seller);
  });

  it("parses MCP payment-needed tool text", () => {
    const unpaid = {
      ok: false,
      status: 402,
      error: {
        code: "PAYMENT_REQUIRED",
        payment: {
          chainId: 5042,
          gateway: "0x1111111111111111111111111111111111111111",
          seller: "0x2222222222222222222222222222222222222222",
          feeWei: "20000000000000000",
        },
        service: { slug: "quick-brief" },
      },
    };
    const toolResult = {
      content: [{ type: "text", text: JSON.stringify(unpaid) }],
      isError: true,
    };
    const parsed = parseMcpPaymentNeeded(toolResult);
    assert.ok(parsed);
    assert.equal(parsed!.serviceSlug, "quick-brief");
    assert.equal(parsed!.payment.feeWei, "20000000000000000");
  });
});

describe("toolNames", () => {
  it("round-trips slug ↔ tool name", () => {
    assert.equal(toolNameForSlug("quick-brief"), "arcdot_quick_brief");
    assert.equal(slugFromToolName("arcdot_quick_brief"), "quick-brief");
    assert.equal(slugFromToolName("arcdot_catalog"), null);
  });
});

describe("paymentId", () => {
  it("is deterministic", () => {
    const a = makePaymentId({
      payer: "0x1111111111111111111111111111111111111111",
      service: "quick-brief",
      nonce: 1,
    });
    const b = makePaymentId({
      payer: "0x1111111111111111111111111111111111111111",
      service: "quick-brief",
      nonce: 1,
    });
    assert.equal(a, b);
  });
});
