import Link from "next/link";
import { docsPager } from "@/lib/docs/nav";

export function DocsPager({ pathname }: { pathname: string }) {
  const { prev, next } = docsPager(pathname);

  return (
    <nav className="mt-16 flex flex-wrap items-stretch justify-between gap-4 border-t border-line pt-8">
      {prev ? (
        <Link
          href={prev.href}
          className="group min-w-[10rem] flex-1 border border-line bg-surface/60 px-4 py-3 transition-colors hover:bg-surface"
        >
          <p className="text-[11px] uppercase tracking-wider text-muted">
            Previous
          </p>
          <p className="mt-1 text-sm font-medium group-hover:underline group-hover:underline-offset-4">
            {prev.label}
          </p>
        </Link>
      ) : (
        <span className="flex-1" />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group min-w-[10rem] flex-1 border border-line bg-surface/60 px-4 py-3 text-right transition-colors hover:bg-surface"
        >
          <p className="text-[11px] uppercase tracking-wider text-muted">Next</p>
          <p className="mt-1 text-sm font-medium group-hover:underline group-hover:underline-offset-4">
            {next.label}
          </p>
        </Link>
      ) : (
        <span className="flex-1" />
      )}
    </nav>
  );
}
