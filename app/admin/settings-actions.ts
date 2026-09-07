"use server";

import { revalidatePath } from "next/cache";
import {
  hashPassword,
  requireAdmin,
  verifyCredentials,
} from "@/lib/admin";
import { validatePasswordChange } from "@/lib/admin-validation";
import { getSettings, saveSettings } from "@/lib/settings";

export type PasswordState = {
  error?: string;
  ok?: string;
  fields?: { current?: string; next?: string; confirm?: string };
};

export type SeedState = { error?: string; ok?: string };

export async function changeAdminPassword(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const session = await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const fields = validatePasswordChange(current, next, confirm);
  if (fields.current || fields.next || fields.confirm) return { fields };

  if (!(await verifyCredentials(session.email, current))) {
    return { fields: { current: "Current password is wrong." } };
  }

  const settings = await getSettings();
  await saveSettings({
    ...settings,
    passwordHash: await hashPassword(next),
  });
  return { ok: "Password updated. Use the new one the next time you sign in." };
}

export async function updateSeedVisibility(
  _prev: SeedState,
  formData: FormData,
): Promise<SeedState> {
  await requireAdmin();
  const settings = await getSettings();
  await saveSettings({
    ...settings,
    showSeed: formData.get("showSeed") === "on",
  });
  revalidatePath("/", "layout");
  revalidatePath("/posts/[id]", "page");
  revalidatePath("/admin", "layout");
  return { ok: "Gallery shelf updated." };
}
