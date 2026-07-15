import Home from "@/components/screens/Home";

// Rendered at request time (data comes from R2, not baked at build).
export const dynamic = "force-dynamic";

// The `/` route. Responsive chrome (nav + player) is provided by AppShell in
// the root layout, so the page only renders the Home screen's content.
export default function Page() {
  return <Home />;
}
