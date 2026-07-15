"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, ChevronRight } from "lucide-react";
import { coverGradient } from "@/components/Cover";
import { formatTime } from "@/components/player";

export type ProgressItem = {
  collectionSlug: string;
  collectionTitle: string;
  trackSlug: string;
  trackTitle: string;
  hue: number;
  positionSec: number;
  durationSec: number;
};

type YouUser = { name?: string | null; email?: string | null; image?: string | null };

const AVATAR_FALLBACK = "linear-gradient(150deg, oklch(0.5 0.08 195), oklch(0.3 0.05 250))";

export default function YouScreen({
  user,
  progress,
}: {
  user: YouUser | null;
  progress: ProgressItem[];
}) {
  if (!user) {
    return (
      <div className="min-h-full bg-ink-2 text-text-hi">
        <div className="mx-auto w-full max-w-2xl px-5 pb-10 pt-4 md:px-8">
          <h1 className="font-display text-[25px] font-semibold lg:text-[30px]">You</h1>
          <div className="mt-6 rounded-cover border border-line bg-surface p-6 text-center">
            <p className="text-[13.5px] leading-relaxed text-text-mid">
              Sign in to see your profile and progress.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex rounded-full bg-text-hi px-5 py-2.5 text-[14px] font-semibold text-ink no-underline transition-opacity hover:opacity-90"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-ink-2 text-text-hi">
      <div className="mx-auto w-full max-w-2xl px-5 pb-10 pt-4 md:px-8">
        <h1 className="font-display text-[25px] font-semibold lg:text-[30px]">You</h1>

        {/* profile */}
        <div className="mt-6 flex items-center gap-4 rounded-cover border border-line bg-surface p-4">
          <div
            className="h-16 w-16 shrink-0 rounded-full bg-cover bg-center"
            style={{ backgroundImage: user.image ? `url(${user.image})` : AVATAR_FALLBACK }}
          />
          <div className="min-w-0">
            <div className="truncate text-[17px] font-semibold">{user.name ?? "Listener"}</div>
            {user.email && <div className="truncate text-[13px] text-text-mid">{user.email}</div>}
          </div>
        </div>

        {/* continue listening — one entry per collection you've played */}
        <h2 className="mt-8 font-display text-[19px] font-semibold lg:text-[21px]">
          Continue listening
        </h2>

        {progress.length === 0 ? (
          <p className="mt-3 text-[13.5px] text-text-mid">
            Nothing yet — play a track and it&rsquo;ll show up here.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-1">
            {progress.map((it) => {
              const pct =
                it.durationSec > 0 ? Math.min(100, (it.positionSec / it.durationSec) * 100) : 0;
              return (
                <Link
                  key={it.collectionSlug}
                  href={`/player/${it.collectionSlug}/${it.trackSlug}`}
                  className="flex items-center gap-3 rounded-xl p-2 no-underline transition-colors hover:bg-surface-2"
                >
                  <div className="h-14 w-14 shrink-0 rounded-card" style={coverGradient(it.hue)} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14.5px] font-bold text-text-hi">
                      {it.collectionTitle}
                    </div>
                    <div className="truncate text-[12.5px] text-text-mid">{it.trackTitle}</div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1 flex-1 rounded bg-line">
                        <div className="h-full rounded bg-gold" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="shrink-0 text-[11px] tabular-nums text-text-low">
                        {formatTime(it.positionSec)} / {formatTime(it.durationSec)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="shrink-0 self-center text-text-mid" />
                </Link>
              );
            })}
          </div>
        )}

        {/* sign out */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-surface-2 px-4 py-3 text-[14px] font-semibold text-text-hi transition-colors hover:bg-surface-3"
        >
          <LogOut size={18} strokeWidth={1.9} />
          Sign out
        </button>
      </div>
    </div>
  );
}
