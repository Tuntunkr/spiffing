"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSession,
  clientAddress,
  getAdminCredentials,
  getAdminSession,
  setAdminSession,
  validateLoginFields,
  verifyCredentials,
} from "@/lib/admin";
import { clearFailures, formatWait, lockRemaining, recordFailure } from "@/lib/login-attempts";

export type LoginState = {
  error?: string;
  fields?: { email?: string; password?: string };
  /** Echoed back so the form keeps the address after a failed attempt. */
  email?: string;
};

export async function loginAdmin(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fields = validateLoginFields(email, password);
  if (fields.email || fields.password) return { fields, email };

  if (!getAdminCredentials()) {
    return {
      email,
      error:
        "Desk login is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET.",
    };
  }

  const ip = await clientAddress();
  const wait = await lockRemaining(email, ip);
  if (wait > 0) {
    return { email, error: `Too many attempts. Try again in ${formatWait(wait)}.` };
  }

  if (!(await verifyCredentials(email, password))) {
    await recordFailure(email, ip);
    return { email, error: "Email or password is wrong." };
  }

  await clearFailures(email, ip);
  await setAdminSession(email);
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}
