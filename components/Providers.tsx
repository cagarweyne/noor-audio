"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

// Client boundary for next-auth's SessionProvider, so client components
// (e.g. SideNav) can read the session via useSession().
export default function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
