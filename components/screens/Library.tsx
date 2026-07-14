"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, ChevronRight, Heart, ArrowDownToLine, ArrowDownUp } from "lucide-react";
import { coverGradient } from "@/components/Cover";
import type { Collection } from "@/types";

const FILTERS = ["All", "Collections", "Reciters", "Downloads"] as const;
type Filter = (typeof FILTERS)[number];

// Rounded-square gradient glyph tile used by the pinned rows.
function GlyphTile({
  hue,
  children,
}: {
  hue: [number, number];
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card text-text-hi"
      style={{
        backgroundImage: `linear-gradient(150deg, oklch(0.55 0.09 ${hue[0]}), oklch(0.32 0.05 ${hue[1]}))`,
      }}
    >
      {children}
    </div>
  );
}

function Row({
  href,
  tile,
  title,
  subtitle,
}: {
  href: string;
  tile: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-2 py-2 no-underline transition-colors hover:bg-surface-2"
    >
      {tile}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14.5px] font-bold text-text-hi">{title}</div>
        <div className="truncate text-[12.5px] text-text-mid">{subtitle}</div>
      </div>
      <ChevronRight size={18} className="shrink-0 text-text-mid" />
    </Link>
  );
}

export default function Library({ collections }: { collections: Collection[] }) {
  const [filter, setFilter] = useState<Filter>("All");

  const showDownloads = filter === "All" || filter === "Downloads";
  const showLiked = filter === "All";
  const showCollections = filter === "All" || filter === "Collections";
  const showReciters = filter === "Reciters";

  return (
    <div className="min-h-full bg-ink-2 text-text-hi">
      <div className="mx-auto w-full max-w-3xl px-5 pb-10 pt-4 md:px-8">
        {/* header */}
        <header className="flex items-center justify-between">
          <h1 className="font-display text-[25px] font-semibold lg:text-[30px]">Your Library</h1>
          <div className="flex items-center gap-4 text-text-mid">
            <button aria-label="Search" className="hover:text-text-hi">
              <Search size={22} strokeWidth={1.8} />
            </button>
            <button aria-label="Add" className="hover:text-text-hi">
              <Plus size={24} strokeWidth={1.8} />
            </button>
          </div>
        </header>

        {/* filter chips */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => {
            const on = f === filter;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={on}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
                  on ? "bg-gold text-ink-contrast" : "bg-surface-2 text-text-mid hover:text-text-hi"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* sort row */}
        <div className="mt-4 flex items-center justify-between text-text-mid">
          <span className="text-[12.5px] font-semibold">
            {showCollections ? `${collections.length} collections` : " "}
          </span>
          <button className="flex items-center gap-1.5 text-[12.5px] font-semibold hover:text-text-hi">
            <ArrowDownUp size={15} strokeWidth={1.8} />
            Recently added
          </button>
        </div>

        {/* list */}
        <div className="mt-2 flex flex-col">
          {showDownloads && (
            <Row
              href="#"
              tile={
                <GlyphTile hue={[195, 220]}>
                  <ArrowDownToLine size={22} strokeWidth={1.9} />
                </GlyphTile>
              }
              title="Downloads"
              subtitle="Available offline"
            />
          )}
          {showLiked && (
            <Row
              href="#"
              tile={
                <GlyphTile hue={[20, 350]}>
                  <Heart size={22} strokeWidth={1.9} fill="currentColor" />
                </GlyphTile>
              }
              title="Liked Recitations"
              subtitle="Your saved ayat"
            />
          )}

          {showCollections &&
            collections.map((c) => (
              <Row
                key={c.slug}
                href={`/collection/${c.slug}`}
                tile={
                  <div
                    className="h-14 w-14 shrink-0 rounded-card"
                    style={coverGradient(c.hue)}
                  />
                }
                title={c.title}
                subtitle={`Collection · ${c.trackSlugs.length} tracks`}
              />
            ))}

          {showReciters && (
            <div className="mt-10 text-center text-[13px] text-text-mid">
              No reciters followed yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
