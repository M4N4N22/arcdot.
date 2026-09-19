import { NextResponse } from "next/server";
import { recoverMessageAddress, type Hex } from "viem";
import { z } from "zod";
import {
  buildSignedReadChallenge,
  SIGNED_READ_TTL_SEC,
  type SignedReadPurpose,
} from "@/lib/auth/signedReadChallenge";
import { buildUpdateProfileChallenge } from "@/lib/auth/updateProfileChallenge";
import { getProfile, upsertProfile } from "@/lib/catalog/store";

export const runtime = "nodejs";

const patchSchema = z.object({
  display_name: z.string().max(80),
  bio: z.string().max(500),
  webhook_url: z
    .string()
    .max(500)
    .refine(
      (v) => v === "" || /^https:\/\//i.test(v),
      "Webhook must be an https URL",
    )
    .optional(),
  owner_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
  issuedAt: z.number().int().positive(),
});

function publicProfile(profile: {
  wallet_address: string;
  display_name: string | null;
  bio: string | null;
  created_at: string | null;
}) {
  return {
    wallet_address: profile.wallet_address,
    display_name: profile.display_name,
    bio: profile.bio,
    created_at: profile.created_at,
  };
}

async function verifyOwnerSession(params: {
  address: string;
  signature: string | null;
  issuedAt: string | null;
}): Promise<boolean> {
  if (!params.signature || !params.issuedAt) return false;
  const issuedAt = Number(params.issuedAt);
  if (!Number.isFinite(issuedAt)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (now - issuedAt > SIGNED_READ_TTL_SEC || issuedAt - now > 120) {
    return false;
  }

  const purposes: SignedReadPurpose[] = ["session", "activity", "sales"];
  for (const purpose of purposes) {
    const challenge = buildSignedReadChallenge({
      purpose,
      address: params.address,
      issuedAt,
    });
    try {
      const recovered = await recoverMessageAddress({
        message: challenge,
        signature: params.signature as Hex,
      });
      if (recovered.toLowerCase() === params.address.toLowerCase()) {
        return true;
      }
    } catch {
      // next
    }
  }
  return false;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const address = url.searchParams.get("address");
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }
  try {
    const profile = await getProfile(address);
    const base = publicProfile(
      profile ?? {
        wallet_address: address.toLowerCase(),
        display_name: null,
        bio: null,
        created_at: null,
      },
    );

    const ownerOk = await verifyOwnerSession({
      address,
      signature: url.searchParams.get("signature"),
      issuedAt: url.searchParams.get("issuedAt"),
    });

    return NextResponse.json({
      profile: ownerOk
        ? { ...base, webhook_url: profile?.webhook_url ?? null }
        : base,
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

  const webhook_url = body.webhook_url ?? "";
  const challenge = buildUpdateProfileChallenge({
    owner_address: body.owner_address,
    display_name: body.display_name,
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

  try {
    const profile = await upsertProfile({
      wallet_address: body.owner_address,
      display_name: body.display_name.trim() || null,
      bio: body.bio.trim() || null,
      webhook_url: webhook_url.trim() || null,
    });
    return NextResponse.json({
      profile: {
        ...publicProfile(profile),
        webhook_url: profile.webhook_url ?? null,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not save profile" }, { status: 500 });
  }
}
