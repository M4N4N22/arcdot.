/**
 * Client + server safe URL shape checks for seller agent endpoints.
 * (Keep DNS/SSRF checks in upstream.ts — those are server-only.)
 */

export function isLocalDevHost(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "::1" ||
    h.endsWith(".localhost")
  );
}

/**
 * Accept https anywhere, or http on loopback hosts (local SDK/MCP rehearsal).
 * Loopback is always allowed for shape checks — real SSRF still blocks
 * non-first-party localhost fetches in assertSafeUpstreamUrl.
 */
export function isValidUpstreamUrlShape(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    if (url.username || url.password) return false;
    if (url.protocol === "https:") return true;
    if (url.protocol === "http:" && isLocalDevHost(url.hostname)) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function upstreamUrlError(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "Agent endpoint URL is required.";
  if (isValidUpstreamUrlShape(trimmed)) return null;
  return "Use an https URL, or http://localhost:3000/… while testing locally.";
}
