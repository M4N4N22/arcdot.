/** Mirror next-app tool naming: arcdot_<slug with underscores>. */

export function toolNameForSlug(slug: string): string {
  return `arcdot_${slug.replace(/-/g, "_")}`;
}

export function slugFromToolName(name: string): string | null {
  if (!name.startsWith("arcdot_")) return null;
  if (name === "arcdot_catalog" || name === "arcdot_health") return null;
  return name.slice("arcdot_".length).replace(/_/g, "-");
}
