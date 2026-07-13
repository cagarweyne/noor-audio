import { User } from 'lucide-react';
import CoverCard from '@/components/CoverCard';
import { tracksBySection } from '@/components/catalog';

// Sourced from the shared catalog so each card links to its player view.
const CONTINUE = tracksBySection('continue');
const SERIES = tracksBySection('series');

function Section({ title }: { title: string }) {
  return (
    <div className="mt-7 flex items-baseline justify-between">
      <h2 className="font-display text-[19px] font-semibold lg:text-[21px]">
        {title}
      </h2>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-full bg-ink-2 text-text-hi">
      <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-4 md:px-8 lg:px-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="mt-0.5 font-display text-[25px] font-semibold lg:text-[30px]">
              As-salamu alaykum
            </h1>
          </div>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full md:hidden"
            style={{
              backgroundImage:
                'linear-gradient(150deg, oklch(0.5 0.08 195), oklch(0.3 0.05 250))',
            }}
          >
            <User size={20} className="text-text-hi" strokeWidth={1.8} />
          </div>
        </header>

        <Section title="Jump back in" />
        <div className="mt-3.5 flex gap-3.5 overflow-x-auto pb-1">
          {CONTINUE.map((it) => (
            <CoverCard
              key={it.slug}
              item={it}
              href={`/player/${it.slug}`}
              size={132}
              showProgress
            />
          ))}
        </div>

        <Section title="Series" />
        <div className="mt-3.5 flex gap-3.5 overflow-x-auto pb-1">
          {SERIES.map((it) => (
            <CoverCard
              key={it.slug}
              item={it}
              href={`/player/${it.slug}`}
              size={150}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
