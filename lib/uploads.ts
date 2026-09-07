import { promises as fs } from "node:fs";
import path from "node:path";
import { del, put } from "@vercel/blob";
import { blobEnabled } from "./catalog";

const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/svg+xml", "svg"],
]);
const MAX_BYTES = 8 * 1024 * 1024;

function isBlobUrl(src: string): boolean {
  return src.includes(".blob.vercel-storage.com") || src.includes("blob.vercel-storage.com");
}

export async function saveUpload(file: File, prefix: string): Promise<string> {
  const ext = ALLOWED.get(file.type);
  if (!ext) throw new Error("Use a JPG, PNG, WebP, GIF or SVG.");
  if (file.size > MAX_BYTES) throw new Error("Image must be under 8 MB.");

  const name = `${prefix}-${Date.now()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (blobEnabled) {
    const blob = await put(`uploads/${name}`, bytes, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });
    return blob.url;
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), bytes);
  return `/uploads/${name}`;
}

export async function removeUpload(src: string) {
  if (!src) return;
  if (isBlobUrl(src)) {
    await del(src).catch(() => undefined);
    return;
  }
  if (!src.startsWith("/uploads/")) return;
  const file = path.join(process.cwd(), "public", src);
  await fs.unlink(file).catch(() => undefined);
}
