import { describe, expect, it } from "vitest";
import {
  formatWait,
  keysFor,
  MAX_SUBMISSIONS,
  recordSubmission,
  submitLockRemaining,
  WINDOW_MS,
} from "@/lib/submit-attempts";

describe("submit-attempts", () => {
  it("hashes the client address and always keys the email", () => {
    const keys = keysFor("Priya@Studio.com", "1.2.3.4");
    expect(keys[0]).toBe("email:priya@studio.com");
    expect(keys[1]).toMatch(/^ip:[0-9a-f]{24}$/);
  });

  it("allows five submits then locks the hour", async () => {
    const now = Date.UTC(2026, 0, 1, 12, 0, 0);
    for (let i = 0; i < MAX_SUBMISSIONS; i += 1) {
      expect(await submitLockRemaining("a@b.co", "10.0.0.1", now + i)).toBe(0);
      await recordSubmission("a@b.co", "10.0.0.1", now + i);
    }
    expect(await submitLockRemaining("a@b.co", "10.0.0.1", now + 10)).toBe(WINDOW_MS - 10);
    expect(await submitLockRemaining("a@b.co", "10.0.0.1", now + WINDOW_MS)).toBe(0);
  });

  it("formats the wait in whole minutes", () => {
    expect(formatWait(1)).toBe("1 minute");
    expect(formatWait(60_000)).toBe("1 minute");
    expect(formatWait(61_000)).toBe("2 minutes");
  });
});
