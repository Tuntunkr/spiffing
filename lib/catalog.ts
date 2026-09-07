import { readJson, writeJson } from "./store";
import { CATEGORIES, type Post } from "./types";

export { blobEnabled } from "./store";

const CATALOG_FILE = "catalog.json";

function isPost(value: unknown): value is Post {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<Post>;
  return (
    typeof p.id === "string" &&
    typeof p.title === "string" &&
    typeof p.description === "string" &&
    (CATEGORIES as readonly string[]).includes(p.category ?? "") &&
    typeof p.creator?.handle === "string" &&
    typeof p.creator?.avatar === "string" &&
    typeof p.media?.src === "string" &&
    typeof p.media?.width === "number" &&
    typeof p.media?.height === "number" &&
    typeof p.publishedAt === "string"
  );
}

/** Drops anything malformed so one bad row cannot take the gallery down. */
export function parseCatalog(raw: unknown): Post[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isPost).map((p) => ({
    ...p,
    slides: typeof p.slides === "number" && p.slides > 0 ? Math.floor(p.slides) : 1,
    sourceUrl: typeof p.sourceUrl === "string" ? p.sourceUrl : "",
    featured: p.featured === true,
  }));
}

export async function getCatalogPosts(): Promise<Post[]> {
  return parseCatalog(await readJson<unknown>(CATALOG_FILE, []));
}

export async function getCatalogPost(id: string): Promise<Post | undefined> {
  return (await getCatalogPosts()).find((p) => p.id === id);
}

export async function saveCatalogPosts(posts: Post[]): Promise<void> {
  await writeJson(CATALOG_FILE, posts);
}

export function mergePosts(uploaded: Post[], rest: Post[]): Post[] {
  const ids = new Set(uploaded.map((p) => p.id));
  return [...uploaded, ...rest.filter((p) => !ids.has(p.id))];
}
