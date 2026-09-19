"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { AppSidebar } from "@/components/AppSidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <div className="flex h-svh max-h-svh flex-1 gap-3 overflow-hidden p-3 md:p-4">
      {/* Desktop nav rail — fixed height, own scroll if needed */}
      <aside className="animate-shell-in relative z-20 hidden h-full w-56 shrink-0 overflow-hidden rounded-3xl border border-line bg-surface shadow-sm md:block lg:w-60">
        <div className="h-full overflow-y-auto">
          <AppSidebar />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/25"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="animate-drawer-in absolute inset-y-3 left-3 flex w-[min(18rem,88vw)] flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-lg">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <AppSidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* Main column — header fixed, only children scroll */}
      <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-line bg-surface/80 shadow-sm backdrop-blur-sm">
        <div className="shrink-0">
          <AppHeader onMenuClick={() => setMobileOpen(true)} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background/40">
          {children}
        </div>
      </div>
    </div>
  );
}
