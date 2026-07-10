import { Home, Compass, Library, User, type LucideIcon } from "lucide-react";

export type NavItem = {
  key: string;
  label: string;
  href: string;
  Icon: LucideIcon;
};

// Primary destinations — shared by BottomNav (mobile) and SideNav (tablet/desktop).
export const NAV_ITEMS: NavItem[] = [
  { key: "home", label: "Home", href: "/", Icon: Home },
  { key: "explore", label: "Explore", href: "/explore", Icon: Compass },
  { key: "library", label: "Library", href: "/library", Icon: Library },
  { key: "profile", label: "You", href: "/you", Icon: User },
];

// Highlight the current tab. "/" only matches exactly; others match their subtree.
export function navIsActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
