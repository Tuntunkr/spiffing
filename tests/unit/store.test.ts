import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readJson, writeJson } from "@/lib/store";
import { getSettings, parseSettings, saveSettings } from "@/lib/settings";
import { getCatalogPosts, saveCatalogPosts } from "@/lib/catalog";

describe("local JSON store", () => {
  it("returns the fallback when nothing is written", async () => {
    expect(await readJson("missing.json", { a: 1 })).toEqual({ a: 1 });
  });
  it("writes and reads back", async () => {
    await writeJson("thing.json", { hello: "world" });
    expect(await readJson("thing.json", null)).toEqual({ hello: "world" });
    const files = await fs.readdir(process.env.DATA_DIR!);
    expect(files).toEqual(["thing.json"]); // no temp file left behind
  });
  it("returns the fallback for corrupt files", async () => {
    await fs.mkdir(process.env.DATA_DIR!, { recursive: true });
    await fs.writeFile(path.join(process.env.DATA_DIR!, "bad.json"), "{not json");
    expect(await readJson("bad.json", [])).toEqual([]);
  });
});

describe("settings", () => {
  it("parses loosely", () => {
    expect(parseSettings(null)).toEqual({ showSeed: false });
    expect(parseSettings({ showSeed: "true" })).toEqual({ showSeed: false, passwordHash: undefined });
    expect(parseSettings({ showSeed: true, passwordHash: 42 })).toEqual({ showSeed: true, passwordHash: undefined });
  });
  it("persists", async () => {
    // Outside a React render, `cache()` is a pass-through, so this reads the disk.
    expect(await getSettings()).toEqual({ showSeed: false });
    await saveSettings({ showSeed: true, passwordHash: "a:b" });
    expect(await getSettings()).toEqual({ showSeed: true, passwordHash: "a:b" });
  });
});

describe("catalog", () => {
  it("starts empty and persists what is saved", async () => {
    expect(await getCatalogPosts()).toEqual([]);
    await saveCatalogPosts([
      {
        id: "one",
        title: "One",
        description: "d",
        category: "Web",
        creator: { handle: "h", avatar: "/a.png" },
        media: { src: "/uploads/one.png", width: 10, height: 20 },
        slides: 1,
        sourceUrl: "",
        featured: false,
        publishedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    expect((await getCatalogPosts()).map((p) => p.id)).toEqual(["one"]);
  });
});
