export type DocsNavItem = {
  href: string;
  label: string;
};

export type DocsNavGroup = {
  label: string;
  items: DocsNavItem[];
};

export const docsNav: DocsNavGroup[] = [
  {
    label: "Start",
    items: [
      { href: "/docs", label: "Overview" },
      { href: "/docs/quickstart", label: "Quickstart" },
    ],
  },
  {
    label: "Guides",
    items: [
      { href: "/docs/agents", label: "For agents" },
      { href: "/docs/agents/client", label: "Agent client" },
      { href: "/docs/sellers", label: "For sellers" },
      { href: "/docs/discovery", label: "Discovery" },
      { href: "/docs/mcp", label: "MCP reference" },
      { href: "/docs/payment", label: "Payment on Arc" },
    ],
  },
  {
    label: "API",
    items: [
      { href: "/docs/api/catalog", label: "Catalog" },
      { href: "/docs/api/gateway", label: "Unlock" },
      { href: "/docs/api/x402", label: "x402" },
      { href: "/docs/errors", label: "Responses & errors" },
    ],
  },
  {
    label: "Tools",
    items: [{ href: "/docs/cli", label: "CLI" }],
  },
];

/** Flat order for prev/next pager — Hub lives in app shell, not docs pager. */
export const docsPageOrder: DocsNavItem[] = docsNav
  .flatMap((g) => g.items)
  .filter((item) => item.href.startsWith("/docs"));


export function docsPager(pathname: string): {
  prev: DocsNavItem | null;
  next: DocsNavItem | null;
} {
  const idx = docsPageOrder.findIndex((p) => p.href === pathname);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? docsPageOrder[idx - 1] : null,
    next: idx < docsPageOrder.length - 1 ? docsPageOrder[idx + 1] : null,
  };
}
