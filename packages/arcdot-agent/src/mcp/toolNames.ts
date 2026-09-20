/** Fixed MCP tool names — services are discovered, not listed as tools. */

export const MCP_META_TOOLS = [
  "arcdot_discover",
  "arcdot_catalog",
  "arcdot_health",
  "arcdot_unlock",
] as const;

/** @deprecated Prefer arcdot_unlock { service }. */
export function toolNameForSlug(slug: string): string {
  return `arcdot_${slug.replace(/-/g, "_")}`;
}

/** @deprecated Per-service MCP tools retired. */
export function slugFromToolName(name: string): string | null {
  if (!name.startsWith("arcdot_")) return null;
  if ((MCP_META_TOOLS as readonly string[]).includes(name)) return null;
  return name.slice("arcdot_".length).replace(/_/g, "-");
}
