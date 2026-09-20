"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { HUB_NAV } from "@/lib/hub/nav";

type HubShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  /** Show ← Get started when on a nested hub page */
  showBack?: boolean;
  eyebrow?: string;
  /** Wider content for side-by-side tools (e.g. IDE mock + config). */
  wide?: boolean;
};

export function HubShell({
  title,
  description,
  children,
  showBack = false,
  eyebrow = "Buyer setup",
  wide = false,
}: HubShellProps) {
  const pathname = usePathname();

  return (
    <main
      className={[
        "mx-auto w-full px-6 pb-16 pt-6 md:px-8 md:pt-8",
        wide ? "max-w-5xl" : "max-w-3xl",
      ].join(" ")}
    >
      {showBack && (
        <Link
          href="/hub"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Get started
        </Link>
      )}

      <article
        className={["animate-fade-up", showBack ? "mt-4" : ""].join(" ")}
      >
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          {eyebrow}
        </p>
        <h1 className="font-display text-3xl tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted md:text-[17px]">
          {description}
        </p>
      </article>

      <nav
        className="mt-8 flex flex-wrap gap-x-1 gap-y-1 border-b border-line"
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
                "-mb-px inline-flex h-9 items-center border-b-2 px-3 text-sm transition-colors",
                active
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted hover:text-foreground",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-foreground">
        {children}
      </div>
    </main>
  );
}
