import Link from "next/link";
import { listPublishedServices } from "@/lib/catalog/store";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await listPublishedServices();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-4">
      <div className="animate-fade-up max-w-xl">
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">
          Services
        </h1>
        <p className="mt-3 text-muted">
          Pick a gated endpoint, pay a few cents in USDC, and get an instant
          reply.
        </p>
      </div>

      <ul className="mt-12 divide-y divide-line border-y border-line">
        {services.length === 0 && (
          <li className="py-10 text-muted">
            No published services yet.{" "}
            <Link href="/create" className="underline underline-offset-4">
              Create the first one
            </Link>
            .
          </li>
        )}
        {services.map((s) => (
          <li key={s.id}>
            <Link
              href={`/services/${s.slug}`}
              className="group flex flex-col gap-2 py-8 transition-colors sm:flex-row sm:items-baseline sm:justify-between"
            >
              <div>
                <p className="text-lg font-medium group-hover:underline group-hover:underline-offset-4">
                  {s.title}
                </p>
                <p className="mt-1 max-w-lg text-muted">{s.description}</p>
              </div>
              <p className="shrink-0 font-mono text-sm text-foreground">
                {s.price_usdc} USDC
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
