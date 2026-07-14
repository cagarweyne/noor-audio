import Library from "@/components/screens/Library";
import { getAllCollections } from "@/lib/collections";

// Collections are fetched from R2. `getAllCollections` prefers a root
// collections.json index and falls back to the hardcoded COLLECTION_SLUGS.
export default async function LibraryPage() {
  const collections = await getAllCollections();
  return <Library collections={collections} />;
}
