"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

type NavChild = {
  href: string;
  label: string;
};

type NavPillar = {
  id: string;
  href: string;
  label: string;
  icon: ReactNode;
  children?: NavChild[];
};

function IconHub({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="3.5" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="14.5" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="3.5" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="14.5" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M5 5.2 7.4 7.6M13 5.2 10.6 7.6M5 12.8 7.4 10.4M13 12.8 10.6 10.4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconDocs({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M5 2.75h5.2L13.25 6v9.25H5V2.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10.1 2.85V6.1h3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 9.25h4M7 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconExplore({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m7.2 10.8 1.1-3.5 3.5-1.1-1.1 3.5-3.5 1.1Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconStudio({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect
        x="2.75"
        y="2.75"
        width="5"
        height="5"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="10.25"
        y="2.75"
        width="5"
        height="5"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="2.75"
        y="10.25"
        width="5"
        height="5"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="10.25"
        y="10.25"
        width="5"
        height="5"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function IconChevron({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg
      className={[
        className,
        "transition-transform duration-200",
        open ? "rotate-180" : "rotate-0",
      ]
        .filter(Boolean)
        .join(" ")}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
    >
      <path
        d="M3.5 5.25 7 8.75l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Product pillars — Docs lives in the footer as a utility link. */
const pillars: NavPillar[] = [
  {
    id: "hub",
    href: "/hub",
    label: "Hub",
    icon: <IconHub />,
    children: [
      { href: "/fund", label: "Fund" },
      { href: "/hub/editors", label: "Connect IDE" },
      { href: "/hub/frameworks", label: "Frameworks" },
      { href: "/hub/wallet", label: "Wallet help" },
      { href: "/hub/config", label: "Advanced" },
    ],
  },
  {
    id: "explore",
    href: "/services",
    label: "Explore",
    icon: <IconExplore />,
  },
  {
    id: "studio",
    href: "/studio",
    label: "Studio",
    icon: <IconStudio />,
    children: [
      { href: "/create", label: "Publish" },
      { href: "/studio/services", label: "Your tools" },
      { href: "/studio/sales", label: "Sales" },
      { href: "/studio/profile", label: "Profile" },
    ],
  },
];

function pathMatches(pathname: string, href: string): boolean {
  if (href === "/services") {
    return pathname === "/services" || pathname.startsWith("/services/");
  }
  if (href === "/studio") {
    return pathname === "/studio";
  }
  if (href === "/studio/services") {
    return (
      pathname === "/studio/services" ||
      pathname.startsWith("/studio/services/")
    );
  }
  if (href === "/docs") {
    return pathname === "/docs" || pathname.startsWith("/docs/");
  }
  if (href === "/hub") {
    // Exact only so nested hub children highlight independently
    return pathname === "/hub";
  }
  if (
    href === "/fund" ||
    href === "/hub/config" ||
    href === "/hub/wallet" ||
    href === "/hub/editors" ||
    href === "/hub/frameworks"
  ) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  if (href === "/create") {
    return pathname === "/create";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function pillarSectionActive(pathname: string, pillar: NavPillar): boolean {
  if (pathMatches(pathname, pillar.href)) return true;
  return (pillar.children ?? []).some((c) => pathMatches(pathname, c.href));
}

type AppSidebarProps = {
  onNavigate?: () => void;
};

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      for (const pillar of pillars) {
        if (pillar.children?.length && pillarSectionActive(pathname, pillar)) {
          next[pillar.id] = true;
        }
      }
      return next;
    });
  }, [pathname]);

  return (
    <div className="flex h-screen flex-col bg-surface">
      <div className="flex h-14 items-center border-b border-line px-5 md:h-16">
        <Link
          href="/"
          onClick={onNavigate}
          className="font-display text-xl tracking-tight transition-opacity hover:opacity-80"
        >
          arcdot.
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Main">
        <p className="mb-3 px-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          Main
        </p>

        <ul className="space-y-1">
          {pillars.map((pillar) => {
            const hasChildren = Boolean(pillar.children?.length);
            const sectionActive = pillarSectionActive(pathname, pillar);
            const mainExact = pathMatches(pathname, pillar.href);
            const isOpen = hasChildren && (expanded[pillar.id] ?? sectionActive);
            const parentHighlighted =
              mainExact || (sectionActive && !hasChildren) || (hasChildren && isOpen);

            return (
              <li key={pillar.id} className="space-y-0.5">
                <div
                  className={[
                    "flex items-center gap-0.5 rounded-xl transition-colors",
                    parentHighlighted && hasChildren
                      ? "bg-surface-muted"
                      : parentHighlighted && !hasChildren
                        ? "bg-foreground text-surface"
                        : "",
                  ].join(" ")}
                >
                  <Link
                    href={pillar.href}
                    onClick={onNavigate}
                    className={[
                      "flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm transition-colors",
                      parentHighlighted && !hasChildren
                        ? "font-semibold text-surface"
                        : parentHighlighted
                          ? "font-semibold text-foreground"
                          : "font-medium text-muted hover:bg-surface-muted hover:text-foreground",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex h-[18px] w-[18px] shrink-0 items-center justify-center",
                        parentHighlighted && !hasChildren
                          ? "text-surface"
                          : "text-current",
                      ].join(" ")}
                    >
                      {pillar.icon}
                    </span>
                    <span className="truncate">{pillar.label}</span>
                  </Link>

                  {hasChildren && (
                    <button
                      type="button"
                      aria-label={
                        isOpen ? `Collapse ${pillar.label}` : `Expand ${pillar.label}`
                      }
                      aria-expanded={isOpen}
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [pillar.id]: !isOpen,
                        }))
                      }
                      className="mr-1.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-background/60 hover:text-foreground"
                    >
                      <IconChevron open={Boolean(isOpen)} />
                    </button>
                  )}
                </div>

                {hasChildren && isOpen && (
                  <ul className="relative ml-[1.2rem] space-y-0.5 pb-1 pt-0.5">
                    {pillar.children!.map((child, index) => {
                      const active = pathMatches(pathname, child.href);
                      const isLast = index === pillar.children!.length - 1;
                      return (
                        <li key={child.href} className="relative pl-5">
                          <span
                            className={[
                              "pointer-events-none absolute left-0 w-px bg-line",
                              isLast ? "top-0 h-1/2" : "inset-y-0",
                            ].join(" ")}
                            aria-hidden
                          />
                          <span
                            className="pointer-events-none absolute top-1/2 left-0 h-3 w-3 -translate-y-full rounded-bl-md border-b border-l border-line"
                            aria-hidden
                          />
                          <Link
                            href={child.href}
                            onClick={onNavigate}
                            className={[
                              "block rounded-xl px-3 py-2 text-[13px] transition-colors",
                              active
                                ? "bg-surface-muted font-semibold text-foreground"
                                : "font-medium text-muted hover:bg-surface-muted/70 hover:text-foreground",
                            ].join(" ")}
                          >
                            {child.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-3 border-t border-line px-3 py-4">
        <Link
          href="/docs"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">
            <IconDocs />
          </span>
          Docs
        </Link>
        <p className="px-2.5 text-xs leading-relaxed text-muted">
          Publish tools in Studio. Connect buyers from Hub.
        </p>
      </div>
    </div>
  );
}
