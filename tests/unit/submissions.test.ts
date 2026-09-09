import { describe, expect, it } from "vitest";
import {
  countPending,
  getSubmissions,
  hasPendingDuplicate,
  parseSubmissions,
  postFromSubmission,
  saveSubmissions,
  takenPieceIds,
  type Submission,
} from "@/lib/submissions";
import { saveCatalogPosts } from "@/lib/catalog";

const row = (over: Partial<Submission> = {}): Submission => ({
  id: "ledger-pricing",
  status: "pending",
  submittedAt: "2026-01-01T00:00:00.000Z",
  reviewedAt: "",
  rejectReason: "",
  pieceId: "",
  submitterName: "Priya Sharma",
  submitterEmail: "priya@studio.com",
  title: "Ledger pricing",
  description: "Three tiers.",
  concept: "",
  category: "Web",
  creator: { handle: "studioquiet", avatar: "/creators/creator-1.svg" },
  media: { src: "/uploads/ledger.jpg", width: 800, height: 1000 },
  slides: 1,
  sourceUrl: "",
  ...over,
});

describe("parseSubmissions", () => {
  it("drops malformed rows", () => {
    expect(parseSubmissions(null)).toEqual([]);
    expect(parseSubmissions([{ id: "x" }])).toEqual([]);
    expect(parseSubmissions([row(), { title: "nope" }])).toHaveLength(1);
  });

  it("fills optional strings", () => {
    const parsed = parseSubmissions([{ ...row(), concept: undefined, sourceUrl: undefined }]);
    expect(parsed[0]).toMatchObject({ concept: "", sourceUrl: "" });
  });
});

describe("submission store", () => {
  it("starts empty and counts pending", async () => {
    expect(await getSubmissions()).toEqual([]);
    expect(await countPending()).toBe(0);
    await saveSubmissions([row(), row({ id: "other", status: "approved", pieceId: "other" })]);
    expect(await countPending()).toBe(1);
  });

  it("treats pending and live catalog ids as taken", async () => {
    await saveCatalogPosts([
      {
        id: "live",
        title: "Live",
        description: "d",
        concept: "",
        category: "Web",
        creator: { handle: "h", avatar: "/a.png" },
        media: { src: "/uploads/live.png", width: 10, height: 20 },
        slides: 1,
        sourceUrl: "",
        featured: false,
        publishedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    await saveSubmissions([row({ id: "waiting" }), row({ id: "done", status: "approved", pieceId: "done-live" })]);
    const taken = await takenPieceIds();
    expect(taken.has("live")).toBe(true);
    expect(taken.has("waiting")).toBe(true);
    expect(taken.has("done-live")).toBe(true);
    expect(taken.has("done")).toBe(false);
  });
});

describe("hasPendingDuplicate", () => {
  it("matches the same email and title still waiting", () => {
    const rows = [row(), row({ id: "other", status: "approved", title: "Ledger pricing" })];
    expect(hasPendingDuplicate(rows, "Priya@studio.com", "ledger pricing")).toBe(true);
    expect(hasPendingDuplicate(rows, "other@studio.com", "Ledger pricing")).toBe(false);
    expect(hasPendingDuplicate(rows, "priya@studio.com", "Something else")).toBe(false);
  });
});

describe("postFromSubmission", () => {
  it("builds a gallery post that is not featured", () => {
    expect(postFromSubmission(row(), "ledger-pricing", "2026-02-01T00:00:00.000Z")).toMatchObject({
      id: "ledger-pricing",
      title: "Ledger pricing",
      category: "Web",
      featured: false,
      publishedAt: "2026-02-01T00:00:00.000Z",
    });
  });
});
