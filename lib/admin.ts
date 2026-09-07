import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { EMAIL_RE, validateLoginFields } from "./admin-validation";
import { getSettings } from "./settings";

const scryptAsync = promisify(scrypt);

export { EMAIL_RE, validateLoginFields };

export const ADMIN_COOKIE = "vitrine_admin";
const SESSION_MS = 60 * 60 * 24 * 7 * 1000;
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

type Session = { email: string; exp: number };

const attempts = new Map<string, { count: number; lockedUntil: number }>();

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

function equal(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

export function loginLocked(email: string): boolean {
  const row = attempts.get(email);
  return Boolean(row && row.lockedUntil > Date.now());
}

export function recordLoginFailure(email: string) {
  const row = attempts.get(email) ?? { count: 0, lockedUntil: 0 };
  if (row.lockedUntil > Date.now()) return;
  row.count += 1;
  if (row.count >= MAX_ATTEMPTS) {
    row.lockedUntil = Date.now() + LOCK_MS;
    row.count = 0;
  }
  attempts.set(email, row);
}

export function clearLoginFailures(email: string) {
  attempts.delete(email);
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

export function createSessionToken(email: string): string | null {
  const creds = getAdminCredentials();
  if (!creds) return null;
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + SESSION_MS })).toString(
    "base64url",
  );
  return `${payload}.${sign(payload, creds.secret)}`;
}

function readSession(token: string): Session | null {
  const creds = getAdminCredentials();
  if (!creds) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(payload, creds.secret);
  if (!equal(sig, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    if (!data.email || data.exp < Date.now() || !equal(data.email, creds.email)) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<Session | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return readSession(token);
}

export async function setAdminSession(email: string) {
  const token = createSessionToken(email);
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
