/** Allowed tool cover / logo MIME types. */
export const SERVICE_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const SERVICE_IMAGE_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
export const SERVICE_IMAGE_BUCKET = "service-images";

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function extensionForMime(mime: string): string {
  return EXT_BY_MIME[mime] ?? "bin";
}

/** Accept https URLs or data:image URLs used in local/dev fallbacks. */
export function isValidServiceImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed || trimmed.length > 2_000_000) return false;
  if (trimmed.startsWith("data:image/")) {
    return /^data:image\/(jpeg|png|webp|gif);base64,/i.test(trimmed);
  }
  try {
    const u = new URL(trimmed);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}
