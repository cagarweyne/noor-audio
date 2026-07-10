"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AppLogo from "@/components/AppLogo";
import { NAV_ITEMS, navIsActive } from "@/components/navigation";

// Demo library entries (desktop only). Replace with fetched collections.
const LIBRARY = ["Juz' Amma", "The Seerah", "Fiqh of Worship", "Prophetic Duas"];

// Left navigation for tablet (md, icon rail) and desktop (lg, labelled sidebar).
export default function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden shrink-0 flex-col border-r border-line bg-ink-2 md:flex md:w-24 lg:w-64">
      {/* logo */}
      <div className="flex h-16 items-center justify-center gap-3 px-4 lg:justify-start lg:px-6">
        <AppLogo size={40} />
        <div className="hidden lg:block">
          <div className="font-display text-xl font-semibold leading-none">Noor</div>
          <div className="font-arabic text-[13px] text-gold-accent" dir="rtl">
            نور
          </div>
        </div>
      </div>

      {/* primary nav */}
      <nav className="mt-2 flex flex-col gap-1 px-3 lg:px-4">
        {NAV_ITEMS.map(({ key, label, href, Icon }) => {
          const on = navIsActive(pathname, href);
          return (
            <Link
              key={key}
              href={href}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2.5 no-underline transition-colors lg:flex-row lg:gap-3 ${
                on
                  ? "bg-surface-3 text-gold-accent"
                  : "text-text-mid hover:bg-surface-2 hover:text-text-hi"
              }`}
            >
              <Icon size={22} strokeWidth={1.8} />
              <span className="text-[10.5px] font-semibold lg:text-sm lg:font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* library list (desktop only) */}
      <div className="mt-7 hidden min-h-0 flex-1 flex-col px-6 lg:flex">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-text-low">
          Your Library
        </div>
        <ul className="mt-3 flex flex-col gap-1 overflow-y-auto">
          {LIBRARY.map((name) => (
            <li key={name}>
              <Link
                href="#"
                className="block truncate rounded-md px-2 py-1.5 text-[13.5px] text-text-mid no-underline hover:bg-surface-2 hover:text-text-hi"
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* profile */}
      <div className="mt-auto flex items-center justify-center gap-3 border-t border-line/60 p-4 lg:justify-start lg:px-6">
        <div
          className="h-9 w-9 shrink-0 rounded-full"
          style={{
            backgroundImage: "linear-gradient(150deg, oklch(0.5 0.08 195), oklch(0.3 0.05 250))",
          }}
        />
        <div className="hidden lg:block">
          <div className="text-[13px] font-semibold text-text-hi">Guest</div>
          <div className="text-[11.5px] text-text-mid">Sign in</div>
        </div>
      </div>
    </aside>
  );
}
