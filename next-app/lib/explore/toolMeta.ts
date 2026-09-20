/** Static enrichment for Explore tool cards & detail pages. Not a DB table. */

export type ToolMeta = {
  tagline?: string;
  category: string;
  useCases: string[];
  /** Optional path under /public, e.g. /tools/quick-brief.png */
  imagePath?: string | null;
};

const FEATURED_SLUGS = [
  "quick-brief",
  "tone-polish",
  "agent-checklist",
] as const;

export type FeaturedSlug = (typeof FEATURED_SLUGS)[number];

export const FEATURED_TOOL_SLUGS: readonly string[] = FEATURED_SLUGS;

const META: Record<string, ToolMeta> = {
  "quick-brief": {
    category: "Writing",
    tagline: "Messy question → two clear sentences.",
    useCases: [
      "Turn a long Slack thread into a brief for your next meeting",
      "Summarize a research dump before an agent plans work",
      "Clarify a vague product ask for engineering",
      "Compress notes into something you can paste into a ticket",
    ],
    imagePath: null,
  },
  "tone-polish": {
    category: "Writing",
    tagline: "Calm, clear, professional rewrites.",
    useCases: [
      "Soften a blunt email before you hit send",
      "Polish customer-facing copy without losing meaning",
      "Normalize tone across agent-generated messages",
      "Rewrite docs so they read less robotic",
    ],
    imagePath: null,
  },
  "agent-checklist": {
    category: "Ops",
    tagline: "Short actionable checklists for agent tasks.",
    useCases: [
      "Break a goal into five concrete agent steps",
      "Hand off a runbook before an autonomous loop starts",
      "Verify nothing critical was skipped after a tool run",
      "Scaffold QA steps for a payment or unlock flow",
    ],
    imagePath: null,
  },
};

export function getToolMeta(
  slug: string,
  fallbackDescription?: string,
): ToolMeta {
  const known = META[slug];
  if (known) return known;
  return {
    category: "Tool",
    tagline: fallbackDescription?.slice(0, 120) || undefined,
    useCases: fallbackDescription
      ? [fallbackDescription]
      : ["Pay a few cents in USDC on Arc to unlock a reply from this tool."],
    imagePath: null,
  };
}

/** Featured seeds first, then remaining published tools by created_at desc. */
export function sortExploreTools<T extends { slug: string; created_at: string }>(
  tools: T[],
): T[] {
  const featured = FEATURED_TOOL_SLUGS.map((slug) =>
    tools.find((t) => t.slug === slug),
  ).filter(Boolean) as T[];
  const featuredSet = new Set(FEATURED_TOOL_SLUGS);
  const rest = tools
    .filter((t) => !featuredSet.has(t.slug))
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  return [...featured, ...rest];
}

export function resolveToolImage(opts: {
  imageUrl?: string | null;
  slug: string;
}): string | null {
  const fromRow = opts.imageUrl?.trim();
  if (fromRow) return fromRow;
  const fromMeta = getToolMeta(opts.slug).imagePath?.trim();
  if (fromMeta) return fromMeta;
  return null;
}
