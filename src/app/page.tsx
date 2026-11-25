import { Explorer } from "@/components/Explorer";
import { loadCatalog } from "@/lib/places";

export const revalidate = 3600;

export default async function HomePage() {
  const catalog = await loadCatalog();
  return (
    <Explorer
      places={catalog.places}
      center={catalog.center}
      generatedAt={new Date().toISOString()}
      source={catalog.source}
    />
  );
}
