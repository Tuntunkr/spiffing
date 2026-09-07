"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { getCatalogPost, getCatalogPosts, saveCatalogPosts } from "@/lib/catalog";
import { removeUpload, saveUpload } from "@/lib/uploads";
import { CATEGORIES, type Category, type Post } from "@/lib/types";

export type ActionState = { error?: string };

const DEFAULT_AVATAR = "/creators/creator-1.svg";

function refreshGallery(id?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/posts/[id]", "page");
  revalidatePath("/admin", "layout");
  if (id) revalidatePath(`/posts/${id}`);
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72) || "piece"
  );
}

function uniqueId(title: string, taken: Set<string>): string {
  const base = slugify(title);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readInt(formData: FormData, key: string, fallback: number): number {
  const n = Number.parseInt(readText(formData, key), 10);
  return Number.isFinite(n) ? n : fallback;
}

function parseCategory(value: string): Category | null {
  return (CATEGORIES as readonly string[]).includes(value) ? (value as Category) : null;
}

function pieceFromForm(
  formData: FormData,
  id: string,
  media: Post["media"],
  avatar: string,
  publishedAt: string,
): { piece: Post } | ActionState {
  const title = readText(formData, "title");
  const description = readText(formData, "description");
  const category = parseCategory(readText(formData, "category"));
  const handle = readText(formData, "handle").replace(/^@/, "");
  const sourceUrl = readText(formData, "sourceUrl") || "https://example.com/";
  const slides = Math.max(1, readInt(formData, "slides", 1));
  const featured = formData.get("featured") === "on";

  if (!title) return { error: "Title is required." };
  if (!description) return { error: "Description is required." };
  if (description.length > 300) return { error: "Description must be 300 characters or fewer." };
  if (!category) return { error: "Pick a category the gallery already understands." };
  if (!handle) return { error: "Designer handle is required." };

  return {
    piece: {
      id,
      title,
      description,
      category,
      creator: { handle, avatar },
      media,
      slides,
      sourceUrl,
      featured,
      publishedAt,
    },
  };
}

export async function createPiece(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const artwork = formData.get("artwork");
  if (!(artwork instanceof File) || artwork.size === 0) {
    return { error: "Upload the artwork so the card can size itself." };
  }

  const catalog = await getCatalogPosts();
  const id = uniqueId(readText(formData, "title"), new Set(catalog.map((p) => p.id)));

  let src: string;
  try {
    src = await saveUpload(artwork, id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save the artwork." };
  }

  const width = Math.max(1, readInt(formData, "width", 1600));
  const height = Math.max(1, readInt(formData, "height", 1200));

  let avatar = DEFAULT_AVATAR;
  const avatarFile = formData.get("avatar");
  if (avatarFile instanceof File && avatarFile.size > 0) {
    try {
      avatar = await saveUpload(avatarFile, `${id}-avatar`);
    } catch (error) {
      await removeUpload(src);
      return { error: error instanceof Error ? error.message : "Could not save the avatar." };
    }
  }

  const result = pieceFromForm(formData, id, { src, width, height }, avatar, new Date().toISOString());
  if (!("piece" in result)) {
    await removeUpload(src);
    if (avatar !== DEFAULT_AVATAR) await removeUpload(avatar);
    return result;
  }

  await saveCatalogPosts([result.piece, ...catalog]);
  refreshGallery(id);
  redirect("/admin");
}

export async function updatePiece(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = readText(formData, "id");
  const existing = await getCatalogPost(id);
  if (!existing) return { error: "That piece is not in the admin catalog." };

  let media = existing.media;
  const artwork = formData.get("artwork");
  if (artwork instanceof File && artwork.size > 0) {
    try {
      const src = await saveUpload(artwork, id);
      await removeUpload(existing.media.src);
      media = {
        src,
        width: Math.max(1, readInt(formData, "width", existing.media.width)),
        height: Math.max(1, readInt(formData, "height", existing.media.height)),
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Could not save the artwork." };
    }
  }

  let avatar = existing.creator.avatar;
  const avatarFile = formData.get("avatar");
  if (avatarFile instanceof File && avatarFile.size > 0) {
    try {
      const next = await saveUpload(avatarFile, `${id}-avatar`);
      await removeUpload(existing.creator.avatar);
      avatar = next;
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Could not save the avatar." };
    }
  }

  const result = pieceFromForm(formData, id, media, avatar, existing.publishedAt);
  if (!("piece" in result)) return result;

  const catalog = await getCatalogPosts();
  await saveCatalogPosts(catalog.map((p) => (p.id === id ? result.piece : p)));
  refreshGallery(id);
  redirect("/admin");
}

export async function deletePiece(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readText(formData, "id");
  const existing = await getCatalogPost(id);
  if (!existing) return;

  await removeUpload(existing.media.src);
  await removeUpload(existing.creator.avatar);
  const catalog = await getCatalogPosts();
  await saveCatalogPosts(catalog.filter((p) => p.id !== id));
  refreshGallery(id);
  redirect("/admin");
}
