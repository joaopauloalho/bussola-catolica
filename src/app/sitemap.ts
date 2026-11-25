import type { MetadataRoute } from "next";
import { loadCatalog } from "@/lib/places";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await loadCatalog();
  const root = siteUrl();
  const staticPages: MetadataRoute.Sitemap = ["", "/doar", "/sobre"].map((path) => ({
    url: `${root}${path || "/"}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.6,
  }));
  const parishes: MetadataRoute.Sitemap = catalog.places.map((place) => ({
    url: `${root}/paroquia/${place.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  return [...staticPages, ...parishes];
}
