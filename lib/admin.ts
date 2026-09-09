import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { EMAIL_RE, validateLoginFields } from "./admin-validation";
import { getSettings } from "./settings";

const scryptAsync = promisify(scrypt);

export { EMAIL_RE, validateLoginFields };

export const ADMIN_COOKIE = "spiffing_admin";
export const SESSION_MS = 60 * 60 * 24 * 7 * 1000;

/**
 * `pv` is the password version: a fingerprint of whatever the password is
 * *right now*. Changing the password changes it, which signs every other
 * device out — the cookie is otherwise valid for a week.
 */
export type Session = { email: string; exp: number; pv: string };

export function getAdminCredentials(): { email: string; password: string; secret: string } | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  if (!email || !EMAIL_RE.test(email) || password.length < 8 || secret.length < 16) {
    return null;
  }
  return { email, password, secret };
}

function cookieOptions() {
  const secure =
    process.env.NODE_ENV === "production" && process.env.SESSION_COOKIE_SECURE !== "false";
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure,
    path: "/",
    maxAge: SESSION_MS / 1000,
  };
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function equal(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

export function passwordVersion(passwordHash: string | undefined, envPassword: string): string {
  return createHash("sha256")
    .update(passwordHash ?? `env:${envPassword}`)
    .digest("base64url")
    .slice(0, 16);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPasswordHash(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const creds = getAdminCredentials();
  if (!creds || !equal(email, creds.email)) return false;
  const settings = await getSettings();
  if (settings.passwordHash) return verifyPasswordHash(password, settings.passwordHash);
  return equal(password, creds.password);
}

/**
 * `passwordHash` overrides the stored one: right after a password change the
 * per-request settings cache is stale, so the caller passes the fresh hash.
 */
async function currentPasswordVersion(passwordHash?: string): Promise<string | null> {
  const creds = getAdminCredentials();
  if (!creds) return null;
  const hash = passwordHash ?? (await getSettings()).passwordHash;
  return passwordVersion(hash, creds.password);
}

export function encodeSession(session: Session, secret: string): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

/** Signature and shape only — the caller decides whether the contents are still current. */
export function decodeSession(token: string, secret: string): Session | null {
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!equal(sig, sign(payload, secret))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as Partial<Session>;
    if (typeof data.email !== "string" || typeof data.exp !== "number" || typeof data.pv !== "string") {
      return null;
    }
    return { email: data.email, exp: data.exp, pv: data.pv };
  } catch {
    return null;
  }
}

export async function createSessionToken(
  email: string,
  options: { now?: number; passwordHash?: string } = {},
): Promise<string | null> {
  const creds = getAdminCredentials();
  const pv = await currentPasswordVersion(options.passwordHash);
  if (!creds || !pv) return null;
  return encodeSession({ email, exp: (options.now ?? Date.now()) + SESSION_MS, pv }, creds.secret);
}

export async function readSession(token: string, now = Date.now()): Promise<Session | null> {
  const creds = getAdminCredentials();
  if (!creds) return null;
  const data = decodeSession(token, creds.secret);
  if (!data || data.exp < now || !equal(data.email, creds.email)) return null;
  const pv = await currentPasswordVersion();
  if (!pv || !equal(data.pv, pv)) return null;
  return data;
}

export async function getAdminSession(): Promise<Session | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return readSession(token);
}

export async function setAdminSession(email: string, passwordHash?: string) {
  const token = await createSessionToken(email, { passwordHash });
  if (!token) return;
  (await cookies()).set(ADMIN_COOKIE, token, cookieOptions());
}

export async function clearAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function requireAdmin(): Promise<Session> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** Best-effort client address for the lockout ledger. */
export async function clientAddress(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim();
  return ip || null;
}
