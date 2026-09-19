import { NextResponse } from "next/server";
import { recoverMessageAddress, type Hex } from "viem";
import { z } from "zod";
import {
  agentCatalogEnvelope,
  publicServiceForAgent,
} from "@/lib/agent/catalog";
import { ARC } from "@/lib/arc/constants";
import { buildUpdateChallenge } from "@/lib/auth/updateServiceChallenge";
import { getProfile, getServiceBySlug, updateService } from "@/lib/catalog/store";
import { isValidUpstreamUrlShape } from "@/lib/seller/upstream";

export const runtime = "nodejs";

const patchSchema = z.object({
  title: z.string().min(2).max(80).optional(),
  description: z.string().max(500).optional(),
  price_usdc: z.string().regex(/^\d+(\.\d{1,6})?$/).optional(),
  system_prompt: z.string().max(2000).optional(),
  upstream_url: z.string().max(500).optional(),
  upstream_bearer: z.string().max(500).optional(),
  paused: z.boolean().optional(),
  owner_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
  issuedAt: z.number().int().positive(),
});

function usdcToWei(usdc: string): string {
  const [whole, frac = ""] = usdc.split(".");
  const fracPad = (frac + "000000000000000000").slice(0, 18);
  return BigInt(`${whole}${fracPad}`).toString();
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  try {
    const service = await getServiceBySlug(slug);
    if (!service || service.status !== "published" || service.paused) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const profile = await getProfile(service.owner_address);
    const sellerName = profile?.display_name ?? null;
    const { services: _listed, ...meta } = agentCatalogEnvelope(
      [service],
      { [service.owner_address.toLowerCase()]: sellerName },
    );
    return NextResponse.json({
      ...meta,
      service: {
        ...publicServiceForAgent(service, sellerName),
        owner_address: service.owner_address,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not load service" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const body = parsed.data;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - body.issuedAt) > 300) {
    return NextResponse.json({ error: "Signature expired" }, { status: 401 });
  }

  if (
    body.upstream_url !== undefined &&
    body.upstream_url.trim() !== "" &&
    !isValidUpstreamUrlShape(body.upstream_url)
  ) {
    return NextResponse.json(
      { error: "Upstream URL must be https without credentials" },
      { status: 400 },
    );
  }

  const challenge = buildUpdateChallenge({
    slug,
    owner_address: body.owner_address,
    issuedAt: body.issuedAt,
    paused: body.paused,
    title: body.title,
    price_usdc: body.price_usdc,
    upstream_url:
      body.upstream_url !== undefined ? body.upstream_url.trim() : undefined,
  });
  const recovered = await recoverMessageAddress({
    message: challenge,
    signature: body.signature as Hex,
  });
  if (recovered.toLowerCase() !== body.owner_address.toLowerCase()) {
    return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  }

  const patch: Parameters<typeof updateService>[2] = {};
  if (body.title) patch.title = body.title;
  if (body.description !== undefined) patch.description = body.description;
  if (body.system_prompt !== undefined) patch.system_prompt = body.system_prompt;
  if (typeof body.paused === "boolean") patch.paused = body.paused;
  if (body.upstream_url !== undefined) {
    patch.upstream_url = body.upstream_url.trim() || null;
  }
  if (body.upstream_bearer !== undefined) {
    patch.upstream_bearer = body.upstream_bearer.trim() || null;
  }
  if (body.price_usdc) {
    const priceWei = usdcToWei(body.price_usdc);
    if (BigInt(priceWei) < ARC.feeWei) {
      return NextResponse.json(
        { error: "Price is below the platform minimum" },
        { status: 400 },
      );
    }
    patch.price_usdc = body.price_usdc;
    patch.price_wei = priceWei;
  }

  try {
    const service = await updateService(slug, body.owner_address, patch);
    return NextResponse.json({ service });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 },
    );
  }
}
