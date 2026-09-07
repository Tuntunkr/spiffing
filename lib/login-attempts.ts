import { createHash } from "node:crypto";
import { readJson, writeJson } from "./store";

/**
 * Failed sign-in ledger. Kept in the shared store rather than in memory, so a
 * lockout holds across serverless instances and cold starts. Counted per
 * account and per client address: one bad actor cannot lock the admin out
 * from everywhere, and one address cannot spray many emails.
 */

export const MAX_ATTEMPTS = 5;
export const LOCK_MS = 15 * 60 * 1000;
const FILE = "login-attempts.json";
/** Rows older than this are dropped on write so the file never grows. */
const TTL_MS = 24 * 60 * 60 * 1000;

type Row = { count: number; lockedUntil: number; updatedAt: number };
type Ledger = Record<string, Row>;

export function keysFor(email: string, ip: string | null): string[] {
  const keys = [`email:${email.trim().toLowerCase()}`];
  if (ip) keys.push(`ip:${createHash("sha256").update(ip).digest("hex").slice(0, 24)}`);
  return keys;
}

function prune(ledger: Ledger, now: number): Ledger {
  const kept: Ledger = {};
  for (const [key, row] of Object.entries(ledger)) {
    if (row.lockedUntil > now || now - row.updatedAt < TTL_MS) kept[key] = row;
  }
  return kept;
}

async function load(): Promise<Ledger> {
  const raw = await readJson<unknown>(FILE, {});
  return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Ledger) : {};
}

/** Milliseconds the client still has to wait, or 0 when it may try. */
export async function lockRemaining(email: string, ip: string | null, now = Date.now()): Promise<number> {
  const ledger = await load();
  let remaining = 0;
  for (const key of keysFor(email, ip)) {
    const row = ledger[key];
    if (row && row.lockedUntil > now) remaining = Math.max(remaining, row.lockedUntil - now);
  }
  return remaining;
}

export async function recordFailure(email: string, ip: string | null, now = Date.now()): Promise<void> {
  const ledger = prune(await load(), now);
  for (const key of keysFor(email, ip)) {
    const row = ledger[key] ?? { count: 0, lockedUntil: 0, updatedAt: now };
    if (row.lockedUntil > now) continue;
    row.count += 1;
    row.updatedAt = now;
    if (row.count >= MAX_ATTEMPTS) {
      row.lockedUntil = now + LOCK_MS;
      row.count = 0;
    }
    ledger[key] = row;
  }
  await writeJson(FILE, ledger);
}

export async function clearFailures(email: string, ip: string | null, now = Date.now()): Promise<void> {
  const ledger = prune(await load(), now);
  let changed = false;
  for (const key of keysFor(email, ip)) {
    if (key in ledger) {
      delete ledger[key];
      changed = true;
    }
  }
  if (changed) await writeJson(FILE, ledger);
}

export function formatWait(ms: number): string {
  const minutes = Math.max(1, Math.ceil(ms / 60_000));
  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
}
