"use client";

import { useEffect, useMemo, useState } from "react";

export type TocItem = { id: string; label: string; level: 2 | 3 };

/** Collect h2/h3 from the article for “On this page”. */
export function DocsToc({ containerId }: { containerId: string }) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const root = document.getElementById(containerId);
    if (!root) return;

    const headings = Array.from(
      root.querySelectorAll<HTMLElement>("h2[id], h3[id]"),
    );
    const next: TocItem[] = headings.map((el) => ({
      id: el.id,
      label: el.textContent?.trim() || el.id,
      level: el.tagName === "H3" ? 3 : 2,
    }));
    setItems(next);

    if (next.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.6, 1] },
    );
    for (const h of headings) observer.observe(h);
    return () => observer.disconnect();
  }, [containerId]);

  const list = useMemo(() => items, [items]);
  if (list.length === 0) return null;

  return (
    <nav aria-label="On this page" className="docs-toc">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        On this page
      </p>
      <ul className="space-y-1 border-l border-line">
        {list.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={[
                  "block border-l-2 py-1 text-[13px] leading-snug transition-colors",
                  item.level === 3 ? "pl-5" : "pl-3",
                  isActive
                    ? "-ml-px border-foreground text-foreground"
                    : "border-transparent text-muted hover:text-foreground",
                ].join(" ")}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
