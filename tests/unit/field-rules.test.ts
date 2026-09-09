import { describe, expect, it } from "vitest";
import { copyIssue, nameIssue, normaliseSourceUrl, submitEmailIssue, tidyCopy } from "@/lib/field-rules";

describe("copyIssue", () => {
  it("allows ordinary copy", () => {
    expect(copyIssue("Harbor print study", "Title")).toBeUndefined();
  });
  it("rejects tags and letterless strings", () => {
    expect(copyIssue("<img src=x>", "Title")).toMatch(/HTML/);
    expect(copyIssue("****", "Title")).toMatch(/letter/);
  });
});

describe("nameIssue", () => {
  it("accepts real names", () => {
    expect(nameIssue("Priya Sharma", 80)).toBeUndefined();
    expect(nameIssue("O'Brien", 80)).toBeUndefined();
    expect(nameIssue("李明", 80)).toBeUndefined();
  });
  it("rejects links and symbols", () => {
    expect(nameIssue("https://x.com", 80)).toMatch(/link or email/);
    expect(nameIssue("ok@x.com", 80)).toMatch(/link or email/);
    expect(nameIssue("Ann!!!", 80)).toMatch(/letters/i);
  });
});

describe("submitEmailIssue", () => {
  it("accepts a normal address", () => {
    expect(submitEmailIssue("priya@studio.com", 120)).toBeUndefined();
  });
  it("rejects loose or local addresses", () => {
    expect(submitEmailIssue("nope", 120)).toBeDefined();
    expect(submitEmailIssue("a@b.c", 120)).toBeDefined();
    expect(submitEmailIssue("user@localhost", 120)).toBeDefined();
  });
});

describe("normaliseSourceUrl", () => {
  it("keeps a public link", () => {
    expect(normaliseSourceUrl("https://dribbble.com/shots/1")).toBe("https://dribbble.com/shots/1");
  });
});

describe("tidyCopy", () => {
  it("collapses spaces and keeps a short paragraph", () => {
    expect(tidyCopy("  Harbor   print  ")).toBe("Harbor print");
    expect(tidyCopy("one\n\n\n\ntwo", true)).toBe("one\n\ntwo");
  });
});
