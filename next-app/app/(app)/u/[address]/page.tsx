import Link from "next/link";
import { notFound } from "next/navigation";
import { UsdcOnArcPrice } from "@/components/brand/UsdcOnArcMark";
import {
  getProfile,
  listServicesForOwner,
} from "@/lib/catalog/store";

export const dynamic = "force-dynamic";

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export default async function PublicSellerPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) notFound();

  const [profile, services] = await Promise.all([
    getProfile(address),
    listServicesForOwner(address),
  ]);

  const published = services.filter(
    (s) => s.status === "published" && !s.paused,
  );
  const name = profile?.display_name || shortAddr(address);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-6 md:px-8">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">
        Seller
      </p>
      <h1 className="mt-2 font-display text-3xl tracking-tight md:text-4xl">
        {name}
      </h1>
      <p className="mt-2 font-mono text-xs text-muted">{address.toLowerCase()}</p>
      {profile?.bio && (
        <p className="mt-4 max-w-xl text-muted">{profile.bio}</p>
      )}

      <h2 className="mt-12 text-sm font-medium uppercase tracking-wider text-muted">
        Services
      </h2>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {published.length === 0 && (
          <li className="py-8 text-muted">No published services yet.</li>
        )}
        {published.map((s) => (
          <li key={s.id}>
            <Link
              href={`/services/${s.slug}`}
              className="group flex flex-col gap-1 py-6 sm:flex-row sm:items-baseline sm:justify-between"
            >
              <div>
                <p className="font-medium group-hover:underline group-hover:underline-offset-4">
                  {s.title}
                </p>
                <p className="mt-1 text-sm text-muted">{s.description}</p>
              </div>
              <p className="shrink-0 font-mono text-sm">
                <UsdcOnArcPrice amount={s.price_usdc} />
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
