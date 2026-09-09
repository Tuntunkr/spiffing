import { CATEGORIES, SORTS, type Category, type Sort } from "./types";

export type GalleryQuery = { category: string; sort: Sort; q: string };

export const MAX_QUERY = 80;

export const FEATURED_SLUG = "featured";

export const CATEGORY_SLUG: Record<Category, string> = {
  Web: "web",
  Branding: "branding",
  Product: "product",
  Motion: "motion",
  Illustration: "illustration",
  "3D": "3d",
  Print: "print",
};

export const SLUG_CATEGORY = Object.fromEntries(
  (Object.entries(CATEGORY_SLUG) as [Category, string][]).map(([category, slug]) => [slug, category]),
) as Record<string, Category>;

export const SHELF_SLUGS = [...Object.values(CATEGORY_SLUG), FEATURED_SLUG] as const;

export type ShelfSlug = (typeof SHELF_SLUGS)[number];

export function isShelfSlug(value: string): value is ShelfSlug {
  return (SHELF_SLUGS as readonly string[]).includes(value);
}

export function categorySlug(category: string): string | null {
  if ((CATEGORIES as readonly string[]).includes(category)) {
    return CATEGORY_SLUG[category as Category];
  }
  return null;
}

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

export type Shelf = { slug: ShelfSlug; category: string; sort: Sort };

export function parseShelf(slug: string): Shelf | null {
  if (slug === FEATURED_SLUG) {
    return { slug: FEATURED_SLUG, category: "All", sort: "Featured" };
  }
  const category = SLUG_CATEGORY[slug];
  if (!category) return null;
  return { slug: slug as ShelfSlug, category, sort: "Latest" };
}

/** Path for a shelf, without search or sort query extras. */
export function shelfPath(category = "All", sort: Sort = "Latest"): string {
  if (sort === "Featured" && (!category || category === "All")) return `/${FEATURED_SLUG}`;
  const slug = categorySlug(category ?? "All");
  return slug ? `/${slug}` : "/";
}

/**
 * Builds a gallery link. Categories and the featured shelf are real paths.
 * Search and in-category featured sort stay on the query string.
 */
export function galleryHref(query: Partial<GalleryQuery> = {}): string {
  const category = query.category && query.category !== "All" ? query.category : "All";
  const sort = query.sort ?? "Latest";
  const path = shelfPath(category, sort);
  const params = new URLSearchParams();
  if (sort === "Featured" && category !== "All") params.set("sort", "Featured");
  if (query.q?.trim()) params.set("q", query.q.trim());
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

/** Parse a gallery href back into a query (paths + search params). */
export function parseGalleryHref(href: string): GalleryQuery {
  const url = new URL(href, "http://spiffing.local");
  const slug = url.pathname.replace(/^\//, "").replace(/\/$/, "");
  const fromPath = slug ? parseShelf(slug) : null;
  const fromQuery = parseGalleryQuery(Object.fromEntries(url.searchParams));
  return {
    category: fromQuery.category !== "All" ? fromQuery.category : fromPath?.category && fromPath.category !== "All" ? fromPath.category : "All",
    sort: fromQuery.sort === "Featured" || fromPath?.sort === "Featured" ? "Featured" : "Latest",
    q: fromQuery.q,
  };
}

export function queryStringFromRecord(sp: Record<string, string | string[] | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    const one = Array.isArray(value) ? value[0] : value;
    if (one) params.set(key, one);
  }
  return params.toString();
}

export function isIndexableGallery(query: GalleryQuery): boolean {
  return query.q.length === 0 && query.sort === "Latest" && query.category === "All";
}

/** Canonical gallery path (+ search) for a request. */
export function destinationGalleryHref(pathname: string, search = ""): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const qs = search.startsWith("?") ? search : search ? `?${search}` : "";
  return galleryHref(parseGalleryHref(`${path}${qs}`));
}

/**
 * Permanent redirect target when the request is a legacy or leftover gallery URL.
 * Returns null when the URL is already canonical (including search / in-shelf featured).
 */
export function galleryRedirectTarget(pathname: string, search = ""): string | null {
  const dest = destinationGalleryHref(pathname, search);
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const qs = search.startsWith("?") ? search : search ? `?${search}` : "";
  const current = `${path}${qs}`;
  return dest === current ? null : dest;
}

export function isIndexableShelf(query: GalleryQuery): boolean {
  if (query.q.length > 0) return false;
  if (query.category !== "All" && query.sort === "Featured") return false;
  if (query.category === "All") return query.sort === "Latest" || query.sort === "Featured";
  return query.sort === "Latest";
}
