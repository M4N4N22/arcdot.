/**
 * Probe a live arcdot. origin: well-known + catalog + pay instructions.
 *
 * Usage (from next-app/):
 *   npm run agent:probe -- https://your-host.example
 *   npm run agent:probe -- http://localhost:3000
 */

async function main() {
  const origin = (process.argv[2] || process.env.ARCDOT_BASE_URL || "")
    .replace(/\/$/, "");
  if (!origin || !/^https?:\/\//i.test(origin)) {
    console.error(
      "Usage: npm run agent:probe -- <ORIGIN>\nExample: npm run agent:probe -- http://localhost:3000",
    );
    process.exit(1);
  }

  const out: Record<string, unknown> = { origin };

  const wellKnown = await fetch(new URL("/.well-known/arcdot.json", origin));
  out.wellKnown = {
    status: wellKnown.status,
    ok: wellKnown.ok,
    body: wellKnown.ok ? await wellKnown.json() : await wellKnown.text(),
  };

  const health = await fetch(new URL("/api/health", origin));
  const healthJson = (await health.json()) as Record<string, unknown>;
  out.health = {
    status: health.status,
    durableStore: healthJson.durableStore,
    chainId: healthJson.chainId,
    gatewayAddress: healthJson.gatewayAddress,
    ok: healthJson.ok,
  };

  const catalog = await fetch(new URL("/api/services", origin));
  const catalogJson = (await catalog.json()) as {
    gateway?: string | null;
    chainId?: number;
    services?: Array<{
      slug: string;
      price_wei: string;
      price_usdc: string;
      seller?: string;
      title?: string;
    }>;
  };

  const first = catalogJson.services?.[0];
  out.catalog = {
    status: catalog.status,
    serviceCount: catalogJson.services?.length ?? 0,
    gateway: catalogJson.gateway ?? null,
    chainId: catalogJson.chainId ?? null,
  };

  if (!first) {
    out.paymentInstructions = null;
    out.error = "No published services — cannot print pay instructions";
    console.log(JSON.stringify(out, null, 2));
    process.exit(2);
  }

  // Probe unpaid unlock → 402 pay instructions
  const unlock = await fetch(new URL("/api/gateway", origin), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service: first.slug,
      input: { prompt: "probe" },
      auth: {
        issuedAt: Math.floor(Date.now() / 1000),
        expiresAt: Math.floor(Date.now() / 1000) + 120,
      },
    }),
  });
  const unlockJson = (await unlock.json()) as {
    error?: { payment?: unknown; code?: string; message?: string };
  };

  out.firstService = {
    slug: first.slug,
    title: first.title,
    price_usdc: first.price_usdc,
    price_wei: first.price_wei,
    seller: first.seller,
  };

  out.paymentRequired = {
    status: unlock.status,
    code: unlockJson.error?.code ?? null,
    payment: unlockJson.error?.payment ?? null,
  };

  out.hint =
    "Pay depositPayment(paymentId, seller) with msg.value == price_wei on chain 5042, then POST /api/gateway with X-Arc-* headers. See /docs/agents/client";

  console.log(JSON.stringify(out, null, 2));
  if (unlock.status !== 402) {
    process.exit(3);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
