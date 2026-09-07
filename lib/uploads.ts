import { promises as fs } from "node:fs";
import path from "node:path";
import { del, put } from "@vercel/blob";
import { imageSize } from "image-size";
import { blobEnabled } from "./store";
import { ALLOWED_TYPES, MAX_BYTES, SIZE_ERROR, TYPE_ERROR } from "./upload-rules";

export { ACCEPT, ALLOWED_TYPES, MAX_BYTES } from "./upload-rules";

const UPLOAD_PREFIX = "uploads/";
const NAME_RE = /^[a-z0-9][a-z0-9._-]*\.(jpg|png|webp|gif)$/i;
const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export type SavedUpload = { src: string; width: number; height: number };

/** Next.js 16 only serves `public/` files that existed at build, so local
 * uploads live under DATA_DIR and are streamed by `app/uploads/[name]`. */
function localUploadDir(): string {
  return path.join(process.env.DATA_DIR ?? path.join(process.cwd(), "data"), "uploads");
}

export function localUploadPath(name: string): string | null {
  if (!NAME_RE.test(name)) return null;
  return path.join(/* turbopackIgnore: true */ localUploadDir(), name);
}

export function contentTypeFor(name: string): string {
  return TYPES[path.extname(name).slice(1).toLowerCase()] ?? "application/octet-stream";
}

/**
 * Reads the dimensions from the file's own header rather than trusting the
 * browser, and rejects anything that is not actually an image of the declared
 * type. Throws a user-facing message on any problem.
 */
export function inspectImage(bytes: Buffer, declaredType: string): { ext: string; width: number; height: number } {
  const ext = ALLOWED_TYPES.get(declaredType);
  if (!ext) throw new Error(TYPE_ERROR);
  if (bytes.byteLength === 0) throw new Error("The file is empty.");
  if (bytes.byteLength > MAX_BYTES) throw new Error(SIZE_ERROR);

  let info: { width?: number; height?: number; type?: string };
  try {
    info = imageSize(bytes);
  } catch {
    throw new Error("That file is not a readable image.");
  }
  if (info.type !== ext) throw new Error(`The file is not a ${ext.toUpperCase()}.`);
  if (!info.width || !info.height) throw new Error("Could not read the image size.");
  return { ext, width: info.width, height: info.height };
}

function isOwnBlobUrl(src: string): boolean {
  try {
    const url = new URL(src);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".blob.vercel-storage.com") &&
      url.pathname.startsWith(`/${UPLOAD_PREFIX}`)
    );
  } catch {
    return false;
  }
}

export async function saveUpload(file: File, prefix: string): Promise<SavedUpload> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const { ext, width, height } = inspectImage(bytes, file.type);
  const name = `${prefix}-${Date.now()}.${ext}`;

  if (blobEnabled) {
    const blob = await put(`${UPLOAD_PREFIX}${name}`, bytes, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });
    return { src: blob.url, width, height };
  }

  const dir = localUploadDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), bytes);
  return { src: `/uploads/${name}`, width, height };
}

/** Only touches files this desk wrote; seed art and foreign URLs are ignored. */
export async function removeUpload(src: string) {
  if (!src) return;
  if (isOwnBlobUrl(src)) {
    await del(src).catch(() => undefined);
    return;
  }
  if (!src.startsWith("/uploads/")) return;
  const file = localUploadPath(src.slice("/uploads/".length));
  if (!file) return;
  await fs.unlink(file).catch(() => undefined);
}
