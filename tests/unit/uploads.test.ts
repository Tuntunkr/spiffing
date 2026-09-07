import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { inspectImage, localUploadPath, removeUpload, saveUpload } from "@/lib/uploads";
import { PNG_1x1, JPEG_2x1, GIF_1x1, WEBP_1x1 } from "../fixtures/images";

describe("inspectImage", () => {
  it("reads real dimensions from the file header", () => {
    expect(inspectImage(PNG_1x1, "image/png")).toEqual({ ext: "png", width: 1, height: 1 });
    expect(inspectImage(JPEG_2x1, "image/jpeg")).toEqual({ ext: "jpg", width: 2, height: 1 });
    expect(inspectImage(GIF_1x1, "image/gif")).toEqual({ ext: "gif", width: 1, height: 1 });
    expect(inspectImage(WEBP_1x1, "image/webp")).toEqual({ ext: "webp", width: 1, height: 1 });
  });
  it("rejects SVG and unknown types", () => {
    expect(() => inspectImage(Buffer.from("<svg/>"), "image/svg+xml")).toThrow(/JPG, PNG, WebP or GIF/);
    expect(() => inspectImage(PNG_1x1, "application/pdf")).toThrow(/JPG, PNG, WebP or GIF/);
  });
  it("rejects a file whose bytes do not match the declared type", () => {
    expect(() => inspectImage(PNG_1x1, "image/jpeg")).toThrow(/not a JPG/);
    expect(() => inspectImage(Buffer.from("hello"), "image/png")).toThrow(/not a readable image/);
  });
  it("rejects empty and oversized files", () => {
    expect(() => inspectImage(Buffer.alloc(0), "image/png")).toThrow(/empty/);
    expect(() => inspectImage(Buffer.alloc(8 * 1024 * 1024 + 1), "image/png")).toThrow(/8 MB/);
  });
});

describe("local upload storage", () => {
  it("saves under DATA_DIR/uploads and returns the real size", async () => {
    const file = new File([JPEG_2x1], "shot.jpeg", { type: "image/jpeg" });
    const saved = await saveUpload(file, "ledger");
    expect(saved).toMatchObject({ width: 2, height: 1 });
    expect(saved.src).toMatch(/^\/uploads\/ledger-\d+\.jpg$/);
    await expect(fs.stat(path.join(process.env.DATA_DIR!, saved.src))).resolves.toBeTruthy();
  });

  it("removes only its own files", async () => {
    const saved = await saveUpload(new File([PNG_1x1], "a.png", { type: "image/png" }), "a");
    const disk = path.join(process.env.DATA_DIR!, saved.src);
    await expect(fs.stat(disk)).resolves.toBeTruthy();
    await removeUpload(saved.src);
    await expect(fs.stat(disk)).rejects.toThrow();

    const seed = path.join(process.env.DATA_DIR!, "creators", "c.svg");
    await fs.mkdir(path.dirname(seed), { recursive: true });
    await fs.writeFile(seed, "<svg/>");
    await removeUpload("/creators/c.svg");
    await removeUpload("/uploads/../creators/c.svg");
    await removeUpload("/uploads/not a file.png");
    await removeUpload("https://evil.example/uploads/x.png");
    await expect(fs.stat(seed)).resolves.toBeTruthy();
  });

  it("refuses nested or odd names", () => {
    expect(localUploadPath("../secret.jpg")).toBeNull();
    expect(localUploadPath("a/b.jpg")).toBeNull();
    expect(localUploadPath("x.svg")).toBeNull();
    expect(localUploadPath("ok-file_1.jpg")).toMatch(/ok-file_1\.jpg$/);
  });
});
