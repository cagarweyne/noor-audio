"use client";

import { useEffect, useState } from "react";
import CoverCard from "@/components/CoverCard";
import { getRecentlyPlayed, type RecentTrack } from "@/lib/recently-played";

// "Continue listening" scroller. Reads local progress on mount (client-only).
// When the DB + auth land, swap getRecentlyPlayed() for a per-user fetch.
export default function JumpBackIn() {
  const [items, setItems] = useState<RecentTrack[]>([]);

  useEffect(() => {
    setItems(
      getRecentlyPlayed().filter(
        (e) => e.durationSec > 0 && e.positionSec / e.durationSec < 0.98,
      ),
    );
  }, []);

  if (items.length === 0) return null;

  return (
    <section>
      <div className="mt-7 flex items-baseline justify-between">
        <h2 className="font-display text-[19px] font-semibold lg:text-[21px]">Jump back in</h2>
      </div>
      <div className="mt-3.5 flex gap-3.5 overflow-x-auto pb-1">
        {items.map((it) => (
          <CoverCard
            key={it.href}
            item={{
              title: it.title,
              subtitle: it.meta,
              hue: it.hue,
              progress: it.positionSec / it.durationSec,
            }}
            href={it.href}
            size={132}
            showProgress
          />
        ))}
      </div>
    </section>
  );
}
