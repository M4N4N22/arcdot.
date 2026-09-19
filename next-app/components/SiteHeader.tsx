"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useAccount } from "wagmi";

export function SiteHeader() {
  const { isConnected } = useAccount();

  return (
    <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-6">
      <Link href="/" className="font-display text-2xl tracking-tight shrink-0">
        arcdot.
      </Link>
      <nav className="flex flex-wrap items-center justify-end gap-4 text-sm text-muted">
        <Link href="/services" className="transition-colors hover:text-foreground">
          Browse
        </Link>
        <Link href="/create" className="transition-colors hover:text-foreground">
          Create
        </Link>
        {isConnected && (
          <Link href="/studio" className="transition-colors hover:text-foreground">
            Studio
          </Link>
        )}
        <Link href="/activity" className="transition-colors hover:text-foreground">
          Activity
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
