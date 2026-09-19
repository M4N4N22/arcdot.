import { NextResponse } from "next/server";
import { recoverMessageAddress, type Hex } from "viem";
import { z } from "zod";
import { ARC } from "@/lib/arc/constants";
import { buildCreateChallenge } from "@/lib/auth/createServiceChallenge";
import {
  createService,
  listPublishedServices,
  upsertProfile,
} from "@/lib/catalog/store";

export const runtime = "nodejs";

const createSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(48)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(2).max(80),
  description: z.string().max(500),
  price_usdc: z.string().regex(/^\d+(\.\d{1,6})?$/),
  system_prompt: z.string().max(2000),
  owner_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
  issuedAt: z.number().int().positive(),
});

function usdcToWei(usdc: string): string {
  const [whole, frac = ""] = usdc.split(".");
  const fracPad = (frac + "000000000000000000").slice(0, 18);
  return BigInt(`${whole}${fracPad}`).toString();
}

export async function GET() {
  try {
    const services = await listPublishedServices();
    return NextResponse.json({
      services: services.map((s) => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        description: s.description,
        price_usdc: s.price_usdc,
        price_wei: s.price_wei,
        owner_address: s.owner_address,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not load services" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const body = parsed.data;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - body.issuedAt) > 300) {
    return NextResponse.json({ error: "Signature expired" }, { status: 401 });
  }

  const priceWei = usdcToWei(body.price_usdc);
  if (BigInt(priceWei) < ARC.feeWei) {
    return NextResponse.json(
      { error: "Price is below the platform minimum" },
      { status: 400 },
    );
  }

  const challenge = buildCreateChallenge(body);
  const recovered = await recoverMessageAddress({
    message: challenge,
    signature: body.signature as Hex,
  });

  if (recovered.toLowerCase() !== body.owner_address.toLowerCase()) {
    return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  }

  try {
    await upsertProfile({
      wallet_address: body.owner_address,
      display_name: body.title.slice(0, 40),
    });

    const service = await createService({
      slug: body.slug,
      owner_address: body.owner_address.toLowerCase(),
      title: body.title,
      description: body.description,
      price_wei: priceWei,
      price_usdc: body.price_usdc,
      system_prompt: body.system_prompt,
      status: "published",
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (err) {
    console.error(err);
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "Could not create service";
    const conflict = message.toLowerCase().includes("duplicate");
    return NextResponse.json(
      { error: conflict ? "That URL slug is already taken" : message },
      { status: conflict ? 409 : 500 },
    );
  }
}
