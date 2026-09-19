"use client";

import Link from "next/link";
import {
  IconCompass,
  IconPlugConnected,
  IconTools,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";

const pillars: {
  title: string;
  description: string;
  link: string;
  icon: ReactNode;
}[] = [
  {
    title: "MCP Hub",
    description:
      "Connect your assistant once. It can discover tools, pay on Arc, and unlock replies.",
    link: "/hub",
    icon: <IconPlugConnected className="h-5 w-5" stroke={1.5} />,
  },
  {
    title: "Studio",
    description:
      "Publish a tool, set your price, and earn USDC when agents unlock it.",
    link: "/studio",
    icon: <IconTools className="h-5 w-5" stroke={1.5} />,
  },
  {
    title: "Explore",
    description:
      "Browse live tools on the network — try one in the browser before you integrate.",
    link: "/services",
    icon: <IconCompass className="h-5 w-5" stroke={1.5} />,
  },
];

export function WhatYouGet() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="border-t border-line/80 bg-surface/40 py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <p className="text-sm font-medium uppercase tracking-wider text-muted">
          What you get
        </p>
        <h2 className="mt-3 max-w-xl font-display text-3xl tracking-tight md:text-4xl">
          Three ways to work with arcdot.
        </h2>
        <p className="mt-3 max-w-lg text-muted">
          Connect, publish, or browse — each surface has one clear job.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-2 py-2 md:grid-cols-3">
          {pillars.map((item, idx) => (
            <Link
              href={item.link}
              key={item.link}
              className="group relative block h-full w-full p-2"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <AnimatePresence>
                {hoveredIndex === idx && (
                  <motion.span
                    className="absolute inset-0 block h-full w-full rounded-2xl bg-foreground/[0.04]"
                    layoutId="pillarHover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.15 } }}
                    exit={{
                      opacity: 0,
                      transition: { duration: 0.15, delay: 0.1 },
                    }}
                  />
                )}
              </AnimatePresence>
              <div
                className={cn(
                  "relative z-20 h-full overflow-hidden rounded-2xl border border-line bg-surface p-6",
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-foreground">
                  {item.icon}
                </div>
                <h3 className="mt-5 font-display text-xl tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
