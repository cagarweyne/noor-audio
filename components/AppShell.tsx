import type { ReactNode } from "react";
import SideNav from "@/components/SideNav";
import PlayerBar from "@/components/PlayerBar";
import MiniPlayer from "@/components/MiniPlayer";
import BottomNav from "@/components/BottomNav";

// Responsive application chrome shared by every route.
//   mobile (<md): scroll area + floating mini-player + bottom tab bar
//   tablet (md):  icon rail  + scroll area + docked player bar
//   desktop (lg): sidebar    + scroll area + docked player bar
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden bg-ink text-text-hi">
      <SideNav />

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>

        {/* mobile chrome: mini-player stacked over the tab bar */}
        <div className="shrink-0 md:hidden">
          <div className="px-2 pb-2 pt-1">
            <MiniPlayer />
          </div>
          <BottomNav />
        </div>

        {/* tablet + desktop chrome: docked player bar */}
        <div className="hidden md:block">
          <PlayerBar />
        </div>
      </div>
    </div>
  );
}
