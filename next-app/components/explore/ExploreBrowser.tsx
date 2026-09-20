"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { ToolCard } from "@/components/explore/ToolCard";
import type { ExploreToolItem } from "@/components/explore/types";
import { FEATURED_TOOL_SLUGS } from "@/lib/explore/toolMeta";

export type { ExploreToolItem } from "@/components/explore/types";

type SortKey = "featured" | "price-asc" | "price-desc" | "name" | "newest";
type PriceFilter = "all" | "starter" | "paid";
type ViewMode = "grid" | "list";
type QuickChip = "all" | "featured" | "newest" | string;

const PAGE_SIZE = 24;

type ExploreBrowserProps = {
  tools: ExploreToolItem[];
};

export function ExploreBrowser({ tools }: ExploreBrowserProps) {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [sort, setSort] = useState<SortKey>("featured");
  const [view, setView] = useState<ViewMode>("grid");
  const [chip, setChip] = useState<QuickChip>("all");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("explore-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tools) {
      map.set(t.category, (map.get(t.category) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [tools]);

  const priceCounts = useMemo(() => {
    let starter = 0;
    let paid = 0;
    for (const t of tools) {
      if (t.priceNum <= 0.01) starter += 1;
      else paid += 1;
    }
    return { starter, paid };
  }, [tools]);

  function toggleCategory(c: string) {
    setCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }

  function clearFilters() {
    setQuery("");
    setCategories([]);
    setPriceFilter("all");
    setChip("all");
    setSort("featured");
    setPage(1);
  }

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const featuredSet = new Set(FEATURED_TOOL_SLUGS);

    let list = tools.filter((t) => {
      if (categories.length > 0 && !categories.includes(t.category)) return false;
      if (priceFilter === "starter" && t.priceNum > 0.01) return false;
      if (priceFilter === "paid" && t.priceNum <= 0.01) return false;
      if (chip === "featured" && !featuredSet.has(t.slug)) return false;
      if (chip !== "all" && chip !== "featured" && chip !== "newest") {
        if (t.category !== chip) return false;
      }
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.ownerLabel.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });

    const sortKey = chip === "newest" ? "newest" : sort;
    list = [...list].sort((a, b) => {
      switch (sortKey) {
        case "price-asc":
          return a.priceNum - b.priceNum || a.title.localeCompare(b.title);
        case "price-desc":
          return b.priceNum - a.priceNum || a.title.localeCompare(b.title);
        case "name":
          return a.title.localeCompare(b.title);
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "featured":
        default: {
          const af = featuredSet.has(a.slug) ? 0 : 1;
          const bf = featuredSet.has(b.slug) ? 0 : 1;
          if (af !== bf) return af - bf;
          if (af === 0) {
            return (
              FEATURED_TOOL_SLUGS.indexOf(a.slug) -
              FEATURED_TOOL_SLUGS.indexOf(b.slug)
            );
          }
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
      }
    });

    return list;
  }, [tools, deferredQuery, categories, priceFilter, sort, chip]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [deferredQuery, categories, priceFilter, sort, chip]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function goToPage(next: number) {
    const clamped = Math.min(Math.max(1, next), totalPages);
    setPage(clamped);
    document
      .getElementById("explore-results")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set<number>([1, totalPages, currentPage]);
    for (const n of [currentPage - 1, currentPage + 1]) {
      if (n >= 1 && n <= totalPages) pages.add(n);
    }
    return Array.from(pages).sort((a, b) => a - b);
  }, [totalPages, currentPage]);

  const quickChips: { id: QuickChip; label: string }[] = [
    { id: "all", label: "All tools" },
    { id: "featured", label: "Featured" },
    { id: "newest", label: "New" },
    ...categoryCounts.map(([c]) => ({ id: c as QuickChip, label: c })),
  ];

  if (tools.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-line bg-surface px-6 py-12 text-center shadow-sm">
        <p className="text-muted">No published tools yet.</p>
        <Link
          href="/create"
          className="mt-4 inline-flex h-10 items-center rounded-full bg-accent px-5 text-sm font-medium text-surface"
        >
          Publish the first one
        </Link>
      </div>
    );
  }

  const filterPanel = (
    <div className="flex h-fit flex-col">
      <div className="flex items-center justify-between px-1 pb-4">
        <p className="text-sm font-semibold tracking-tight">Filters</p>
        <button
          type="button"
          onClick={clearFilters}
          className="text-xs text-muted underline-offset-2 hover:text-foreground hover:underline"
        >
          Clear
        </button>
      </div>

      <div className="space-y-6 pb-4">
        <section>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
            Category
          </p>
          <ul className="space-y-1.5">
            {categoryCounts.map(([c, count]) => {
              const checked = categories.includes(c);
              return (
                <li key={c}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-sm hover:bg-surface-muted">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(c)}
                      className="size-3.5 rounded border-line accent-foreground"
                    />
                    <span className="flex-1 truncate">{c}</span>
                    <span className="font-mono text-[11px] text-muted">
                      {count}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
            Pricing
          </p>
          <ul className="space-y-1.5">
            {(
              [
                { id: "all" as const, label: "Any", count: tools.length },
                {
                  id: "starter" as const,
                  label: "Up to 0.01",
                  count: priceCounts.starter,
                },
                {
                  id: "paid" as const,
                  label: "Above 0.01",
                  count: priceCounts.paid,
                },
              ] as const
            ).map((row) => (
              <li key={row.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-sm hover:bg-surface-muted">
                  <input
                    type="radio"
                    name="price-filter"
                    checked={priceFilter === row.id}
                    onChange={() => setPriceFilter(row.id)}
                    className="size-3.5 accent-foreground"
                  />
                  <span className="flex-1">{row.label}</span>
                  <span className="font-mono text-[11px] text-muted">
                    {row.count}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <button
        type="button"
        onClick={clearFilters}
        className="inline-flex h-10 w-full items-center justify-center rounded-full border border-line bg-surface text-sm font-medium transition-colors hover:bg-surface-muted"
      >
        Clear all filters
      </button>
    </div>
  );

  const rangeLabel =
    filtered.length === 0
      ? null
      : `${(pageStart + 1).toLocaleString()}–${Math.min(pageStart + PAGE_SIZE, filtered.length).toLocaleString()}`;

  return (
    <div className="mt-6 grid items-start gap-5 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-6">
      <aside className="hidden h-fit rounded-3xl border border-line bg-surface p-5 shadow-sm lg:block">
        {filterPanel}
      </aside>

      <div className="min-w-0">
        <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-5">
          <label className="relative block">
            <span className="sr-only">Search tools</span>
            <input
              id="explore-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${tools.length} tools, use cases, owners…`}
              className="h-12 w-full rounded-2xl border border-line bg-surface-muted pl-4 pr-20 text-sm outline-none placeholder:text-muted focus:border-foreground/40 focus:bg-surface"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted">
              ⌘K
            </span>
          </label>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {quickChips.map((c) => {
              const active = chip === c.id;
              return (
                <button
                  key={String(c.id)}
                  type="button"
                  onClick={() => setChip(c.id)}
                  className={[
                    "h-8 rounded-full px-3 text-xs font-medium transition-colors",
                    active
                      ? "bg-foreground text-surface"
                      : "bg-surface-muted text-muted hover:text-foreground",
                  ].join(" ")}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <div
            id="explore-results"
            className="mt-4 flex flex-wrap items-center justify-between gap-3 scroll-mt-4"
          >
            <p className="text-sm font-medium tracking-tight">
              {filtered.length.toLocaleString()}{" "}
              <span className="font-normal text-muted">
                tool{filtered.length === 1 ? "" : "s"}
              </span>
              {rangeLabel && totalPages > 1 && (
                <span className="font-normal text-muted">
                  {" "}
                  · showing {rangeLabel}
                </span>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex h-9 items-center rounded-full border border-line px-3 text-xs lg:hidden"
                onClick={() => setFiltersOpen(true)}
              >
                Filters
              </button>
              <label className="flex items-center gap-2 text-xs text-muted">
                <span>Sort</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="h-9 rounded-full border border-line bg-surface px-3 text-sm text-foreground outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="name">Name A–Z</option>
                  <option value="price-asc">Price ↑</option>
                  <option value="price-desc">Price ↓</option>
                </select>
              </label>
              <div className="flex overflow-hidden rounded-full border border-line">
                <button
                  type="button"
                  aria-label="Grid view"
                  aria-pressed={view === "grid"}
                  onClick={() => setView("grid")}
                  className={[
                    "inline-flex h-9 w-9 items-center justify-center text-xs",
                    view === "grid"
                      ? "bg-foreground text-surface"
                      : "bg-surface text-muted",
                  ].join(" ")}
                >
                  ▦
                </button>
                <button
                  type="button"
                  aria-label="List view"
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                  className={[
                    "inline-flex h-9 w-9 items-center justify-center text-xs",
                    view === "list"
                      ? "bg-foreground text-surface"
                      : "bg-surface text-muted",
                  ].join(" ")}
                >
                  ☰
                </button>
              </div>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-line bg-surface px-5 py-10 text-center text-sm text-muted shadow-sm">
            No tools match.{" "}
            <button
              type="button"
              className="font-medium text-foreground underline underline-offset-2"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {view === "grid" ? (
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {pageItems.map((t) => (
                  <li key={t.id} className="min-w-0">
                    <ToolCard
                      slug={t.slug}
                      title={t.title}
                      description={t.description}
                      priceUsdc={t.priceUsdc}
                      ownerLabel={t.ownerLabel}
                      ownerAddress={t.ownerAddress}
                      imageUrl={t.imageUrl}
                      category={t.category}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="mt-5 space-y-2">
                {pageItems.map((t) => (
                  <li key={t.id}>
                    <ToolCard
                      slug={t.slug}
                      title={t.title}
                      description={t.description}
                      priceUsdc={t.priceUsdc}
                      ownerLabel={t.ownerLabel}
                      ownerAddress={t.ownerAddress}
                      imageUrl={t.imageUrl}
                      category={t.category}
                      compact
                    />
                  </li>
                ))}
              </ul>
            )}

            {totalPages > 1 && (
              <nav
                aria-label="Pagination"
                className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-sm"
              >
                <p className="text-xs text-muted">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="inline-flex h-9 items-center rounded-full border border-line px-3 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:bg-surface-muted"
                  >
                    Previous
                  </button>
                  {pageNumbers.map((n, i) => {
                    const prev = pageNumbers[i - 1];
                    const showGap = prev != null && n - prev > 1;
                    return (
                      <span key={n} className="contents">
                        {showGap && (
                          <span className="px-1 text-xs text-muted" aria-hidden>
                            …
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => goToPage(n)}
                          aria-current={n === currentPage ? "page" : undefined}
                          className={[
                            "inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 text-xs font-medium",
                            n === currentPage
                              ? "bg-foreground text-surface"
                              : "border border-line hover:bg-surface-muted",
                          ].join(" ")}
                        >
                          {n}
                        </button>
                      </span>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="inline-flex h-9 items-center rounded-full border border-line px-3 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:bg-surface-muted"
                  >
                    Next
                  </button>
                </div>
              </nav>
            )}
          </>
        )}
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/30"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
          />
          <aside className="animate-drawer-in absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col rounded-r-3xl border-r border-line bg-surface p-5 shadow-lg">
            {filterPanel}
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-full bg-accent text-sm font-medium text-surface"
            >
              Show {filtered.length} tools
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
