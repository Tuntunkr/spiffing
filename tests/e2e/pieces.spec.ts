import { expect, test } from "@playwright/test";
import { ARTWORK, AVATAR, login, notice, publish, removePiece } from "./helpers";

test.describe("publishing pieces", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("the form validates every field before submitting", async ({ page }) => {
    await page.goto("/admin/new");
    await page.getByRole("button", { name: "Publish to gallery" }).click();
    await expect(page.getByText("Title is required.")).toBeVisible();
    await expect(page.getByText("Description is required.")).toBeVisible();
    await expect(page.getByText("Designer handle is required.")).toBeVisible();
    await expect(page.getByText(/Upload the artwork/)).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/new$/);

    await page.getByLabel(/Original URL/).fill("javascript:alert(1)");
    await page.getByLabel("Handle").fill("has space");
    await page.getByLabel("Frames").fill("0");
    await page.getByRole("button", { name: "Publish to gallery" }).click();
    await expect(page.getByText(/full http\(s\) link/)).toBeVisible();
    await expect(page.getByText(/Letters, numbers/)).toBeVisible();
    await expect(page.getByText(/whole number from 1/)).toBeVisible();
  });

  test("rejects a non-image and a wrong-type file client-side", async ({ page }) => {
    await page.goto("/admin/new");
    await page.locator("#artwork").setInputFiles({
      name: "notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("hello"),
    });
    await expect(page.getByText("Use a JPG, PNG, WebP or GIF.")).toBeVisible();
  });

  test("publish → gallery → detail → edit → remove", async ({ page }) => {
    test.setTimeout(60_000);
    const title = `E2E Ledger ${Date.now()}`;
    const id = await publish(page, {
      title,
      description: "A pricing page with three tiers, built for the e2e run.",
      concept:
        "Mossforge fuses the calm of cream paper backdrops with the gravity of forest-green panels and a single charged lime accent.",
      category: "Product",
      handle: "e2estudio",
      sourceUrl: "https://example.com/ledger",
      featured: true,
    });
    expect(id).toMatch(/^e2e-ledger-\d+$/);

    // The row in the table.
    const row = page.getByRole("row", { name: new RegExp(title) });
    await expect(row).toBeVisible();
    await expect(row.getByText("Featured")).toBeVisible();

    // Public gallery: appears in Latest, in its category chip, and in search.
    await page.goto("/");
    await expect(page.getByRole("link", { name: title }).first()).toBeVisible();
    await expect
      .poll(async () =>
        page
          .getByRole("link", { name: title })
          .locator("img")
          .first()
          .evaluate((el) => (el as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
    await page.goto("/product");
    await expect(page.getByRole("link", { name: title })).toBeVisible();
    await page.goto("/print");
    await expect(page.getByRole("link", { name: title })).toHaveCount(0);
    await page.goto("/?q=e2estudio");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("for “e2estudio”");
    await expect(page.getByRole("link", { name: title })).toBeVisible();

    // Detail view.
    await page.goto(`/posts/${id}`);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(page.getByText("e2estudio")).toBeVisible();
    await expect(page.getByText("800 × 1000")).toBeVisible();
    await expect(page.getByRole("link", { name: /View the original/ })).toHaveAttribute("href", "https://example.com/ledger");
    await expect(page.getByRole("complementary").getByText("Featured", { exact: true })).toBeVisible();
    await expect(page.getByRole("region", { name: "Concept" })).toContainText("cream paper backdrops");
    await expect(page.getByRole("banner")).toBeVisible();
    await page.getByRole("banner").getByRole("link", { name: "Spiffing home" }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto(`/posts/${id}`);

    // Lightbox opens and Escape closes it without leaving the page.
    await page.getByRole("button", { name: /full size/ }).click({ timeout: 15_000 });
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/posts/${id}$`));

    // Escape from the panel returns to the gallery.
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/$/);

    // Edit: rename, drop the source link, swap the avatar.
    await page.goto(`/admin/${id}/edit`);
    await page.getByLabel("Title").fill(`${title} v2`);
    await page.getByLabel(/Original URL/).fill("");
    await page.getByLabel("Feature this piece").uncheck();
    await page.locator("#avatar").setInputFiles(AVATAR);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page).toHaveURL(/\/admin(\?.*)?$/);
    await expect(notice(page)).toContainText("Saved");

    await page.goto(`/posts/${id}`);
    await expect(page.getByRole("heading", { level: 1, name: `${title} v2` })).toBeVisible();
    await expect(page.getByRole("link", { name: /View the original/ })).toHaveCount(0);
    await expect(page.getByRole("complementary").getByText("Featured", { exact: true })).toHaveCount(0);

    // Remove: gone from the desk and the gallery, detail 404s.
    await removePiece(page, id);
    await expect(page.getByRole("row", { name: new RegExp(title) })).toHaveCount(0);
    const res = await page.goto(`/posts/${id}`);
    expect(res?.status()).toBe(404);
    await expect(page.getByText("This piece has left the case.")).toBeVisible();
  });

  test("editing an unknown id shows the not-found page", async ({ page }) => {
    // The desk streams behind a loading skeleton, so the status is already sent;
    // Next marks the response noindex and renders the 404 body instead.
    await page.goto("/admin/does-not-exist/edit");
    await expect(page.getByText("This piece has left the case.")).toBeVisible();
    expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBeGreaterThan(0);
  });

  test("desk search and category filter narrow the table", async ({ page }) => {
    const a = await publish(page, { title: "Search Alpha", description: "first", category: "Web", handle: "alpha" });
    const b = await publish(page, { title: "Search Beta", description: "second", category: "Print", handle: "beta" });

    await page.goto("/admin?q=beta");
    await expect(page.getByRole("row", { name: /Search Beta/ })).toBeVisible();
    await expect(page.getByRole("row", { name: /Search Alpha/ })).toHaveCount(0);

    await page.goto("/admin?category=Web");
    await expect(page.getByRole("row", { name: /Search Alpha/ })).toBeVisible();
    await expect(page.getByRole("row", { name: /Search Beta/ })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Add Web" })).toBeVisible();

    await page.goto("/admin?q=zzzznothing");
    await expect(page.getByText(/Nothing matches/)).toBeVisible();

    await removePiece(page, a);
    await removePiece(page, b);
  });

  test("the artwork drop zone previews and reports the size", async ({ page }) => {
    await page.goto("/admin/new");
    await page.locator("#artwork").setInputFiles(ARTWORK);
    await expect(page.getByText(/800 × 1000/)).toBeVisible();
    await expect(page.getByText(/KB — listing preview crop/)).toBeVisible();
  });
});
