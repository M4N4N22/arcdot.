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
    <div className="relative flex min-h-full flex-1 gap-3 p-3 md:p-4">
      {/* Desktop nav rail */}
      <aside className="animate-shell-in relative z-20 hidden w-56 shrink-0 overflow-hidden rounded-3xl border border-line bg-surface shadow-sm md:block lg:w-60">
        <div className="h-[calc(100svh-2rem)]">
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
          <aside className="animate-drawer-in absolute inset-y-3 left-3 w-[min(18rem,88vw)] overflow-hidden rounded-3xl border border-line bg-surface shadow-lg">
            <AppSidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-line bg-surface/80 shadow-sm backdrop-blur-sm">
        <AppHeader onMenuClick={() => setMobileOpen(true)} />
        <div className="flex-1 overflow-y-auto bg-background/40">{children}</div>
      </div>
    </div>
  );
}
