import { User } from "lucide-react";
import CoverCard from "@/components/CoverCard";
import JumpBackIn from "@/components/screens/JumpBackIn";
import { getAllCollections } from "@/lib/collections";

function Section({ title }: { title: string }) {
  return (
    <div className="mt-7 flex items-baseline justify-between">
      <h2 className="font-display text-[19px] font-semibold lg:text-[21px]">{title}</h2>
    </div>
  );
}

export default async function Home() {
  const collections = await getAllCollections();

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
              backgroundImage: "linear-gradient(150deg, oklch(0.5 0.08 195), oklch(0.3 0.05 250))",
            }}
          >
            <User size={20} className="text-text-hi" strokeWidth={1.8} />
          </div>
        </header>

        <JumpBackIn />

        <Section title="Collections" />
        {collections.length === 0 ? (
          <p className="mt-4 text-[13.5px] text-text-mid">
            No collections available yet.
          </p>
        ) : (
          <div className="mt-3.5 flex flex-wrap gap-3.5">
            {collections.map((c) => (
              <CoverCard
                key={c.slug}
                item={{
                  title: c.title,
                  subtitle: `${c.tracks.length} tracks`,
                  hue: c.hue,
                }}
                href={`/collection/${c.slug}`}
                size={150}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
