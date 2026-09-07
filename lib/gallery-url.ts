import { CATEGORIES, SORTS, type Sort } from "./types";

export type GalleryQuery = { category: string; sort: Sort; q: string };

export const MAX_QUERY = 80;

/** Validates raw search params into the three things the gallery understands. */
export function parseGalleryQuery(sp: Record<string, string | string[] | undefined>): GalleryQuery {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const rawCategory = one(sp.category);
  const rawSort = one(sp.sort);
  return {
    category: (CATEGORIES as readonly string[]).includes(rawCategory) ? rawCategory : "All",
    sort: (SORTS as readonly string[]).includes(rawSort) ? (rawSort as Sort) : "Latest",
    q: one(sp.q).trim().slice(0, MAX_QUERY),
  };
}

/** Builds a gallery link, leaving defaults out so canonical URLs stay short. */
export function galleryHref(query: Partial<GalleryQuery>): string {
  const params = new URLSearchParams();
  if (query.category && query.category !== "All") params.set("category", query.category);
  if (query.sort && query.sort !== "Latest") params.set("sort", query.sort);
  if (query.q?.trim()) params.set("q", query.q.trim());
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}
