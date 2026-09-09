"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { getCatalogPost, getCatalogPosts, saveCatalogPosts } from "@/lib/catalog";
import { pieceFromFields, uniqueId, type PieceErrors, type PieceFields } from "@/lib/piece";
import { removeUpload, saveUpload } from "@/lib/uploads";
import type { Post } from "@/lib/types";

export type ActionState = { error?: string; fields?: PieceErrors };

const DEFAULT_AVATAR = "/creators/creator-1.svg";

function refreshGallery(id?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/posts/[id]", "page");
  revalidatePath("/admin", "layout");
  if (id) revalidatePath(`/posts/${id}`);
}

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readFields(formData: FormData): PieceFields {
  return {
    title: readText(formData, "title"),
    description: readText(formData, "description"),
    concept: readText(formData, "concept"),
    category: readText(formData, "category"),
    handle: readText(formData, "handle"),
    sourceUrl: readText(formData, "sourceUrl"),
    slides: readText(formData, "slides"),
    featured: formData.get("featured") === "on",
  };
}

function fileOrNull(formData: FormData, key: string): File | null {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function message(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export async function createPiece(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const fields = readFields(formData);
  const artwork = fileOrNull(formData, "artwork");
  const avatarFile = fileOrNull(formData, "avatar");

  // Validate text before touching storage so a typo does not leave orphan files.
  const parsed = pieceFromFields(fields);
  if (!parsed.ok) {
    return { fields: artwork ? parsed.fields : { ...parsed.fields, artwork: "Upload the artwork." } };
  }
  if (!artwork) return { fields: { artwork: "Upload the artwork so the card can size itself." } };

  const catalog = await getCatalogPosts();
  const id = uniqueId(fields.title, new Set(catalog.map((p) => p.id)));

  let media: Post["media"];
  try {
    media = await saveUpload(artwork, id);
  } catch (error) {
    return { fields: { artwork: message(error, "Could not save the artwork.") } };
  }

  let avatar = DEFAULT_AVATAR;
  if (avatarFile) {
    try {
      avatar = (await saveUpload(avatarFile, `${id}-avatar`)).src;
    } catch (error) {
      await removeUpload(media.src);
      return { fields: { avatar: message(error, "Could not save the avatar.") } };
    }
  }

  const piece: Post = {
    id,
    ...parsed.value,
    creator: { handle: parsed.value.handle, avatar },
    media,
    publishedAt: new Date().toISOString(),
  };

  try {
    await saveCatalogPosts([piece, ...catalog]);
  } catch (error) {
    await removeUpload(media.src);
    if (avatar !== DEFAULT_AVATAR) await removeUpload(avatar);
    return { error: message(error, "Could not write the catalog.") };
  }

  refreshGallery(id);
  redirect(`/admin?published=${encodeURIComponent(id)}`);
}

export async function updatePiece(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = readText(formData, "id");
  const existing = await getCatalogPost(id);
  if (!existing) return { error: "That piece is not in the admin catalog." };

  const parsed = pieceFromFields(readFields(formData));
  if (!parsed.ok) return { fields: parsed.fields };

  let media = existing.media;
  const artwork = fileOrNull(formData, "artwork");
  if (artwork) {
    try {
      media = await saveUpload(artwork, id);
    } catch (error) {
      return { fields: { artwork: message(error, "Could not save the artwork.") } };
    }
  }

  let avatar = existing.creator.avatar;
  const avatarFile = fileOrNull(formData, "avatar");
  if (avatarFile) {
    try {
      avatar = (await saveUpload(avatarFile, `${id}-avatar`)).src;
    } catch (error) {
      if (media.src !== existing.media.src) await removeUpload(media.src);
      return { fields: { avatar: message(error, "Could not save the avatar.") } };
    }
  }

  const piece: Post = {
    id,
    ...parsed.value,
    creator: { handle: parsed.value.handle, avatar },
    media,
    publishedAt: existing.publishedAt,
  };

  const catalog = await getCatalogPosts();
  await saveCatalogPosts(catalog.map((p) => (p.id === id ? piece : p)));

  // Old files go only after the catalog points at the new ones.
  if (media.src !== existing.media.src) await removeUpload(existing.media.src);
  if (avatar !== existing.creator.avatar) await removeUpload(existing.creator.avatar);

  refreshGallery(id);
  redirect(`/admin?updated=${encodeURIComponent(id)}`);
}

export async function deletePiece(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readText(formData, "id");
  const existing = await getCatalogPost(id);
  if (!existing) redirect("/admin");

  const catalog = await getCatalogPosts();
  await saveCatalogPosts(catalog.filter((p) => p.id !== id));
  await removeUpload(existing.media.src);
  await removeUpload(existing.creator.avatar);
  refreshGallery(id);
  redirect("/admin?removed=1");
}
