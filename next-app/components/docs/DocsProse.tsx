import type { ReactNode } from "react";
import { DocsPager } from "@/components/docs/DocsPager";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function DocsProse({
  title,
  description,
  pathname,
  eyebrow,
  children,
}: {
  title: string;
  description?: string;
  pathname: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <article
      id="docs-article"
      className="animate-fade-up w-full max-w-3xl py-10 md:py-12"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          {eyebrow && (
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-3xl tracking-tight text-foreground md:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 text-base leading-relaxed text-muted md:text-[17px]">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="docs-prose space-y-4 text-[15px] leading-relaxed text-foreground">
        {children}
      </div>
      <div className="mt-12 border-t border-line pt-6">
        <DocsPager pathname={pathname} />
      </div>
    </article>
  );
}

export function DocsH2({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}) {
  const text = typeof children === "string" ? children : undefined;
  const headingId = id ?? (text ? slugify(text) : undefined);
  return (
    <h2
      id={headingId}
      className="!mt-12 !mb-3 scroll-mt-24 font-display text-xl tracking-tight text-foreground first:!mt-0 md:text-2xl"
    >
      {children}
    </h2>
  );
}

export function DocsH3({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}) {
  const text = typeof children === "string" ? children : undefined;
  const headingId = id ?? (text ? slugify(text) : undefined);
  return (
    <h3
      id={headingId}
      className="!mt-8 !mb-2 scroll-mt-24 text-base font-semibold tracking-tight text-foreground"
    >
      {children}
    </h3>
  );
}

export function DocsP({ children }: { children: ReactNode }) {
  return (
    <p className="leading-relaxed text-muted [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-surface-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-foreground">
      {children}
    </p>
  );
}

export function DocsUl({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-muted marker:text-foreground/40 [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-surface-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-foreground">
      {children}
    </ul>
  );
}

export function DocsOl({ children }: { children: ReactNode }) {
  return (
    <ol className="list-decimal space-y-2 pl-5 text-muted marker:text-foreground/50 [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-surface-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-foreground">
      {children}
    </ol>
  );
}

export function DocsLead({ children }: { children: ReactNode }) {
  return (
    <p className="text-base leading-relaxed text-foreground">{children}</p>
  );
}

/** Tip / callout — layout only; brand colors */
export function DocsCallout({
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
