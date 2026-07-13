import Library from "@/components/screens/Library";
import { COLLECTIONS } from "@/components/catalog";

// Collections are hardcoded for now. Later this becomes an async Server
// Component that fetches them from the DB — only this line changes:
//   const collections = await getCollections();
export default function LibraryPage() {
  return <Library collections={COLLECTIONS} />;
}
