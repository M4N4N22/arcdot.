"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { usePathname } from "next/navigation";

function titleForPath(pathname: string): string {
  if (pathname.startsWith("/fund")) return "Fund";
  if (pathname.startsWith("/hub/frameworks")) return "Frameworks";
  if (pathname.startsWith("/hub/editors")) return "Connect IDE";
  if (pathname.startsWith("/hub/wallet")) return "Wallet help";
  if (pathname.startsWith("/hub/config")) return "Advanced";
  if (pathname.startsWith("/hub")) return "Get started";
  if (pathname.startsWith("/console")) return "Console";
  if (pathname.startsWith("/docs")) return "Documentation";
  if (pathname.startsWith("/create")) return "Publish";
  if (pathname.startsWith("/studio/profile")) return "Profile";
  if (pathname.startsWith("/studio/sales")) return "Sales";
  if (pathname.startsWith("/studio/services/") && pathname.includes("/edit")) {
    return "Edit tool";
  }
  if (pathname.startsWith("/studio/services")) return "Your tools";
  if (pathname.startsWith("/studio")) return "Studio";
  if (pathname.startsWith("/u/")) return "Seller";
  if (pathname.startsWith("/activity")) return "Activity";
  if (pathname.startsWith("/services/") && pathname !== "/services") {
    return "Tool";
  }
  if (pathname.startsWith("/services")) return "Explore";
  return "arcdot.";
}

type AppHeaderProps = {
  onMenuClick?: () => void;
};

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const pathname = usePathname();
  const title = titleForPath(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-line bg-surface/90 px-4 backdrop-blur-sm md:h-16 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-foreground md:hidden"
          aria-label="Open navigation"
        >
          <span className="sr-only">Menu</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden
          >
            <path
              d="M2.5 4.5h13M2.5 9h13M2.5 13.5h13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <p className="truncate rounded-full bg-surface-muted px-3 py-1 text-sm font-medium tracking-tight text-foreground md:text-base">
          {title}
        </p>
      </div>
      <ConnectButton
        accountStatus="address"
        chainStatus="icon"
        showBalance={false}
      />
    </header>
  );
}
