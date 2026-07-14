"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import AppLogo from "@/components/AppLogo";
import { NAV_ITEMS, navIsActive } from "@/components/navigation";

type SideNavProps = {
  collections: { slug: string; title: string }[];
};

// Left navigation for tablet (md, icon rail) and desktop (lg, labelled sidebar).
export default function SideNav({ collections }: SideNavProps) {
  const pathname = usePathname() ?? "";
  const { data: session } = useSession();

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
          {collections.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/collection/${c.slug}`}
                className="block truncate rounded-md px-2 py-1.5 text-[13.5px] text-text-mid no-underline hover:bg-surface-2 hover:text-text-hi"
              >
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* profile / auth */}
      <div className="mt-auto border-t border-line/60 p-4 lg:px-6">
        {session?.user ? (
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 shrink-0 rounded-full bg-cover bg-center"
              style={{
                backgroundImage: session.user.image
                  ? `url(${session.user.image})`
                  : "linear-gradient(150deg, oklch(0.5 0.08 195), oklch(0.3 0.05 250))",
              }}
            />
            <div className="hidden min-w-0 flex-1 lg:block">
              <div className="truncate text-[13px] font-semibold text-text-hi">
                {session.user.name ?? session.user.email}
              </div>
              <button
                onClick={() => signOut()}
                className="text-[11.5px] text-text-mid hover:text-text-hi"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            aria-label="Sign in"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-surface-2 px-3 py-2 text-[12.5px] font-semibold text-text-hi no-underline transition-colors hover:bg-surface-3 lg:justify-start"
          >
            <span
              className="h-6 w-6 shrink-0 rounded-full"
              style={{
                backgroundImage: "linear-gradient(150deg, oklch(0.5 0.08 195), oklch(0.3 0.05 250))",
              }}
            />
            <span className="hidden lg:inline">Sign in</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
