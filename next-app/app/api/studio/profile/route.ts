import { NextResponse } from "next/server";
import { recoverMessageAddress, type Hex } from "viem";
import { z } from "zod";
import { buildUpdateProfileChallenge } from "@/lib/auth/updateProfileChallenge";
import { getProfile, upsertProfile } from "@/lib/catalog/store";

export const runtime = "nodejs";

const patchSchema = z.object({
  display_name: z.string().max(80),
  bio: z.string().max(500),
  owner_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
  issuedAt: z.number().int().positive(),
});

export async function GET(request: Request) {
  const address = new URL(request.url).searchParams.get("address");
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }
  try {
    const profile = await getProfile(address);
    return NextResponse.json({
      profile: profile ?? {
        wallet_address: address.toLowerCase(),
        display_name: null,
        bio: null,
        created_at: null,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not load profile" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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

  const challenge = buildUpdateProfileChallenge({
    owner_address: body.owner_address,
    display_name: body.display_name,
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

  try {
    const profile = await upsertProfile({
      wallet_address: body.owner_address,
      display_name: body.display_name.trim() || null,
      bio: body.bio.trim() || null,
    });
    return NextResponse.json({ profile });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not save profile" }, { status: 500 });
  }
}
