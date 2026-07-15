"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

const AVATAR_FALLBACK = "linear-gradient(150deg, oklch(0.5 0.08 195), oklch(0.3 0.05 250))";

export default function YouScreen() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-full bg-ink-2 text-text-hi">
      <div className="mx-auto w-full max-w-2xl px-5 pb-10 pt-4 md:px-8">
        <h1 className="font-display text-[25px] font-semibold lg:text-[30px]">You</h1>

        {status === "loading" ? (
          <p className="mt-6 text-[13.5px] text-text-mid">Loading…</p>
        ) : session?.user ? (
          <>
            {/* profile */}
            <div className="mt-6 flex items-center gap-4 rounded-cover border border-line bg-surface p-4">
              <div
                className="h-16 w-16 shrink-0 rounded-full bg-cover bg-center"
                style={{
                  backgroundImage: session.user.image
                    ? `url(${session.user.image})`
                    : AVATAR_FALLBACK,
                }}
              />
              <div className="min-w-0">
                <div className="truncate text-[17px] font-semibold">
                  {session.user.name ?? "Listener"}
                </div>
                {session.user.email && (
                  <div className="truncate text-[13px] text-text-mid">{session.user.email}</div>
                )}
              </div>
            </div>

            {/*
              Your progress goes here later — per-collection / per-track listening
              progress from TrackProgress (getContinueListening).
            */}

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-surface-2 px-4 py-3 text-[14px] font-semibold text-text-hi transition-colors hover:bg-surface-3"
            >
              <LogOut size={18} strokeWidth={1.9} />
              Sign out
            </button>
          </>
        ) : (
          <div className="mt-6 rounded-cover border border-line bg-surface p-6 text-center">
            <p className="text-[13.5px] leading-relaxed text-text-mid">
              Sign in to see your profile and pick up where you left off.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex rounded-full bg-text-hi px-5 py-2.5 text-[14px] font-semibold text-ink no-underline transition-opacity hover:opacity-90"
            >
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
