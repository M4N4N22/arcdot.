import { NextResponse } from "next/server";
import { recoverMessageAddress, type Hex } from "viem";
import { z } from "zod";
import { buildUploadImageChallenge } from "@/lib/auth/uploadImageChallenge";
import {
  SERVICE_IMAGE_BUCKET,
  SERVICE_IMAGE_MAX_BYTES,
  SERVICE_IMAGE_MIME,
  extensionForMime,
} from "@/lib/services/image";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";

const metaSchema = z.object({
  owner_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
  issuedAt: z.coerce.number().int().positive(),
});

/**
 * Upload a tool cover / logo.
 * Multipart: file, owner_address, signature, issuedAt.
 * With Supabase → public Storage URL. Without → data URL for local demo.
 */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const parsed = metaSchema.safeParse({
    owner_address: form.get("owner_address"),
    signature: form.get("signature"),
    issuedAt: form.get("issuedAt"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid upload auth" }, { status: 400 });
  }

  const body = parsed.data;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - body.issuedAt) > 300) {
    return NextResponse.json({ error: "Signature expired" }, { status: 401 });
  }

  const challenge = buildUploadImageChallenge({
    owner_address: body.owner_address,
    issuedAt: body.issuedAt,
  });
  const recovered = await recoverMessageAddress({
    message: challenge,
    signature: body.signature as Hex,
  });
  if (recovered.toLowerCase() !== body.owner_address.toLowerCase()) {
    return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing image file" }, { status: 400 });
  }
  if (!SERVICE_IMAGE_MIME.has(file.type)) {
    return NextResponse.json(
      { error: "Use JPEG, PNG, WebP, or GIF" },
      { status: 400 },
    );
  }
  if (file.size <= 0 || file.size > SERVICE_IMAGE_MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be under 2 MB" },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = extensionForMime(file.type);
  const owner = body.owner_address.toLowerCase();
  const objectPath = `${owner}/${crypto.randomUUID()}.${ext}`;

  if (!isSupabaseConfigured()) {
    const dataUrl = `data:${file.type};base64,${bytes.toString("base64")}`;
    return NextResponse.json({ url: dataUrl, storage: "memory" });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error: uploadError } = await supabase.storage
      .from(SERVICE_IMAGE_BUCKET)
      .upload(objectPath, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      // Create bucket once if missing, then retry.
      const missingBucket =
        uploadError.message?.toLowerCase().includes("bucket") ||
        uploadError.message?.toLowerCase().includes("not found");
      if (missingBucket) {
        await supabase.storage.createBucket(SERVICE_IMAGE_BUCKET, {
          public: true,
          fileSizeLimit: SERVICE_IMAGE_MAX_BYTES,
          allowedMimeTypes: [...SERVICE_IMAGE_MIME],
        });
        const retry = await supabase.storage
          .from(SERVICE_IMAGE_BUCKET)
          .upload(objectPath, bytes, {
            contentType: file.type,
            upsert: false,
          });
        if (retry.error) {
          console.error(retry.error);
          return NextResponse.json(
            { error: retry.error.message || "Upload failed" },
            { status: 500 },
          );
        }
      } else {
        console.error(uploadError);
        return NextResponse.json(
          { error: uploadError.message || "Upload failed" },
          { status: 500 },
        );
      }
    }

    const { data } = supabase.storage
      .from(SERVICE_IMAGE_BUCKET)
      .getPublicUrl(objectPath);

    return NextResponse.json({ url: data.publicUrl, storage: "supabase" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }
}
