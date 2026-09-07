import { describe, expect, it } from "vitest";
import { EMAIL_RE, validateLoginFields, validatePasswordChange } from "@/lib/admin-validation";

describe("EMAIL_RE", () => {
  it.each(["a@b.co", "desk.admin+tag@example.museum", "x@y.z"])("accepts %s", (v) => {
    expect(EMAIL_RE.test(v)).toBe(true);
  });
  it.each(["", "plain", "a@b", "a b@c.d", "@x.y", "a@@b.c"])("rejects %j", (v) => {
    expect(EMAIL_RE.test(v)).toBe(false);
  });
});

describe("validateLoginFields", () => {
  it("passes a valid pair", () => {
    expect(validateLoginFields("desk@example.com", "password1")).toEqual({});
  });
  it("requires both fields", () => {
    expect(validateLoginFields("", "")).toEqual({
      email: "Email is required.",
      password: "Password is required.",
    });
  });
  it("rejects a malformed email", () => {
    expect(validateLoginFields("nope", "password1").email).toBe("Enter a valid email address.");
  });
  it("enforces length and composition", () => {
    expect(validateLoginFields("a@b.co", "short1").password).toMatch(/at least 8/);
    expect(validateLoginFields("a@b.co", "onlyletters").password).toMatch(/letter and one number/);
    expect(validateLoginFields("a@b.co", "12345678").password).toMatch(/letter and one number/);
    expect(validateLoginFields("a@b.co", "a1".repeat(70)).password).toBe("Password is too long.");
  });
});

describe("validatePasswordChange", () => {
  it("passes a valid change", () => {
    expect(validatePasswordChange("old-pass-1", "new-pass-2", "new-pass-2")).toEqual({});
  });
  it("requires the current password", () => {
    expect(validatePasswordChange("", "new-pass-2", "new-pass-2").current).toBe("Current password is required.");
  });
  it("requires confirmation to match", () => {
    expect(validatePasswordChange("old-pass-1", "new-pass-2", "new-pass-3").confirm).toBe(
      "The two new passwords do not match.",
    );
    expect(validatePasswordChange("old-pass-1", "new-pass-2", "").confirm).toBe("Confirm the new password.");
  });
  it("refuses to reuse the current password", () => {
    expect(validatePasswordChange("same-pass-1", "same-pass-1", "same-pass-1").next).toMatch(/different/);
  });
  it("applies the strength rules to the new password", () => {
    expect(validatePasswordChange("old-pass-1", "weak", "weak").next).toMatch(/at least 8/);
  });
});
