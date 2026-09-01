import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, sanityEnabled } from "@/sanity/env";

export const client = sanityEnabled
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      // Served from Sanity's CDN; freshness comes from tag revalidation below.
      useCdn: true,
      perspective: "published",
    })
  : null;

export const POSTS_TAG = "post";

/** Fetches with a cache tag so the revalidate webhook can bust it. */
export async function sanityFetch<T>(query: string, params: Record<string, unknown> = {}) {
  if (!client) return null;
  return client.fetch<T>(query, params, {
    next: { tags: [POSTS_TAG], revalidate: 3600 },
  });
}
