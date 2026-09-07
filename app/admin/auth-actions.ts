"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSession,
  clearLoginFailures,
  getAdminCredentials,
  getAdminSession,
  loginLocked,
  recordLoginFailure,
  setAdminSession,
  validateLoginFields,
  verifyCredentials,
} from "@/lib/admin";

export type LoginState = {
  error?: string;
  fields?: { email?: string; password?: string };
};

export async function loginAdmin(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fields = validateLoginFields(email, password);
  if (fields.email || fields.password) return { fields };

  if (!getAdminCredentials()) {
    return {
      error:
        "Desk login is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET.",
    };
  }

  if (loginLocked(email)) {
    return { error: "Too many attempts. Try again in 15 minutes." };
  }

  if (!(await verifyCredentials(email, password))) {
    recordLoginFailure(email);
    return { error: "Email or password is wrong." };
  }

  clearLoginFailures(email);
  await setAdminSession(email);
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}
