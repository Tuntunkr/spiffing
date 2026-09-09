"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { getCatalogPosts, saveCatalogPosts } from "@/lib/catalog";
import { uniqueId } from "@/lib/piece";
import {
  getSubmission,
  getSubmissions,
  postFromSubmission,
  saveSubmissions,
  takenPieceIds,
} from "@/lib/submissions";
import { removeUpload } from "@/lib/uploads";

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function refresh(id?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/posts/[id]", "page");
  revalidatePath("/admin", "layout");
  if (id) revalidatePath(`/posts/${id}`);
}

export async function approveSubmission(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readText(formData, "id");
  const existing = await getSubmission(id);
  if (!existing) redirect("/admin/submissions");
  if (existing.status !== "pending") redirect("/admin/submissions");

  const taken = await takenPieceIds();
  taken.delete(existing.id);
  const pieceId = uniqueId(existing.title, taken);
  const publishedAt = new Date().toISOString();
  const piece = postFromSubmission(existing, pieceId, publishedAt);

  const catalog = await getCatalogPosts();
  await saveCatalogPosts([piece, ...catalog]);

  const rows = await getSubmissions();
  await saveSubmissions(
    rows.map((row) =>
      row.id === id
        ? { ...row, status: "approved" as const, reviewedAt: publishedAt, pieceId, rejectReason: "" }
        : row,
    ),
  );

  refresh(pieceId);
  redirect(`/admin/submissions?approved=${encodeURIComponent(pieceId)}`);
}

export async function rejectSubmission(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readText(formData, "id");
  const reason = readText(formData, "reason").slice(0, 300);
  const existing = await getSubmission(id);
  if (!existing) redirect("/admin/submissions");
  if (existing.status !== "pending") redirect("/admin/submissions");

  const rows = await getSubmissions();
  await saveSubmissions(
    rows.map((row) =>
      row.id === id
        ? {
            ...row,
            status: "rejected" as const,
            reviewedAt: new Date().toISOString(),
            rejectReason: reason,
            media: { ...row.media, src: "" },
            creator: { ...row.creator, avatar: "/creators/creator-1.svg" },
          }
        : row,
    ),
  );

  await removeUpload(existing.media.src);
  await removeUpload(existing.creator.avatar);

  revalidatePath("/admin", "layout");
  redirect("/admin/submissions?rejected=1");
}
