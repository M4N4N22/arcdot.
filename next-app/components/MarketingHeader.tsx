"use client";

import Image from "next/image";
import Link from "next/link";
import { WalletConnect } from "@/components/wallet/WalletConnect";

export function MarketingHeader() {
  return (
    <header className="fixed animate-shell-in right-0 left-0 top-2 backdrop-blur-xl shadow-xl rounded-full z-20 mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 py-5 md:py-6">
      <div className="flex min-w-0 flex-wrap items-center gap-3 md:gap-4">
        <Link
          href="/"
          className="font-display text-2xl tracking-tight transition-opacity hover:opacity-80"
        >
          arcdot.
        </Link>
      </div>

      <nav className="flex flex-wrap items-center justify-end gap-2 text-sm text-muted sm:gap-3">
        <Link
          href="/services"
          className="rounded-full px-3 py-1.5 transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          Explore
        </Link>
        <Link
          href="/hub"
          className="rounded-full px-3 py-1.5 transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          Hub
        </Link>
        <Link
          href="/docs"
          className="rounded-full px-3 py-1.5 transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          Docs
        </Link>
        <WalletConnect compact />
      </nav>
    </header>
  );
}
