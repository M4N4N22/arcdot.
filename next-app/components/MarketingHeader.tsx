"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export function MarketingHeader() {
  return (
    <header className="animate-shell-in relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-5 md:py-6">
      <Link
        href="/"
        className="font-display text-2xl tracking-tight transition-opacity hover:opacity-80"
      >
        arcdot.
      </Link>
      <nav className="flex flex-wrap items-center justify-end gap-4 text-sm text-muted sm:gap-5">
        <Link
          href="/hub"
          className="transition-colors hover:text-foreground"
        >
          MCP Hub
        </Link>
        <Link
          href="/console"
          className="transition-colors hover:text-foreground"
        >
          Console
        </Link>
        <Link
          href="/docs"
          className="transition-colors hover:text-foreground"
        >
          Docs
        </Link>
        <Link
          href="/studio"
          className="transition-colors hover:text-foreground"
        >
          Sell
        </Link>
        <ConnectButton
          accountStatus="address"
          chainStatus="icon"
          showBalance={false}
        />
      </nav>
    </header>
  );
}
