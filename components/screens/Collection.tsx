"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Heart, ArrowDownToLine, ArrowDownUp, Play } from "lucide-react";
import { coverGradient } from "@/components/Cover";
import { formatTime } from "@/components/player";
import type { Collection, Track } from "@/components/catalog";

type CollectionScreenProps = {
  collection: Collection;
  tracks: Track[];
};

export default function CollectionScreen({ collection, tracks }: CollectionScreenProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const first = tracks[0];

  return (
    <div className="relative min-h-full bg-ink-2 text-text-hi">
      {/* gradient wash from the cover hue */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-80"
        style={{
          backgroundImage: `linear-gradient(180deg, oklch(0.4 0.09 ${collection.hue} / 0.55), transparent)`,
        }}
      />

      <div className="relative mx-auto w-full max-w-2xl px-5 pb-10 pt-4 md:px-8">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-text-hi backdrop-blur"
        >
          <ChevronLeft size={22} />
        </button>

        {/* header */}
        <div className="mt-3 flex flex-col items-center text-center">
          <div
            className="h-44 w-44 rounded-cover shadow-cover-lg"
            style={coverGradient(collection.hue)}
          />
          <div className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-text-mid">
            {collection.kind}
          </div>
          <h1 className="mt-1 font-display text-[27px] font-semibold leading-tight">
            {collection.title}
          </h1>
          {collection.arabicTitle && (
            <div className="mt-0.5 font-arabic text-[18px] text-gold-accent" dir="rtl">
              {collection.arabicTitle}
            </div>
          )}
          <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-text-mid">
            {collection.description}
          </p>
        </div>

        {/* action row */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-5 text-text-mid">
            <button
              aria-label={isLiked ? "Unlike" : "Like"}
              aria-pressed={isLiked}
              onClick={() => setIsLiked((v) => !v)}
              className="hover:text-text-hi"
            >
              <Heart
                size={24}
                strokeWidth={1.8}
                className={isLiked ? "text-gold" : ""}
                fill={isLiked ? "currentColor" : "none"}
              />
            </button>
            <button
              aria-label={downloaded ? "Downloaded" : "Download"}
              aria-pressed={downloaded}
              onClick={() => setDownloaded((v) => !v)}
              className="hover:text-text-hi"
            >
              <ArrowDownToLine
                size={24}
                strokeWidth={1.8}
                className={downloaded ? "text-gold" : ""}
              />
            </button>
            <button aria-label="Sort" className="hover:text-text-hi">
              <ArrowDownUp size={22} strokeWidth={1.8} />
            </button>
          </div>

          {first && (
            <Link
              href={`/player/${first.slug}`}
              aria-label={`Play ${collection.title}`}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-ink-contrast shadow-glow"
            >
              <Play size={24} fill="currentColor" className="ml-0.5" />
            </Link>
          )}
        </div>

        {/* track list */}
        <ol className="mt-6 flex flex-col">
          {tracks.map((t, i) => (
            <li key={t.slug}>
              <Link
                href={`/player/${t.slug}`}
                className="flex items-center gap-4 rounded-lg px-2 py-2.5 no-underline transition-colors hover:bg-surface-2"
              >
                <span className="w-5 shrink-0 text-center text-[13px] tabular-nums text-text-mid">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14.5px] font-semibold text-text-hi">{t.title}</div>
                  <div className="truncate text-[12.5px] text-text-mid">{t.meta}</div>
                </div>
                <span className="shrink-0 text-[12px] tabular-nums text-text-mid">
                  {formatTime(t.durationSec)}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
