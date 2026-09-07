import { describe, expect, it, vi } from "vitest";
import {
  clearFailures,
  formatWait,
  keysFor,
  LOCK_MS,
  lockRemaining,
  MAX_ATTEMPTS,
  recordFailure,
} from "@/lib/login-attempts";

const email = "desk@example.com";
const ip = "203.0.113.7";

describe("login attempt ledger", () => {
  it("keys by normalised email and hashed ip", () => {
    const keys = keysFor(" Desk@Example.com ", ip);
    expect(keys[0]).toBe("email:desk@example.com");
    expect(keys[1]).toMatch(/^ip:[0-9a-f]{24}$/);
    expect(keys[1]).not.toContain(ip);
    expect(keysFor(email, null)).toHaveLength(1);
  });

  it("locks after MAX_ATTEMPTS failures and reports the remaining wait", async () => {
    const t0 = 1_000_000;
    for (let i = 0; i < MAX_ATTEMPTS - 1; i++) {
      await recordFailure(email, ip, t0 + i);
      expect(await lockRemaining(email, ip, t0 + i)).toBe(0);
    }
    await recordFailure(email, ip, t0 + 10);
    expect(await lockRemaining(email, ip, t0 + 11)).toBe(LOCK_MS - 1);
    expect(await lockRemaining(email, ip, t0 + 10 + LOCK_MS)).toBe(0);
  });

  it("survives a fresh module load (persisted, not in memory)", async () => {
    for (let i = 0; i < MAX_ATTEMPTS; i++) await recordFailure(email, ip, 5_000 + i);
    vi.resetModules();
    const fresh = await import("@/lib/login-attempts");
    expect(await fresh.lockRemaining(email, ip, 5_100)).toBeGreaterThan(0);
  });

  it("locks the address even when the email changes", async () => {
    for (let i = 0; i < MAX_ATTEMPTS; i++) await recordFailure(`u${i}@example.com`, ip, 7_000 + i);
    expect(await lockRemaining("fresh@example.com", ip, 7_100)).toBeGreaterThan(0);
    expect(await lockRemaining("fresh@example.com", "198.51.100.1", 7_100)).toBe(0);
  });

  it("clears on success", async () => {
    for (let i = 0; i < MAX_ATTEMPTS - 1; i++) await recordFailure(email, ip, 9_000 + i);
    await clearFailures(email, ip, 9_100);
    for (let i = 0; i < MAX_ATTEMPTS - 1; i++) await recordFailure(email, ip, 9_200 + i);
    expect(await lockRemaining(email, ip, 9_300)).toBe(0);
  });

  it("formats the wait in whole minutes, rounding up", () => {
    expect(formatWait(1)).toBe("1 minute");
    expect(formatWait(61_000)).toBe("2 minutes");
    expect(formatWait(LOCK_MS)).toBe("15 minutes");
  });
});
