"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { docsNav } from "@/lib/docs/nav";

function isActive(pathname: string, href: string) {
  if (href === "/docs") return pathname === "/docs";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="px-4 py-6">
      {docsNav.map((group) => (
        <div key={group.label} className="mb-7 last:mb-0">
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
                      "block px-2 py-1.5 text-sm transition-colors",
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
  );
}

export function DocsLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 0% 0%, var(--glow), transparent 50%), linear-gradient(180deg, #ebe7df 0%, var(--background) 32%)",
        }}
      />

      <header className="relative z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-line bg-surface/70 px-4 backdrop-blur-sm md:h-16 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center border border-line bg-surface md:hidden"
            aria-label="Open docs navigation"
            onClick={() => setOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path
                d="M2.5 4.5h13M2.5 9h13M2.5 13.5h13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
              />
            </svg>
          </button>
          <Link href="/" className="font-display text-xl tracking-tight shrink-0">
            arcdot.
          </Link>
          <span className="hidden text-muted sm:inline">/</span>
          <Link
            href="/docs"
            className="hidden text-sm text-muted transition-colors hover:text-foreground sm:inline"
          >
            Docs
          </Link>
        </div>
        <nav className="flex flex-wrap items-center justify-end gap-4 text-sm text-muted">
          <Link href="/console" className="transition-colors hover:text-foreground">
            Console
          </Link>
          <Link href="/studio" className="transition-colors hover:text-foreground">
            Studio
          </Link>
        </nav>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1">
        <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-56 shrink-0 overflow-y-auto border-r border-line bg-surface/50 md:top-16 md:block md:h-[calc(100svh-4rem)] lg:w-60">
          <DocsSidebar />
        </aside>

        {open && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-foreground/25"
              aria-label="Close docs navigation"
              onClick={() => setOpen(false)}
            />
            <aside className="animate-drawer-in absolute inset-y-0 left-0 w-[min(18rem,88vw)] border-r border-line bg-surface">
              <div className="flex h-14 items-center border-b border-line px-4">
                <p className="font-display text-lg">Docs</p>
              </div>
              <DocsSidebar onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        )}

        <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
