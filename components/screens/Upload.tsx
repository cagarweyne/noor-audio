"use client";

import { useRef, useState } from "react";
import { Upload as UploadIcon, Music, Check, X, Loader2, Plus } from "lucide-react";
import { createUserCollection, presignUpload, finalizeTrack } from "@/app/upload/actions";

type ExistingCollection = { id: string; title: string; trackCount: number };

type ItemStatus = "queued" | "uploading" | "done" | "error";
type QueueItem = {
  id: string;
  file: File;
  title: string;
  status: ItemStatus;
  progress: number; // 0–1
  error?: string;
};

function prettySize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Read duration client-side so we can store it without decoding on the server.
function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    const url = URL.createObjectURL(file);
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    audio.src = url;
  });
}

// PUT the file straight to R2 via the presigned URL, reporting progress.
function putWithProgress(url: string, file: File, onProgress: (p: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type || "audio/mpeg");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

export default function UploadScreen({ collections }: { collections: ExistingCollection[] }) {
  const [mode, setMode] = useState<"new" | "existing">(collections.length ? "existing" : "new");
  const [newTitle, setNewTitle] = useState("");
  const [existingId, setExistingId] = useState(collections[0]?.id ?? "");
  const [items, setItems] = useState<QueueItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState<{ count: number; title: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateItem = (id: string, patch: Partial<QueueItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const mp3s = Array.from(files).filter((f) => /\.mp3$/i.test(f.name));
    setDone(null);
    setItems((prev) => [
      ...prev,
      ...mp3s.map((file) => ({
        id: crypto.randomUUID(),
        file,
        title: file.name.replace(/\.mp3$/i, ""),
        status: "queued" as ItemStatus,
        progress: 0,
      })),
    ]);
  };

  const canUpload =
    !uploading &&
    items.some((it) => it.status === "queued" || it.status === "error") &&
    (mode === "existing" ? Boolean(existingId) : newTitle.trim().length > 0);

  async function handleUpload() {
    setUploading(true);
    setDone(null);
    try {
      let collectionId = existingId;
      let collectionTitle =
        collections.find((c) => c.id === existingId)?.title ?? newTitle.trim();
      if (mode === "new") {
        const created = await createUserCollection(newTitle);
        collectionId = created.id;
        collectionTitle = created.title;
      }
      if (!collectionId) throw new Error("Pick or name a collection first");

      let successCount = 0;
      const pending = items.filter((it) => it.status !== "done");
      for (const item of pending) {
        updateItem(item.id, { status: "uploading", progress: 0, error: undefined });
        try {
          const durationSec = Math.floor(await getAudioDuration(item.file));
          const { url, storageKey } = await presignUpload({
            collectionId,
            fileName: item.file.name,
            sizeBytes: item.file.size,
          });
          await putWithProgress(url, item.file, (p) => updateItem(item.id, { progress: p }));
          await finalizeTrack({
            collectionId,
            storageKey,
            title: item.title,
            durationSec,
            sizeBytes: item.file.size,
          });
          updateItem(item.id, { status: "done", progress: 1 });
          successCount += 1;
        } catch (e) {
          updateItem(item.id, { status: "error", error: (e as Error).message });
        }
      }
      if (successCount > 0) setDone({ count: successCount, title: collectionTitle });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-full bg-ink-2 text-text-hi">
      <div className="mx-auto w-full max-w-2xl px-5 pb-10 pt-4 md:px-8">
        <h1 className="font-display text-[25px] font-semibold lg:text-[30px]">Upload audio</h1>
        <p className="mt-1 text-[13.5px] text-text-mid">
          Add your own MP3s. Files upload one at a time; large files are fine.
        </p>

        {/* collection target */}
        <div className="mt-6 rounded-cover border border-line bg-surface p-4">
          {collections.length > 0 && (
            <div className="mb-3 flex gap-2">
              <button
                onClick={() => setMode("existing")}
                className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                  mode === "existing" ? "bg-gold text-ink-contrast" : "bg-surface-2 text-text-mid"
                }`}
              >
                Add to existing
              </button>
              <button
                onClick={() => setMode("new")}
                className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                  mode === "new" ? "bg-gold text-ink-contrast" : "bg-surface-2 text-text-mid"
                }`}
              >
                New collection
              </button>
            </div>
          )}

          {mode === "new" ? (
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Collection name — e.g. My Lectures"
              className="w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-[14px] text-text-hi outline-none placeholder:text-text-low focus:border-gold-accent"
            />
          ) : (
            <select
              value={existingId}
              onChange={(e) => setExistingId(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-[14px] text-text-hi outline-none focus:border-gold-accent"
            >
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.trackCount})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* drop zone */}
        <button
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
          className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-cover border border-dashed border-line bg-surface/50 px-4 py-10 text-center transition-colors hover:border-gold-accent hover:bg-surface"
        >
          <UploadIcon size={26} className="text-text-mid" />
          <span className="text-[13.5px] font-semibold text-text-hi">Choose files or drag them here</span>
          <span className="text-[12px] text-text-low">MP3, up to 100 MB each</span>
          <input
            ref={inputRef}
            type="file"
            accept="audio/mpeg,.mp3"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </button>

        {/* queue */}
        {items.length > 0 && (
          <div className="mt-4 flex flex-col gap-1.5">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-text-mid">
                  {it.status === "done" ? (
                    <Check size={18} className="text-gold" />
                  ) : it.status === "error" ? (
                    <X size={18} className="text-red-400" />
                  ) : it.status === "uploading" ? (
                    <Loader2 size={18} className="animate-spin text-gold-accent" />
                  ) : (
                    <Music size={18} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-semibold text-text-hi">{it.title}</div>
                  {it.status === "error" ? (
                    <div className="truncate text-[11.5px] text-red-400">{it.error}</div>
                  ) : it.status === "uploading" || it.status === "done" ? (
                    <div className="mt-1 h-1 w-full rounded bg-line">
                      <div
                        className="h-full rounded bg-gold transition-all"
                        style={{ width: `${Math.round(it.progress * 100)}%` }}
                      />
                    </div>
                  ) : (
                    <div className="truncate text-[11.5px] text-text-low">{prettySize(it.file.size)}</div>
                  )}
                </div>
                {it.status === "queued" && !uploading && (
                  <button
                    onClick={() => setItems((prev) => prev.filter((x) => x.id !== it.id))}
                    aria-label="Remove"
                    className="text-text-mid hover:text-text-hi"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {done && (
          <p className="mt-4 rounded-xl bg-surface px-3 py-2.5 text-[13px] text-gold-accent">
            Uploaded {done.count} track{done.count === 1 ? "" : "s"} to “{done.title}”.
          </p>
        )}

        <button
          onClick={handleUpload}
          disabled={!canUpload}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gold px-4 py-3 text-[14px] font-semibold text-ink-contrast shadow-glow transition-opacity disabled:opacity-40"
        >
          {uploading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Plus size={18} />
              Upload {items.filter((i) => i.status !== "done").length || ""} file
              {items.filter((i) => i.status !== "done").length === 1 ? "" : "s"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
