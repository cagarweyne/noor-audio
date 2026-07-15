"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import CoverCard from "@/components/CoverCard";

type ProgressItem = {
  collectionSlug: string;
  trackSlug: string;
  title: string;
  hue: number;
  positionSec: number;
  durationSec: number;
};

// "Continue listening" scroller — signed-in view only. Reads the user's saved
// progress from the DB (GET /api/progress).
export default function JumpBackIn() {
  const { status } = useSession();
  const [items, setItems] = useState<ProgressItem[]>([]);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    fetch("/api/progress")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data) => {
        if (!active) return;
        const list: ProgressItem[] = (data.items ?? []).filter(
          (e: ProgressItem) => e.durationSec > 0 && e.positionSec / e.durationSec < 0.98,
        );
        setItems(list);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [status]);

  if (status !== "authenticated" || items.length === 0) return null;

  return (
    <section>
      <div className="mt-7 flex items-baseline justify-between">
        <h2 className="font-display text-[19px] font-semibold lg:text-[21px]">Jump back in</h2>
      </div>
      <div className="mt-3.5 flex gap-3.5 overflow-x-auto pb-1">
        {items.map((it) => (
          <CoverCard
            key={`${it.collectionSlug}/${it.trackSlug}`}
            item={{
              title: it.title,
              hue: it.hue,
              progress: it.positionSec / it.durationSec,
            }}
            href={`/player/${it.collectionSlug}/${it.trackSlug}`}
            size={132}
            showProgress
          />
        ))}
      </div>
    </section>
  );
}
