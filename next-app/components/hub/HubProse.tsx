import type { ReactNode } from "react";
import Link from "next/link";

/** Section heading — matches docs DocsH2 rhythm. */
export function HubH2({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}) {
  return (
    <h2
      id={id}
      className="!mt-12 !mb-3 scroll-mt-24 font-display text-xl tracking-tight text-foreground first:!mt-0 md:text-2xl"
    >
      {children}
    </h2>
  );
}

export function HubP({ children }: { children: ReactNode }) {
  return (
    <p className="text-[15px] leading-relaxed text-muted [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-surface-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-foreground">
      {children}
    </p>
  );
}

/** Tip box — same shape as docs DocsCallout. */
export function HubCallout({
  title = "Tip",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className="my-6 rounded-xl border border-line bg-surface-muted px-4 py-3.5">
      <div className="flex gap-3">
        <span
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-foreground"
          aria-hidden
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 1.5v9M1.5 6h9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <div className="min-w-0 space-y-2">
          <p className="text-[13px] font-semibold text-foreground">{title}</p>
          <div className="text-[13px] leading-relaxed text-muted [&_code]:rounded [&_code]:bg-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-foreground [&_a]:underline [&_a]:underline-offset-4">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}

export type HubContinueLink = {
  href: string;
  title: string;
  description: string;
};

/** Docs-style “Next” link list for Hub pages. */
export function HubContinue({ links }: { links: readonly HubContinueLink[] }) {
  return (
    <footer className="mt-14 border-t border-line pt-8">
      <p className="text-sm text-muted">Continue</p>
      <ul className="mt-3 divide-y divide-line border-y border-line">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group flex items-baseline justify-between gap-4 py-4"
            >
              <div>
                <p className="font-medium group-hover:underline group-hover:underline-offset-4">
                  {link.title}
                </p>
                <p className="mt-1 text-sm text-muted">{link.description}</p>
              </div>
              <span className="text-sm text-muted">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </footer>
  );
}
