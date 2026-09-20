"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { DocsToc } from "@/components/docs/DocsToc";
import { docsNav } from "@/lib/docs/nav";
import { AGENT_GITHUB_URL } from "@/lib/agent/install";

function isActive(pathname: string, href: string) {
  return pathname === href;
}

function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="px-3 py-6 h-screen" aria-label="Documentation">
      {docsNav.map((group) => (
        <div key={group.label} className="mb-6 last:mb-0">
          <p className="mb-2 px-2.5 text-[10px] font-semibold uppercase  text-muted/70">
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
                      "block rounded-lg px-2.5 py-1.5 text-[13px] transition-colors",
                      active
                        ? "bg-foreground font-medium text-surface"
                        : "text-muted hover:bg-surface-muted hover:text-foreground",
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

export function DocsLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="docs-shell  relative flex h-svh max-h-svh flex-1 flex-col overflow-hidden bg-background text-foreground">
      <header className="relative z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-line bg-surface/90 px-4 backdrop-blur-md md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-foreground md:hidden"
            aria-label="Open docs navigation"
            onClick={() => setOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path
                d="M2.5 4.5h13M2.5 9h13M2.5 13.5h13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <Link
            href="/"
            className="shrink-0 font-display text-lg tracking-tight text-foreground"
          >
            arcdot.
          </Link>
          <span className="hidden text-muted sm:inline">|</span>
          <Link
            href="/docs"
            className="hidden text-sm font-medium text-foreground sm:inline"
          >
            Docs
          </Link>
        </div>

        <nav className="hidden items-center gap-1 text-[13px] text-muted lg:flex">
          {[
            { href: "/docs/quickstart", label: "Get started" },
            { href: "/docs/agents", label: "Agents" },
            { href: "/docs/agents/client", label: "Agent client" },
            { href: "/docs/sellers", label: "Sellers" },
            { href: "/docs/api/gateway", label: "API" },
            { href: "/hub", label: "MCP Hub" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={[
                "rounded-md px-2.5 py-1.5 transition-colors hover:text-foreground",
                pathname === l.href || pathname.startsWith(`${l.href}/`)
                  ? "font-medium text-foreground"
                  : "",
              ].join(" ")}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          <a
            href={AGENT_GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden text-muted transition-colors hover:text-foreground sm:inline"
          >
            GitHub
          </a>
          <Link
            href="/docs/cli"
            className="hidden text-muted transition-colors hover:text-foreground md:inline"
          >
            CLI
          </Link>
          <Link
            href="/studio"
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-surface-muted"
          >
            Studio
          </Link>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden h-full w-[15.5rem] shrink-0 overflow-y-auto border-r border-line bg-surface md:block">
          <DocsSidebar />
        </aside>

        {open && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Close docs navigation"
              onClick={() => setOpen(false)}
            />
            <aside className="animate-drawer-in absolute inset-y-0 left-0 w-[min(18rem,88vw)] border-r border-line bg-surface">
              <div className="flex h-14 items-center border-b border-line px-4">
                <p className="font-display text-lg text-foreground">Docs</p>
              </div>
              <DocsSidebar onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        )}

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-6xl gap-8 px-4 md:px-8 lg:gap-12">
            <div className="min-w-0 flex-1 py-2">{children}</div>
            <aside className="sticky top-0 hidden h-fit w-48 shrink-0 py-10 xl:block">
              <DocsToc containerId="docs-article" />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
