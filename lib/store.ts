import { promises as fs } from "node:fs";
import path from "node:path";
import { del, get, head, put } from "@vercel/blob";

/**
 * One small JSON document store for the desk: the catalog, the settings and
 * the login-attempt ledger. Locally it is a folder of files; on Vercel it is
 * private blobs, so nothing (in particular the password hash) is reachable by
 * URL.
 *
 * `DATA_DIR` lets tests point the local store at a temp folder.
 */

export const blobEnabled = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const PRIVATE_PREFIX = "desk/";
/** Where the first version of the desk kept its public JSON. Migrated on first read. */
const LEGACY_PREFIX = "catalog/";

function dataDir(): string {
  return process.env.DATA_DIR ?? path.join(process.cwd(), "data");
}

/** Runtime-only path; the ignore comment stops the bundler tracing the whole tree. */
function dataFile(name: string): string {
  return path.join(/* turbopackIgnore: true */ dataDir(), name);
}

function parse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function readLocal<T>(name: string, fallback: T): Promise<T> {
  try {
    return parse(await fs.readFile(dataFile(name), "utf8"), fallback);
  } catch {
    return fallback;
  }
}

async function writeLocal(name: string, value: unknown): Promise<void> {
  await fs.mkdir(dataDir(), { recursive: true });
  const file = dataFile(name);
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await fs.rename(tmp, file);
}

async function readLegacyBlob(name: string): Promise<string | null> {
  try {
    const meta = await head(`${LEGACY_PREFIX}${name}`);
    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) return null;
    const text = await res.text();
    await del(meta.url).catch(() => undefined);
    return text;
  } catch {
    return null;
  }
}

async function readBlob<T>(name: string, fallback: T): Promise<T> {
  try {
    const result = await get(`${PRIVATE_PREFIX}${name}`, { access: "private", useCache: false });
    if (result?.stream) {
      return parse(await new Response(result.stream).text(), fallback);
    }
  } catch {
    // Missing or unreadable: fall through to the legacy location.
  }

  const legacy = await readLegacyBlob(name);
  if (legacy === null) return fallback;
  const value = parse(legacy, fallback);
  await writeBlob(name, value).catch(() => undefined);
  return value;
}

async function writeBlob(name: string, value: unknown): Promise<void> {
  await put(`${PRIVATE_PREFIX}${name}`, JSON.stringify(value), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

export async function readJson<T>(name: string, fallback: T): Promise<T> {
  return blobEnabled ? readBlob(name, fallback) : readLocal(name, fallback);
}

export async function writeJson(name: string, value: unknown): Promise<void> {
  if (blobEnabled) {
    await writeBlob(name, value);
    return;
  }
  await writeLocal(name, value);
}
