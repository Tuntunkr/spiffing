import { cache } from "react";
import { sanityFetch } from "./sanity/client";
import { ALL_POSTS_QUERY } from "./sanity/queries";
import { SEED_POSTS } from "./seed";
import { sanityEnabled } from "@/sanity/env";
import { CATEGORIES, type Post, type Sort } from "./types";

/**
 * The single read for the whole gallery. Sanity when it is configured and has
 * content, the shipped seed gallery otherwise — so the site works on a fresh
 * clone and never renders empty because a CMS is unreachable.
 *
 * Wrapped in `cache` so one render pass fetches once, however many components
 * ask for the data.
 */
export const getAllPosts = cache(async (): Promise<Post[]> => {
  if (!sanityEnabled) return SEED_POSTS;

  try {
    const posts = await sanityFetch<Post[]>(ALL_POSTS_QUERY);
    if (posts && posts.length > 0) return posts;
  } catch (error) {
    console.error("[gallery] Sanity fetch failed, serving the seed gallery:", error);
  }
  return SEED_POSTS;
});

export async function getPosts(
  category?: string | null,
  sort: Sort = "Latest",
): Promise<Post[]> {
  const all = await getAllPosts();
  const list =
    category && category !== "All"
      ? all.filter((p) => p.category === category)
      : all;

  return sort === "Featured"
    ? [...list].sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          b.publishedAt.localeCompare(a.publishedAt),
      )
    : [...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getPost(id: string): Promise<Post | undefined> {
  return (await getAllPosts()).find((p) => p.id === id);
}

/** Neighbours within the full gallery, for the detail view's prev/next arrows. */
export async function getNeighbours(id: string) {
  const all = await getPosts();
  const i = all.findIndex((p) => p.id === id);
  return {
    prev: i > 0 ? all[i - 1] : undefined,
    next: i >= 0 && i < all.length - 1 ? all[i + 1] : undefined,
  };
}

/** One pass over the gallery for every chip's count, including "All". */
export async function getCounts(): Promise<Record<string, number>> {
  const all = await getAllPosts();
  const counts: Record<string, number> = { All: all.length };
  for (const c of CATEGORIES) counts[c] = 0;
  for (const p of all) {
    if (p.category in counts) counts[p.category] += 1;
  }
  return counts;
}
