import { promises as fs, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { JPEG_2x1, PNG_1x1 } from "../fixtures/images";

const PUBLIC_ART = readFileSync(new URL("../e2e/fixtures/e2e-artwork.jpg", import.meta.url));
const PUBLIC_AVATAR = readFileSync(new URL("../e2e/fixtures/e2e-avatar.png", import.meta.url));

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
  clientAddress: async () => "127.0.0.1",
}));

const { submitPiece } = await import("@/app/submit/actions");
const { approveSubmission, rejectSubmission } = await import("@/app/admin/review-actions");
const { getCatalogPosts } = await import("@/lib/catalog");
const { getAllPosts } = await import("@/lib/posts");
const { getSubmissions, getPendingSubmissions } = await import("@/lib/submissions");

function form(fields: Record<string, string | File | undefined>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) if (v !== undefined) fd.set(k, v);
  return fd;
}

const artwork = () => new File([PUBLIC_ART], "art.jpg", { type: "image/jpeg" });
const tinyArtwork = () => new File([JPEG_2x1], "tiny.jpg", { type: "image/jpeg" });
const avatar = () => new File([PUBLIC_AVATAR], "me.png", { type: "image/png" });
const tinyAvatar = () => new File([PNG_1x1], "tiny.png", { type: "image/png" });

const base = {
  name: "Priya Sharma",
  email: "priya@studio.com",
  title: "Public Ledger",
  description: "Three tiers from the public form.",
  category: "Product",
  handle: "priyastudio",
  sourceUrl: "https://example.com/ledger",
  slides: "2",
};

async function expectRedirect(p: Promise<unknown>, to: RegExp) {
  await expect(p).rejects.toBeInstanceOf(RedirectSignal);
  await p.catch((e: RedirectSignal) => expect(e.to).toMatch(to));
}

async function uploads(root: string): Promise<string[]> {
  return fs.readdir(path.join(process.env.DATA_DIR ?? path.join(root, "data"), "uploads")).catch(() => []);
}

describe("public submit and desk review", () => {
  let cwd: string;
  let root: string;

  beforeEach(async () => {
    authed = true;
    revalidatePath.mockClear();
    cwd = process.cwd();
    root = await fs.mkdtemp(path.join(os.tmpdir(), "spiffing-submit-"));
    process.chdir(root);
  });
  afterEach(async () => {
    process.chdir(cwd);
    await fs.rm(root, { recursive: true, force: true });
  });

  it("validates before touching storage", async () => {
    const result = await submitPiece({}, form({ ...base, title: "", name: "", artwork: artwork() }));
    expect(result.fields).toMatchObject({ title: "Title is required.", name: "Your name is required." });
    expect(await uploads(root)).toEqual([]);
    expect(await getSubmissions()).toEqual([]);
  });

  it("requires artwork", async () => {
    const result = await submitPiece({}, form(base));
    expect(result.fields?.artwork).toMatch(/Upload the artwork/);
  });

  it("rejects a second pending copy of the same piece", async () => {
    await expectRedirect(submitPiece({}, form({ ...base, artwork: artwork() })), /thanks/);
    const again = await submitPiece({}, form({ ...base, artwork: artwork() }));
    expect(again.fields?.title).toMatch(/already/);
    expect(await getPendingSubmissions()).toHaveLength(1);
  });

  it("rejects a tiny avatar after saving then removing artwork", async () => {
    const result = await submitPiece({}, form({ ...base, artwork: artwork(), avatar: tinyAvatar() }));
    expect(result.fields?.avatar).toMatch(/64/);
    expect(await uploads(root)).toEqual([]);
    expect(await getSubmissions()).toEqual([]);
  });

  it("rejects a tiny or fake artwork without writing", async () => {
    const tiny = await submitPiece({}, form({ ...base, artwork: tinyArtwork() }));
    expect(tiny.fields?.artwork).toMatch(/400/);
    const fake = await submitPiece(
      {},
      form({ ...base, artwork: new File([Buffer.from("nope")], "x.txt", { type: "text/plain" }) }),
    );
    expect(fake.fields?.artwork).toMatch(/JPG|PNG|WebP|GIF/);
    expect(await uploads(root)).toEqual([]);
  });

  it("stores a pending row that is not on the public gallery", async () => {
    await expectRedirect(submitPiece({}, form({ ...base, artwork: artwork(), avatar: avatar() })), /^\/submit\/thanks$/);

    const [row] = await getPendingSubmissions();
    expect(row).toMatchObject({
      status: "pending",
      title: "Public Ledger",
      category: "Product",
      submitterEmail: "priya@studio.com",
      creator: { handle: "priyastudio" },
    });
    expect(await getCatalogPosts()).toEqual([]);
    expect((await getAllPosts()).some((p) => p.id === row.id)).toBe(false);
    expect(await uploads(root)).toHaveLength(2);
  });

  it("treats a filled honeypot as success without writing", async () => {
    await expectRedirect(submitPiece({}, form({ ...base, website: "http://spam.test", artwork: artwork() })), /^\/submit\/thanks$/);
    expect(await getSubmissions()).toEqual([]);
    expect(await uploads(root)).toEqual([]);
  });

  it("approves into the catalog on the chosen category", async () => {
    await expectRedirect(submitPiece({}, form({ ...base, artwork: artwork() })), /thanks/);
    const [row] = await getSubmissions();

    await expectRedirect(approveSubmission(form({ id: row.id })), /^\/admin\/submissions\?approved=public-ledger$/);

    const [piece] = await getCatalogPosts();
    expect(piece).toMatchObject({
      id: "public-ledger",
      title: "Public Ledger",
      category: "Product",
      featured: false,
      creator: { handle: "priyastudio" },
    });
    expect((await getAllPosts()).some((p) => p.id === "public-ledger")).toBe(true);
    expect((await getSubmissions())[0]).toMatchObject({ status: "approved", pieceId: "public-ledger" });
    expect(await getPendingSubmissions()).toEqual([]);
  });

  it("rejects without publishing and removes files", async () => {
    await expectRedirect(submitPiece({}, form({ ...base, artwork: artwork() })), /thanks/);
    const [row] = await getSubmissions();

    await expectRedirect(rejectSubmission(form({ id: row.id, reason: "Too close to seed work." })), /^\/admin\/submissions\?rejected=1$/);

    expect(await getCatalogPosts()).toEqual([]);
    expect((await getSubmissions())[0]).toMatchObject({
      status: "rejected",
      rejectReason: "Too close to seed work.",
      media: { src: "" },
    });
    expect(await uploads(root)).toEqual([]);
  });

  it("refuses review when not signed in", async () => {
    authed = false;
    await expectRedirect(approveSubmission(form({ id: "x" })), /^\/admin\/login$/);
    await expectRedirect(rejectSubmission(form({ id: "x" })), /^\/admin\/login$/);
  });
});
