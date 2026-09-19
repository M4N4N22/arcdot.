import Link from "next/link";
import {
  getProfilesByAddresses,
  listPublishedServices,
} from "@/lib/catalog/store";

export const dynamic = "force-dynamic";

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export default async function ServicesPage() {
  const services = await listPublishedServices();
  const profiles = await getProfilesByAddresses(
    services.map((s) => s.owner_address),
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-6 md:px-8">
      <div className="animate-fade-up max-w-xl">
        <h1 className="font-display text-3xl tracking-tight md:text-4xl">
          Try in browser
        </h1>
        <p className="mt-2 text-muted">
          Same path agents use — pick a service, pay a few cents in USDC, get a
          reply. For autonomous clients, start at{" "}
          <span className="font-mono text-sm text-foreground">/api/services</span>
          .
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
        {services.map((s) => {
          const profile = profiles.get(s.owner_address.toLowerCase());
          const sellerLabel =
            profile?.display_name || shortAddr(s.owner_address);
          return (
            <li key={s.id} className="py-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <Link
                    href={`/services/${s.slug}`}
                    className="text-lg font-medium underline-offset-4 hover:underline"
                  >
                    {s.title}
                  </Link>
                  <p className="mt-1 max-w-lg text-muted">{s.description}</p>
                  <p className="mt-2 text-xs text-muted">
                    <span className="font-mono">{s.slug}</span>
                    {" · "}
                    <Link
                      href={`/u/${s.owner_address}`}
                      className="text-foreground underline-offset-2 hover:underline"
                    >
                      {sellerLabel}
                    </Link>
                  </p>
                </div>
                <p className="shrink-0 font-mono text-sm text-foreground">
                  {s.price_usdc} USDC
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
