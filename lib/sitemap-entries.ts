import { SHELF_SLUGS } from "./gallery-url";
import { getAllPosts } from "./posts";
import { siteOrigin } from "./site";

export type SitemapRow = {
  url: string;
  lastModified: Date;
  changeFrequency: "weekly" | "monthly";
};

export async function buildSitemapEntries(): Promise<SitemapRow[]> {
  const origin = siteOrigin();
  let posts: Awaited<ReturnType<typeof getAllPosts>> = [];
  try {
    posts = await getAllPosts();
  } catch (error) {
    console.error("[sitemap] catalog read failed; emitting static routes only:", error);
  }

  const latest = posts.map((p) => p.publishedAt).sort().at(-1);
  const latestDate = latest ? new Date(latest) : new Date();

  return [
    { url: `${origin}/`, lastModified: latestDate, changeFrequency: "weekly" },
    { url: `${origin}/what-is`, lastModified: latestDate, changeFrequency: "monthly" },
    { url: `${origin}/how-to-use`, lastModified: latestDate, changeFrequency: "monthly" },
    { url: `${origin}/submit`, lastModified: latestDate, changeFrequency: "monthly" },
    ...SHELF_SLUGS.map((slug) => ({
      url: `${origin}/${slug}`,
      lastModified: latestDate,
      changeFrequency: "weekly" as const,
    })),
    ...posts.map((p) => ({
      url: `${origin}/posts/${p.id}`,
      lastModified: new Date(p.publishedAt),
      changeFrequency: "monthly" as const,
    })),
  ];
}

export function sitemapUrls(rows: SitemapRow[]): string[] {
  return rows.map((row) => row.url);
}
