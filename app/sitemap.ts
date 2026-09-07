import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { galleryHref } from "@/lib/gallery-url";
import { siteUrl } from "@/lib/site";
import { CATEGORIES } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteUrl().origin;
  const posts = await getAllPosts();
  const latest = posts.map((p) => p.publishedAt).sort().at(-1);

  return [
    {
      url: `${origin}/`,
      lastModified: latest ? new Date(latest) : new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...CATEGORIES.map((c) => ({
      url: `${origin}${galleryHref({ category: c })}`,
      lastModified: latest ? new Date(latest) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...posts.map((p) => ({
      url: `${origin}/posts/${p.id}`,
      lastModified: new Date(p.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
