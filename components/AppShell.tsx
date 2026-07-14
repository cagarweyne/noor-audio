import type { ReactNode } from "react";
import { PlayerProvider } from "@/components/player-context";
import SideNav from "@/components/SideNav";
import PlayerBar from "@/components/PlayerBar";
import MiniPlayer from "@/components/MiniPlayer";
import BottomNav from "@/components/BottomNav";
import { getAllCollections } from "@/lib/collections";

// Responsive application chrome shared by every route. PlayerProvider owns the
// single audio instance and lives here (the persistent layout), so playback
// continues as pages navigate underneath it.
//   mobile (<md): scroll area + mini-player + bottom tab bar
//   tablet (md):  icon rail  + scroll area + docked player bar
//   desktop (lg): sidebar    + scroll area + docked player bar
export default async function AppShell({ children }: { children: ReactNode }) {
  const collections = await getAllCollections();
  const libraryLinks = collections.map((c) => ({ slug: c.slug, title: c.title }));

  return (
    <PlayerProvider>
      <div className="flex h-dvh overflow-hidden bg-ink text-text-hi">
        <SideNav collections={libraryLinks} />

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>

          {/* mobile chrome: mini-player stacked over the tab bar */}
          <div className="shrink-0 md:hidden">
            <MiniPlayer />
            <BottomNav />
          </div>

          {/* tablet + desktop chrome: docked player bar */}
          <div className="hidden md:block">
            <PlayerBar />
          </div>
        </div>
      </div>
    </PlayerProvider>
  );
}
