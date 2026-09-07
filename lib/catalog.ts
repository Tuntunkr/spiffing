import { promises as fs } from "node:fs";
import path from "node:path";
import { head, put } from "@vercel/blob";
import type { Post } from "./types";

const CATALOG_PATH = path.join(process.cwd(), "data", "catalog.json");
const CATALOG_BLOB = "catalog/catalog.json";

export const blobEnabled = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

async function readLocalCatalog(): Promise<Post[]> {
  try {
    const raw = await fs.readFile(CATALOG_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Post[]) : [];
  } catch {
    return [];
  }
}

async function writeLocalCatalog(posts: Post[]): Promise<void> {
  await fs.mkdir(path.dirname(CATALOG_PATH), { recursive: true });
  await fs.writeFile(CATALOG_PATH, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
}

async function readBlobCatalog(): Promise<Post[]> {
  try {
    const meta = await head(CATALOG_BLOB);
    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) return [];
    const parsed = (await res.json()) as unknown;
    return Array.isArray(parsed) ? (parsed as Post[]) : [];
  } catch {
    return [];
  }
}

async function writeBlobCatalog(posts: Post[]): Promise<void> {
  await put(CATALOG_BLOB, JSON.stringify(posts), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

export async function getCatalogPosts(): Promise<Post[]> {
  return blobEnabled ? readBlobCatalog() : readLocalCatalog();
}

export async function getCatalogPost(id: string): Promise<Post | undefined> {
  return (await getCatalogPosts()).find((p) => p.id === id);
}

export async function saveCatalogPosts(posts: Post[]): Promise<void> {
  if (blobEnabled) {
    await writeBlobCatalog(posts);
    return;
  }
  await writeLocalCatalog(posts);
}

export function mergePosts(uploaded: Post[], rest: Post[]): Post[] {
  const ids = new Set(uploaded.map((p) => p.id));
  return [...uploaded, ...rest.filter((p) => !ids.has(p.id))];
}
