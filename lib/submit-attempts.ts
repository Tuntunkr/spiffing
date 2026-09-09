import { createHash } from "node:crypto";
import { readJson, writeJson } from "./store";

/**
 * Caps public submissions per email and per client address so one person
 * cannot flood the inbox. Counted in a rolling hour, stored like the login
 * lockout ledger so it survives serverless cold starts.
 */

export const MAX_SUBMISSIONS = 5;
export const WINDOW_MS = 60 * 60 * 1000;
const FILE = "submit-attempts.json";
const TTL_MS = 24 * 60 * 60 * 1000;

type Row = { count: number; windowStart: number; updatedAt: number };
type Ledger = Record<string, Row>;

export function keysFor(email: string, ip: string | null): string[] {
  const keys = [`email:${email.trim().toLowerCase()}`];
  if (ip) keys.push(`ip:${createHash("sha256").update(ip).digest("hex").slice(0, 24)}`);
  return keys;
}

function prune(ledger: Ledger, now: number): Ledger {
  const kept: Ledger = {};
  for (const [key, row] of Object.entries(ledger)) {
    if (now - row.updatedAt < TTL_MS) kept[key] = row;
  }
  return kept;
}

async function load(): Promise<Ledger> {
  const raw = await readJson<unknown>(FILE, {});
  return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Ledger) : {};
}

function remainingInWindow(row: Row | undefined, now: number): number {
  if (!row) return 0;
  if (now - row.windowStart >= WINDOW_MS) return 0;
  if (row.count < MAX_SUBMISSIONS) return 0;
  return WINDOW_MS - (now - row.windowStart);
}

/** Milliseconds the client still has to wait, or 0 when it may submit. */
export async function submitLockRemaining(
  email: string,
  ip: string | null,
  now = Date.now(),
): Promise<number> {
  const ledger = await load();
  let remaining = 0;
  for (const key of keysFor(email, ip)) {
    remaining = Math.max(remaining, remainingInWindow(ledger[key], now));
  }
  return remaining;
}

export async function recordSubmission(email: string, ip: string | null, now = Date.now()): Promise<void> {
  const ledger = prune(await load(), now);
  for (const key of keysFor(email, ip)) {
    const row = ledger[key];
    if (!row || now - row.windowStart >= WINDOW_MS) {
      ledger[key] = { count: 1, windowStart: now, updatedAt: now };
      continue;
    }
    row.count += 1;
    row.updatedAt = now;
    ledger[key] = row;
  }
  await writeJson(FILE, ledger);
}

export function formatWait(ms: number): string {
  const minutes = Math.max(1, Math.ceil(ms / 60_000));
  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
}
