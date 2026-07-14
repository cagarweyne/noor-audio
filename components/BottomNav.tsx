"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, navIsActive } from "@/components/navigation";

// Mobile bottom tab bar. Active tab is derived from the current route.
export default function BottomNav() {
  const pathname = usePathname() ?? "";
  return (
    <nav
      className="flex h-[70px] items-start justify-around border-t border-line/50 px-2 pt-2.5 backdrop-blur-md"
      style={{
        background: "linear-gradient(180deg, transparent, oklch(0.15 0.012 70) 38%)",
      }}
    >
      {NAV_ITEMS.map(({ key, label, href, Icon }) => {
        const on = navIsActive(pathname, href);
        return (
          <Link
            key={key}
            href={href}
            className={`flex w-16 flex-col items-center gap-[5px] no-underline ${
              on ? "text-gold-accent" : "text-text-mid"
            }`}
          >
            <Icon size={23} strokeWidth={1.8} />
            <span className="text-[10.5px] font-semibold tracking-wide">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
