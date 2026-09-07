import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import {
  createSessionToken,
  decodeSession,
  encodeSession,
  getAdminCredentials,
  hashPassword,
  passwordVersion,
  readSession,
  SESSION_MS,
  verifyCredentials,
  verifyPasswordHash,
} from "@/lib/admin";
import { saveSettings } from "@/lib/settings";

describe("getAdminCredentials", () => {
  it("reads and normalises the env", () => {
    process.env.ADMIN_EMAIL = "  Desk@Example.com ";
    expect(getAdminCredentials()?.email).toBe("desk@example.com");
  });
  it("refuses weak configuration", () => {
    process.env.ADMIN_PASSWORD = "short";
    expect(getAdminCredentials()).toBeNull();
    process.env.ADMIN_PASSWORD = "correct-horse-1";
    process.env.ADMIN_SESSION_SECRET = "tooshort";
    expect(getAdminCredentials()).toBeNull();
    process.env.ADMIN_SESSION_SECRET = "0123456789abcdef0123456789abcdef";
    process.env.ADMIN_EMAIL = "not-an-email";
    expect(getAdminCredentials()).toBeNull();
  });
});

describe("password hashing", () => {
  it("verifies the right password and rejects others", async () => {
    const stored = await hashPassword("secret-pass-9");
    expect(stored).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/);
    expect(await verifyPasswordHash("secret-pass-9", stored)).toBe(true);
    expect(await verifyPasswordHash("secret-pass-8", stored)).toBe(false);
  });
  it("salts every hash", async () => {
    expect(await hashPassword("same")).not.toBe(await hashPassword("same"));
  });
  it("rejects malformed stored values", async () => {
    expect(await verifyPasswordHash("x", "garbage")).toBe(false);
    expect(await verifyPasswordHash("x", "abcd:zz")).toBe(false);
  });
});

describe("verifyCredentials", () => {
  it("uses the env password until one is stored", async () => {
    expect(await verifyCredentials("desk@example.com", "correct-horse-1")).toBe(true);
    expect(await verifyCredentials("desk@example.com", "wrong-horse-1")).toBe(false);
    expect(await verifyCredentials("other@example.com", "correct-horse-1")).toBe(false);
  });
  it("switches to the stored hash once the password is changed", async () => {
    await saveSettings({ showSeed: false, passwordHash: await hashPassword("new-pass-77") });
    expect(await verifyCredentials("desk@example.com", "correct-horse-1")).toBe(false);
    expect(await verifyCredentials("desk@example.com", "new-pass-77")).toBe(true);
  });
});

describe("session tokens", () => {
  const secret = "0123456789abcdef0123456789abcdef";

  it("round-trips through encode/decode", () => {
    const session = { email: "desk@example.com", exp: 1, pv: "abc" };
    expect(decodeSession(encodeSession(session, secret), secret)).toEqual(session);
  });
  it("rejects a tampered payload or wrong secret", () => {
    const token = encodeSession({ email: "desk@example.com", exp: 1, pv: "abc" }, secret);
    const [payload, sig] = token.split(".");
    const forged = `${Buffer.from(JSON.stringify({ email: "evil@example.com", exp: 1, pv: "abc" })).toString("base64url")}.${sig}`;
    expect(decodeSession(forged, secret)).toBeNull();
    expect(decodeSession(`${payload}.wrong`, secret)).toBeNull();
    expect(decodeSession(token, "another-secret-another-secret-1")).toBeNull();
    expect(decodeSession("nodot", secret)).toBeNull();
  });
  it("creates a token that reads back while current", async () => {
    const token = await createSessionToken("desk@example.com", { now: 1_000 });
    expect(token).not.toBeNull();
    const session = await readSession(token!, 2_000);
    expect(session?.email).toBe("desk@example.com");
  });
  it("expires", async () => {
    const token = await createSessionToken("desk@example.com", { now: 1_000 });
    expect(await readSession(token!, 1_000 + SESSION_MS + 1)).toBeNull();
  });
  it("rejects a token for another email even when signed correctly", async () => {
    const token = encodeSession({ email: "other@example.com", exp: Date.now() + 10_000, pv: "x" }, secret);
    expect(await readSession(token)).toBeNull();
  });
  it("is invalidated by a password change", async () => {
    const token = await createSessionToken("desk@example.com");
    expect(await readSession(token!)).not.toBeNull();
    await saveSettings({ showSeed: false, passwordHash: await hashPassword("rotated-pass-3") });
    expect(await readSession(token!)).toBeNull();
  });
  it("derives a stable version from the hash", () => {
    expect(passwordVersion("h1", "env")).toBe(passwordVersion("h1", "env"));
    expect(passwordVersion("h1", "env")).not.toBe(passwordVersion("h2", "env"));
    expect(passwordVersion(undefined, "env-a")).not.toBe(passwordVersion(undefined, "env-b"));
  });
});
