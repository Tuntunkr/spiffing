import { cache } from "react";
import { readJson, writeJson } from "./store";

export type AdminSettings = {
  showSeed: boolean;
  passwordHash?: string;
};

const SETTINGS_FILE = "settings.json";

export const DEFAULT_SETTINGS: AdminSettings = { showSeed: true };

export function parseSettings(raw: unknown): AdminSettings {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SETTINGS };
  const data = raw as Partial<AdminSettings>;
  return {
    showSeed: typeof data.showSeed === "boolean" ? data.showSeed : DEFAULT_SETTINGS.showSeed,
    passwordHash: typeof data.passwordHash === "string" ? data.passwordHash : undefined,
  };
}

/** Deduped per render pass: the session check and the gallery both ask for this. */
export const getSettings = cache(async (): Promise<AdminSettings> => {
  return parseSettings(await readJson<unknown>(SETTINGS_FILE, DEFAULT_SETTINGS));
});

export async function saveSettings(settings: AdminSettings): Promise<void> {
  await writeJson(SETTINGS_FILE, settings);
}
