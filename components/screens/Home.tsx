import { User } from "lucide-react";
import Link from "next/link";
import CoverCard from "@/components/CoverCard";
import { coverGradient, type CoverItem } from "@/components/Cover";

// Demo data — replace with fetched data.
const CONTINUE: CoverItem[] = [
  { title: "Juz' Amma — Recitation", subtitle: "Murattal", hue: 78, progress: 0.62 },
  { title: "The Seerah · Part 12", subtitle: "Life of the Prophet ﷺ", hue: 250, progress: 0.34 },
  { title: "Stories of the Prophets", subtitle: "Lecture series", hue: 320, progress: 0.8 },
  { title: "Tazkiyah · Purification", subtitle: "Reflections", hue: 150, progress: 0.15 },
];
const SERIES: CoverItem[] = [
  { title: "Fiqh of Worship", subtitle: "24 lectures", hue: 195 },
  { title: "Ramadan Nights", subtitle: "Reflections", hue: 40 },
  { title: "Prophetic Duas", subtitle: "Collection", hue: 150 },
  { title: "Tafsir Essentials", subtitle: "18 lectures", hue: 250 },
];

function QuickTile({ title, hue }: { title: string; hue: number }) {
  return (
    <Link
      href="#"
      className="flex h-14 items-center gap-2.5 overflow-hidden rounded-xl bg-surface px-3 no-underline transition-colors hover:bg-surface-2"
    >
      <div className="h-10 w-10 flex-shrink-0 rounded-lg" style={coverGradient(hue)} />
      <span className="text-[13.5px] font-bold leading-tight text-text-hi">{title}</span>
    </Link>
  );
}

function Section({ title }: { title: string }) {
  return (
    <div className="mt-7 flex items-baseline justify-between">
      <h2 className="font-display text-[19px] font-semibold lg:text-[21px]">{title}</h2>
      <Link href="#" className="text-[12.5px] font-semibold text-text-mid hover:text-text-hi">
        See all
      </Link>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-full bg-ink-2 text-text-hi">
      <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-4 md:px-8 lg:px-10">
        <header className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-medium text-text-mid">Fajr · Wednesday</div>
            <h1 className="mt-0.5 font-display text-[25px] font-semibold lg:text-[30px]">
              As-salamu alaykum
            </h1>
          </div>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full md:hidden"
            style={{
              backgroundImage: "linear-gradient(150deg, oklch(0.5 0.08 195), oklch(0.3 0.05 250))",
            }}
          >
            <User size={20} className="text-text-hi" strokeWidth={1.8} />
          </div>
        </header>

        <div className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <QuickTile title="Daily Adhkar" hue={78} />
          <QuickTile title="Continue Juz' 30" hue={195} />
          <QuickTile title="Tafsir of the Day" hue={250} />
          <QuickTile title="Evening Adhkar" hue={40} />
        </div>

        <Section title="Jump back in" />
        <div className="mt-3.5 flex gap-3.5 overflow-x-auto pb-1">
          {CONTINUE.map((it) => (
            <CoverCard key={it.title} item={it} size={132} showProgress />
          ))}
        </div>

        <Section title="Popular series" />
        <div className="mt-3.5 flex gap-3.5 overflow-x-auto pb-1">
          {SERIES.map((it) => (
            <CoverCard key={it.title} item={it} size={150} />
          ))}
        </div>
      </div>
    </div>
  );
}
