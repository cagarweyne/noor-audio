import type { ReactNode } from "react";

// Optional: wraps a mobile screen in a phone frame for preview/storybook.
// In the real app, screens fill the viewport and this shell is not used.
export default function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-[844px] w-[390px] overflow-hidden rounded-phone border-[9px] border-black bg-ink-2 shadow-cover-lg">
      <div className="absolute left-1/2 top-[11px] z-20 h-[30px] w-[112px] -translate-x-1/2 rounded-2xl bg-black" />
      <div className="absolute inset-x-0 top-0 z-[15] flex h-[52px] items-center justify-between px-8 text-sm font-bold">
        <span>9:41</span>
        <span className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold">5G</span>
          <span className="inline-flex h-[11px] w-[22px] items-center rounded-[3px] border border-text-hi p-[1.4px]">
            <span className="h-full w-[72%] rounded-[1px] bg-text-hi" />
          </span>
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 top-[52px]">{children}</div>
    </div>
  );
}
