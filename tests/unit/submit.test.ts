import { describe, expect, it } from "vitest";
import { validateSubmit } from "@/lib/submit";

const base = {
  title: "Ledger pricing",
  description: "Three tiers.",
  concept: "",
  category: "Web",
  handle: "studioquiet",
  sourceUrl: "",
  slides: "1",
  featured: false,
  name: "Priya Sharma",
  email: "priya@studio.com",
};

describe("validateSubmit", () => {
  it("passes a complete public submission", () => {
    expect(validateSubmit(base)).toEqual({});
  });

  it("requires the submitter", () => {
    expect(validateSubmit({ ...base, name: "", email: "" })).toMatchObject({
      name: "Your name is required.",
      email: "Email is required.",
    });
  });

  it("rejects a malformed email", () => {
    expect(validateSubmit({ ...base, email: "nope" }).email).toBe("Enter a valid email address.");
  });

  it("still validates the piece fields", () => {
    const errors = validateSubmit({ ...base, title: "", handle: "bad handle" });
    expect(errors.title).toBe("Title is required.");
    expect(errors.handle).toMatch(/Letters/);
  });

  it("rejects junk names and emails", () => {
    expect(validateSubmit({ ...base, name: "http://spam.test" }).name).toMatch(/name/);
    expect(validateSubmit({ ...base, name: "x" }).name).toMatch(/real name/);
    expect(validateSubmit({ ...base, name: "Priya 99!!" }).name).toMatch(/letters/i);
    expect(validateSubmit({ ...base, email: "a@b.c" }).email).toBe("Enter a valid email address.");
    expect(validateSubmit({ ...base, email: "nope@localhost" }).email).toBe("Enter a valid email address.");
  });

  it("asks for a real sentence on the public form", () => {
    expect(validateSubmit({ ...base, title: "Hi" }).title).toMatch(/clearer title/);
    expect(validateSubmit({ ...base, description: "Too short" }).description).toMatch(/short sentence/);
    expect(validateSubmit({ ...base, title: "<b>Hi there</b>" }).title).toMatch(/HTML/);
  });

  it("rejects links, repeats, reserved handles and copy-paste titles", () => {
    expect(validateSubmit({ ...base, title: "See www.spam.test" }).title).toMatch(/link/);
    expect(validateSubmit({ ...base, description: "Great!!!!!!!!" }).description).toMatch(/spam/);
    expect(validateSubmit({ ...base, handle: "admin" }).handle).toMatch(/reserved/);
    expect(validateSubmit({ ...base, handle: "ab" }).handle).toMatch(/3/);
    expect(validateSubmit({ ...base, handle: "1234" }).handle).toMatch(/letter/);
    expect(validateSubmit({ ...base, description: "Ledger pricing" }).description).toMatch(/more than the title/);
    expect(validateSubmit({ ...base, name: "www.spam.test" }).name).toMatch(/link or email/);
    expect(validateSubmit({ ...base, email: "hi@studio.local" }).email).toBe("Enter a valid email address.");
  });
});
