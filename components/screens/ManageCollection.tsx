"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, Trash2, Loader2, Check } from "lucide-react";
import { formatTime } from "@/components/player";
import {
  renameUserCollection,
  renameUserTrack,
  deleteUserTrack,
  deleteUserCollection,
} from "@/app/collection/actions";

type TrackRow = { id: string; title: string; durationSec: number };

export default function ManageCollection({
  id,
  title: initialTitle,
  tracks: initialTracks,
}: {
  id: string;
  title: string;
  tracks: TrackRow[];
}) {
  const [title, setTitle] = useState(initialTitle);
  const [tracks, setTracks] = useState(initialTracks);
  const [savedTitle, setSavedTitle] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [savingTitle, startSaveTitle] = useTransition();
  const [pending, startTransition] = useTransition();

  const saveTitle = () =>
    startSaveTitle(async () => {
      await renameUserCollection(id, title);
      setSavedTitle(true);
      setTimeout(() => setSavedTitle(false), 1500);
    });

  const saveTrackTitle = (tid: string, next: string) => {
    const value = next.trim();
    const current = tracks.find((t) => t.id === tid);
    if (!value || !current || value === current.title) return;
    setTracks((prev) => prev.map((t) => (t.id === tid ? { ...t, title: value } : t)));
    startTransition(async () => {
      await renameUserTrack(tid, value);
    });
  };

  const removeTrack = (tid: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== tid));
    startTransition(async () => {
      await deleteUserTrack(tid);
    });
  };

  const removeCollection = () =>
    startTransition(async () => {
      await deleteUserCollection(id); // redirects to /library on success
    });

  return (
    <div className="min-h-full bg-ink-2 text-text-hi">
      <div className="mx-auto w-full max-w-2xl px-5 pb-10 pt-4 md:px-8">
        <Link
          href={`/collection/${id}`}
          aria-label="Back to collection"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-text-hi backdrop-blur"
        >
          <ChevronLeft size={22} />
        </Link>

        <h1 className="mt-3 font-display text-[25px] font-semibold lg:text-[30px]">
          Manage collection
        </h1>

        {/* rename collection */}
        <label className="mt-6 block text-[12.5px] font-semibold text-text-mid">Name</label>
        <div className="mt-1.5 flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-[14px] text-text-hi outline-none focus:border-gold-accent"
          />
          <button
            onClick={saveTitle}
            disabled={savingTitle || !title.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-gold px-4 text-[13px] font-semibold text-ink-contrast disabled:opacity-40"
          >
            {savingTitle ? (
              <Loader2 size={16} className="animate-spin" />
            ) : savedTitle ? (
              <Check size={16} />
            ) : null}
            Save
          </button>
        </div>

        {/* tracks */}
        <h2 className="mt-8 text-[12.5px] font-semibold text-text-mid">
          Tracks ({tracks.length})
        </h2>
        {tracks.length === 0 ? (
          <p className="mt-3 text-[13.5px] text-text-mid">No tracks left in this collection.</p>
        ) : (
          <div className="mt-2 flex flex-col gap-1.5">
            {tracks.map((t) => (
              <div key={t.id} className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2">
                <input
                  defaultValue={t.title}
                  onBlur={(e) => saveTrackTitle(t.id, e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                  className="min-w-0 flex-1 rounded-lg bg-transparent px-1.5 py-1 text-[14px] text-text-hi outline-none focus:bg-surface-2"
                />
                <span className="shrink-0 text-[11.5px] tabular-nums text-text-low">
                  {formatTime(t.durationSec)}
                </span>
                <button
                  onClick={() => removeTrack(t.id)}
                  aria-label={`Delete ${t.title}`}
                  className="shrink-0 text-text-mid hover:text-red-400"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* danger zone */}
        <div className="mt-10 rounded-cover border border-red-500/30 bg-red-500/5 p-4">
          <div className="text-[13.5px] font-semibold text-text-hi">Delete collection</div>
          <div className="mt-0.5 text-[12.5px] text-text-mid">
            Permanently removes this collection and all its uploaded files. This can&rsquo;t be undone.
          </div>
          {confirmDelete ? (
            <div className="mt-3 flex gap-2">
              <button
                onClick={removeCollection}
                disabled={pending}
                className="flex items-center gap-1.5 rounded-full bg-red-500 px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
              >
                {pending && <Loader2 size={15} className="animate-spin" />}
                Yes, delete everything
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-full bg-surface-2 px-4 py-2 text-[13px] font-semibold text-text-hi"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="mt-3 flex items-center gap-2 rounded-full bg-surface-2 px-4 py-2 text-[13px] font-semibold text-red-400 hover:bg-surface-3"
            >
              <Trash2 size={16} />
              Delete collection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
