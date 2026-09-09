import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { JPEG_2x1, PNG_1x1 } from "../fixtures/images";

/**
 * The server actions end-to-end against the local store: validation, file
 * handling, catalog writes and the redirects that follow. Next's request
 * helpers are stubbed; `redirect` throws like the real one does.
 */

class RedirectSignal extends Error {
  constructor(public readonly to: string) {
    super(`redirect:${to}`);
  }
}

const revalidatePath = vi.fn();
let authed = true;

vi.mock("next/cache", () => ({ revalidatePath: (...args: unknown[]) => revalidatePath(...args) }));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new RedirectSignal(to);
  },
}));
vi.mock("next/headers", () => ({ cookies: vi.fn(), headers: vi.fn() }));
vi.mock("@/lib/admin", () => ({
  requireAdmin: async () => {
    if (!authed) throw new RedirectSignal("/admin/login");
    return { email: "desk@example.com", exp: 0, pv: "x" };
  },
}));

const { createPiece, deletePiece, updatePiece } = await import("@/app/admin/actions");
const { getCatalogPosts } = await import("@/lib/catalog");

function form(fields: Record<string, string | File | undefined>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) if (v !== undefined) fd.set(k, v);
  return fd;
}

const artwork = () => new File([JPEG_2x1], "art.jpg", { type: "image/jpeg" });
const avatar = () => new File([PNG_1x1], "me.png", { type: "image/png" });

const base = {
  title: "Ledger — pricing",
  description: "Three tiers.",
  category: "Web",
  handle: "studioquiet",
  sourceUrl: "https://example.com/ledger",
  slides: "2",
  featured: "on",
};

async function expectRedirect(p: Promise<unknown>, to: RegExp) {
  await expect(p).rejects.toBeInstanceOf(RedirectSignal);
  await p.catch((e: RedirectSignal) => expect(e.to).toMatch(to));
}

async function uploads(root: string): Promise<string[]> {
  return fs.readdir(path.join(process.env.DATA_DIR ?? path.join(root, "data"), "uploads")).catch(() => []);
}

describe("piece actions", () => {
  let cwd: string;
  let root: string;

  beforeEach(async () => {
    authed = true;
    revalidatePath.mockClear();
    cwd = process.cwd();
    root = await fs.mkdtemp(path.join(os.tmpdir(), "spiffing-actions-"));
    process.chdir(root);
  });
  afterEach(async () => {
    process.chdir(cwd);
    await fs.rm(root, { recursive: true, force: true });
  });

  it("refuses when not signed in", async () => {
    authed = false;
    await expectRedirect(createPiece({}, form({ ...base, artwork: artwork() })), /^\/admin\/login$/);
    expect(await getCatalogPosts()).toEqual([]);
  });

  it("validates before touching storage", async () => {
    const result = await createPiece({}, form({ ...base, title: "", handle: "bad handle", artwork: artwork() }));
    expect(result.fields).toMatchObject({ title: "Title is required.", handle: expect.stringMatching(/Letters/) });
    expect(await uploads(root)).toEqual([]);
    expect(await getCatalogPosts()).toEqual([]);
  });

  it("requires artwork on create", async () => {
    const result = await createPiece({}, form(base));
    expect(result.fields?.artwork).toMatch(/Upload the artwork/);
  });

  it("rejects a mislabelled file and leaves nothing behind", async () => {
    const fake = new File([Buffer.from("not an image")], "x.jpg", { type: "image/jpeg" });
    const result = await createPiece({}, form({ ...base, artwork: fake }));
    expect(result.fields?.artwork).toMatch(/not a readable image/);
    expect(await uploads(root)).toEqual([]);
  });

  it("publishes, measuring the image itself", async () => {
    await expectRedirect(
      createPiece({}, form({ ...base, concept: "Forest-green panels, one lime accent.", artwork: artwork(), avatar: avatar() })),
      /^\/admin\?published=ledger-pricing$/,
    );

    const [piece] = await getCatalogPosts();
    expect(piece).toMatchObject({
      id: "ledger-pricing",
      title: "Ledger — pricing",
      category: "Web",
      creator: { handle: "studioquiet" },
      media: { width: 2, height: 1 },
      slides: 2,
      featured: true,
      concept: "Forest-green panels, one lime accent.",
      sourceUrl: "https://example.com/ledger",
    });
    expect(piece.media.src).toMatch(/^\/uploads\/ledger-pricing-\d+\.jpg$/);
    expect(piece.creator.avatar).toMatch(/^\/uploads\/ledger-pricing-avatar-\d+\.png$/);
    expect(await uploads(root)).toHaveLength(2);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(revalidatePath).toHaveBeenCalledWith("/posts/ledger-pricing");
  });

  it("falls back to the default avatar and empty source", async () => {
    await expectRedirect(createPiece({}, form({ ...base, sourceUrl: "", artwork: artwork() })), /published/);
    const [piece] = await getCatalogPosts();
    expect(piece.creator.avatar).toBe("/creators/creator-1.svg");
    expect(piece.sourceUrl).toBe("");
  });

  it("gives duplicate titles distinct ids and puts the newest first", async () => {
    await expectRedirect(createPiece({}, form({ ...base, artwork: artwork() })), /published=ledger-pricing$/);
    await expectRedirect(createPiece({}, form({ ...base, artwork: artwork() })), /published=ledger-pricing-2$/);
    expect((await getCatalogPosts()).map((p) => p.id)).toEqual(["ledger-pricing-2", "ledger-pricing"]);
  });

  it("removes the artwork when the avatar fails", async () => {
    const badAvatar = new File([Buffer.from("nope")], "a.png", { type: "image/png" });
    const result = await createPiece({}, form({ ...base, artwork: artwork(), avatar: badAvatar }));
    expect(result.fields?.avatar).toMatch(/not a readable image/);
    expect(await uploads(root)).toEqual([]);
  });

  it("updates text without touching files, and swaps files when given", async () => {
    await expectRedirect(createPiece({}, form({ ...base, artwork: artwork() })), /published/);
    const [before] = await getCatalogPosts();

    await expectRedirect(
      updatePiece({}, form({ ...base, id: before.id, title: "Renamed", featured: undefined, slides: "1" })),
      /^\/admin\?updated=ledger-pricing$/,
    );
    const [afterText] = await getCatalogPosts();
    expect(afterText).toMatchObject({ id: before.id, title: "Renamed", featured: false, slides: 1 });
    expect(afterText.media).toEqual(before.media);
    expect(afterText.publishedAt).toBe(before.publishedAt);

    const png = new File([PNG_1x1], "new.png", { type: "image/png" });
    await expectRedirect(updatePiece({}, form({ ...base, id: before.id, artwork: png })), /updated/);
    const [afterFile] = await getCatalogPosts();
    expect(afterFile.media).toMatchObject({ width: 1, height: 1 });
    expect(afterFile.media.src).toMatch(/\.png$/);
    const files = await uploads(root);
    expect(files).toHaveLength(1);
    expect(`/uploads/${files[0]}`).toBe(afterFile.media.src);
  });

  it("returns field errors on update and keeps the piece intact", async () => {
    await expectRedirect(createPiece({}, form({ ...base, artwork: artwork() })), /published/);
    const [before] = await getCatalogPosts();
    const result = await updatePiece({}, form({ ...base, id: before.id, description: "" }));
    expect(result.fields?.description).toBe("Description is required.");
    expect((await getCatalogPosts())[0]).toEqual(before);
  });

  it("refuses to update an unknown id", async () => {
    const result = await updatePiece({}, form({ ...base, id: "ghost" }));
    expect(result.error).toMatch(/not in the admin catalog/);
  });

  it("deletes the row and its files", async () => {
    await expectRedirect(createPiece({}, form({ ...base, artwork: artwork(), avatar: avatar() })), /published/);
    const [piece] = await getCatalogPosts();
    await expectRedirect(deletePiece(form({ id: piece.id })), /^\/admin\?removed=1$/);
    expect(await getCatalogPosts()).toEqual([]);
    expect(await uploads(root)).toEqual([]);
  });

  it("delete of an unknown id just returns to the list", async () => {
    await expectRedirect(deletePiece(form({ id: "ghost" })), /^\/admin$/);
  });
});
