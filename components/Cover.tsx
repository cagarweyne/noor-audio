// Shared cover-art placeholder + helpers.
// Replace <Cover> with a real <img> (via `src`) once artwork exists —
// keep the frame/shadow the callers apply through `className`.
import type { CSSProperties } from "react";

// A cover item as used across cards, scrollers and the mini-player.
export type CoverItem = {
  title: string;
  subtitle?: string;
  hue: number;
  cover?: string;
  progress?: number;
};

export function coverGradient(hue: number): CSSProperties {
  return {
    backgroundImage: `
      repeating-radial-gradient(circle at 74% 84%, transparent 0 13px, oklch(0.64 0.05 ${hue} / .05) 13px 14px),
      radial-gradient(circle at 28% 22%, oklch(0.54 0.10 ${hue}), transparent 62%),
      linear-gradient(150deg, oklch(0.37 0.075 ${hue}), oklch(0.19 0.03 ${hue}))`,
  };
}

type CoverProps = {
  hue?: number;
  src?: string;
  alt?: string;
  className?: string;
};

// Square cover tile. `src` wins if provided; else a hue gradient placeholder.
export function Cover({ hue = 78, src, alt = "", className = "" }: CoverProps) {
  return (
    <div
      className={`overflow-hidden bg-surface ${className}`}
      style={src ? undefined : coverGradient(hue)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- placeholder artwork; swap for next/image when real covers exist */}
      {src && <img src={src} alt={alt} className="h-full w-full object-cover" />}
    </div>
  );
}
