import type { ReactNode } from "react";
import { DocsPager } from "@/components/docs/DocsPager";

export function DocsProse({
  title,
  description,
  pathname,
  children,
}: {
  title: string;
  description?: string;
  pathname: string;
  children: ReactNode;
}) {
  return (
    <article className="animate-fade-up mx-auto w-full max-w-3xl px-6 py-10 md:px-10 md:py-14">
      <h1 className="font-display text-4xl tracking-tight md:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="mt-4 text-lg leading-relaxed text-muted">{description}</p>
      )}
      <div className="docs-prose mt-10 space-y-4 text-[15px] leading-relaxed text-foreground">
        {children}
      </div>
      <DocsPager pathname={pathname} />
    </article>
  );
}

export function DocsH2({ children }: { children: ReactNode }) {
  return (
    <h2 className="!mt-12 !mb-3 font-display text-2xl tracking-tight first:!mt-0">
      {children}
    </h2>
  );
}

export function DocsP({ children }: { children: ReactNode }) {
  return <p className="text-muted leading-relaxed">{children}</p>;
}

export function DocsUl({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-muted marker:text-foreground/40">
      {children}
    </ul>
  );
}

export function DocsOl({ children }: { children: ReactNode }) {
  return (
    <ol className="list-decimal space-y-2 pl-5 text-muted marker:text-foreground/50">
      {children}
    </ol>
  );
}

export function DocsLead({ children }: { children: ReactNode }) {
  return <p className="text-base leading-relaxed text-foreground">{children}</p>;
}
