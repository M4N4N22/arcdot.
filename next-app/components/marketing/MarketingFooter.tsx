import Image from "next/image";
import Link from "next/link";
import { UsdcOnArcMark } from "@/components/brand/UsdcOnArcMark";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/hub", label: "MCP Hub" },
      { href: "/studio", label: "Studio" },
      { href: "/services", label: "Explore" },
      { href: "/create", label: "Publish a tool" },
    ],
  },
  {
    title: "Developers",
    links: [
      { href: "/docs", label: "Documentation" },
      { href: "/docs/quickstart", label: "Quickstart" },
      { href: "/docs/mcp", label: "MCP reference" },
      { href: "/console", label: "Console" },
    ],
  },
  {
    title: "Network",
    links: [
      {
        href: "https://www.arc.network/",
        label: "Arc Network",
        external: true,
      },
      {
        href: "https://explorer.arc.io/",
        label: "Arc Explorer",
        external: true,
      },
      {
        href: "https://www.circle.com/",
        label: "Circle",
        external: true,
      },
      {
        href: "https://www.circle.com/pressroom",
        label: "Brand kit",
        external: true,
      },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-line/80 bg-surface">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))] md:gap-8">
          <div>
            <Link
              href="/"
              className="font-display text-2xl tracking-tight text-foreground"
            >
              arcdot.
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              Software pays software. Instant USDC unlocks on Circle’s Arc.
            </p>
            <a
              href="https://www.arc.network/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-3 rounded-xl border border-line bg-background/80 px-4 py-3 transition-colors hover:bg-surface-muted"
            >
              <Image
                src="/brand/arc-network.png"
                alt="Arc Network"
                width={36}
                height={36}
                className="h-9 w-9 rounded-full"
              />
              <Image
                src="/brand/arc-logo-black.png"
                alt="Arc"
                width={88}
                height={28}
                className="h-6 w-auto"
              />
            </a>
            <p className="mt-2 text-xs text-muted">
              Built on Arc. Arc is a trademark of Circle.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-xs text-muted">
          <span>© {new Date().getFullYear()} arcdot.</span>
          <span className="inline-flex items-center gap-2">
            <UsdcOnArcMark size="sm" showLabel={false} />
            Settled in USDC on Arc
          </span>
        </div>
      </div>
    </footer>
  );
}
