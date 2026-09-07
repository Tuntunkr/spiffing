import { promises as fs } from "node:fs";
import { contentTypeFor, localUploadPath } from "@/lib/uploads";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ name: string }> };

/**
 * Streams a locally saved upload. Production on Vercel uses Blob URLs instead;
 * this only answers `/uploads/…` for files the desk wrote to DATA_DIR.
 */
export async function GET(_req: Request, { params }: Props) {
  const { name } = await params;
  const file = localUploadPath(name);
  if (!file) return new Response("Not found", { status: 404 });

  try {
    const bytes = await fs.readFile(file);
    return new Response(bytes, {
      headers: {
        "Content-Type": contentTypeFor(name),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
