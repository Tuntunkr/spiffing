"use server";

import { revalidatePath } from "next/cache";
import { hashPassword, requireAdmin, setAdminSession, verifyCredentials } from "@/lib/admin";
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
  const passwordHash = await hashPassword(next);
  await saveSettings({ ...settings, passwordHash });
  // Every other device is signed out by the version bump; keep this one in.
  await setAdminSession(session.email, passwordHash);
  return { ok: "Password updated. Other signed-in devices have been signed out." };
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
