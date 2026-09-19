"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavChild = {
  href: string;
  label: string;
};

type NavPillar = {
  href: string;
  label: string;
  children?: NavChild[];
};

/** Three product pillars — Hub / Studio / Explore. Console & Activity stay off-nav. */
const pillars: NavPillar[] = [
  {
    href: "/hub",
    label: "MCP Hub",
    children: [{ href: "/docs", label: "Docs" }],
  },
  {
    href: "/studio",
    label: "Studio",
    children: [
      { href: "/create", label: "Publish" },
      { href: "/studio/services", label: "Your tools" },
      { href: "/studio/sales", label: "Sales" },
      { href: "/studio/profile", label: "Profile" },
    ],
  },
  {
    href: "/services",
    label: "Explore",
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
    return pathname === "/hub" || pathname.startsWith("/hub/");
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

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b border-line px-5 md:h-16">
        <Link
          href="/"
          onClick={onNavigate}
          className="font-display text-xl tracking-tight transition-opacity hover:opacity-80"
        >
          arcdot.
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main">
        <ul className="space-y-4">
          {pillars.map((pillar) => {
            const sectionActive = pillarSectionActive(pathname, pillar);
            const mainExact = pathMatches(pathname, pillar.href);
            const showChildren = Boolean(pillar.children?.length);

            return (
              <li key={pillar.href}>
                <Link
                  href={pillar.href}
                  onClick={onNavigate}
                  className={[
                    "block rounded-xl px-3 py-2 text-sm transition-colors",
                    mainExact || (sectionActive && !showChildren)
                      ? "bg-foreground text-surface font-medium"
                      : sectionActive
                        ? "font-medium text-foreground"
                        : "text-muted hover:bg-surface-muted hover:text-foreground",
                  ].join(" ")}
                >
                  {pillar.label}
                </Link>
                {showChildren && (
                  <ul className="mt-1 space-y-0.5 pl-2">
                    {pillar.children!.map((child) => {
                      const active = pathMatches(pathname, child.href);
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={onNavigate}
                            className={[
                              "block rounded-lg px-3 py-1.5 text-[13px] transition-colors",
                              active
                                ? "bg-surface-muted font-medium text-foreground"
                                : "text-muted hover:bg-surface-muted/80 hover:text-foreground",
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

      <div className="border-t border-line px-5 py-4">
        <p className="text-xs leading-relaxed text-muted">
          Publish tools in Studio. Connect buyers from MCP Hub.
        </p>
      </div>
    </div>
  );
}
