"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navGroups = [
  {
    label: "Develop",
    items: [
      { href: "/console", label: "Console" },
      { href: "/docs", label: "Docs" },
    ],
  },
  {
    label: "Agents",
    items: [{ href: "/services", label: "Try in browser" }],
  },
  {
    label: "Workspace",
    items: [{ href: "/activity", label: "Activity" }],
  },
  {
    label: "Seller",
    items: [
      { href: "/studio", label: "Studio" },
      { href: "/studio/profile", label: "Profile" },
      { href: "/create", label: "Create" },
    ],
  },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/services") {
    return pathname === "/services" || pathname.startsWith("/services/");
  }
  if (href === "/studio") {
    return pathname === "/studio" || pathname.startsWith("/studio/");
  }
  if (href === "/docs") {
    return pathname === "/docs" || pathname.startsWith("/docs/");
  }
  if (href === "/console") {
    return pathname === "/console";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
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

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-6 last:mb-0">
            <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={[
                        "block px-2 py-2 text-sm transition-colors",
                        active
                          ? "bg-foreground/[0.06] font-medium text-foreground"
                          : "text-muted hover:bg-foreground/[0.04] hover:text-foreground",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-5 py-4">
        <p className="text-xs leading-relaxed text-muted">
          Agents pay over HTTP. Console is the live demo surface.
        </p>
      </div>
    </div>
  );
}
