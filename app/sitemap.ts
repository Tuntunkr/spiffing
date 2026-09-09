import type { MetadataRoute } from "next";
import { buildSitemapEntries } from "@/lib/sitemap-entries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rows = await buildSitemapEntries();
  return rows.map((row) => ({
    url: row.url,
    lastModified: row.lastModified,
    changeFrequency: row.changeFrequency,
  }));
}
