import { promises as fs } from "node:fs";
import path from "node:path";
import { head, put } from "@vercel/blob";
import { blobEnabled } from "./catalog";

export type AdminSettings = {
  showSeed: boolean;
  passwordHash?: string;
};

const SETTINGS_PATH = path.join(process.cwd(), "data", "settings.json");
const SETTINGS_BLOB = "catalog/settings.json";

export const DEFAULT_SETTINGS: AdminSettings = { showSeed: false };

function parseSettings(raw: unknown): AdminSettings {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SETTINGS };
  const data = raw as Partial<AdminSettings>;
  return {
    showSeed: data.showSeed === true,
    passwordHash: typeof data.passwordHash === "string" ? data.passwordHash : undefined,
  };
}

async function readLocal(): Promise<AdminSettings> {
  try {
    const raw = JSON.parse(await fs.readFile(SETTINGS_PATH, "utf8")) as unknown;
    return parseSettings(raw);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

async function writeLocal(settings: AdminSettings): Promise<void> {
  await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
  await fs.writeFile(SETTINGS_PATH, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
}

async function readBlob(): Promise<AdminSettings> {
  try {
    const meta = await head(SETTINGS_BLOB);
    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) return { ...DEFAULT_SETTINGS };
    return parseSettings(await res.json());
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

async function writeBlob(settings: AdminSettings): Promise<void> {
  await put(SETTINGS_BLOB, JSON.stringify(settings), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

export async function getSettings(): Promise<AdminSettings> {
  return blobEnabled ? readBlob() : readLocal();
}

export async function saveSettings(settings: AdminSettings): Promise<void> {
  if (blobEnabled) {
    await writeBlob(settings);
    return;
  }
  await writeLocal(settings);
}
