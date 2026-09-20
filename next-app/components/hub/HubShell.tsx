"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { HUB_NAV } from "@/lib/hub/nav";

type HubShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  /** Show ← MCP Hub when on a nested hub page */
  showBack?: boolean;
};

export function HubShell({
  title,
  description,
  children,
  showBack = false,
}: HubShellProps) {
  const pathname = usePathname();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-6 md:px-8">
      {showBack && (
        <Link
          href="/hub"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← MCP Hub
        </Link>
      )}

      <div className={["animate-fade-up max-w-xl", showBack ? "mt-4" : ""].join(" ")}>
        <h1 className="font-display text-3xl tracking-tight md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-muted">{description}</p>
      </div>

      {/* Section strip — same destinations as sidebar children */}
      <nav
        className="mt-8 flex flex-wrap gap-2"
        aria-label="Hub sections"
      >
        {HUB_NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "inline-flex h-10 items-center px-4 text-sm transition-colors",
                active
                  ? "bg-accent font-medium text-surface"
                  : "border border-line bg-surface text-foreground hover:bg-surface-muted",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10">{children}</div>
    </main>
  );
}
