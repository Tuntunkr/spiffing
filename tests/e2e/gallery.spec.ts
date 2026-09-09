import { expect, test } from "@playwright/test";

/**
 * Public surface. Runs on desktop and mobile, and can be pointed at a deployed
 * site with E2E_BASE_URL. Seed work is on by default so every category tab has
 * pieces; search still covers the empty-filter path.
 */
test.describe("public gallery", () => {
  test("home renders the masthead, filters and footer", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Spiffing/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Design worth keeping.");
    await expect(page.getByRole("main").getByRole("link", { name: "How to use" })).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "What is this" })).toBeVisible();
    const filters = page.getByRole("navigation", { name: "Filter by category" });
    for (const chip of ["All", "Web", "Branding", "Product", "Motion", "Illustration", "3D", "Print"]) {
      await expect(filters.getByRole("link", { name: new RegExp(`^${chip}\\s*\\d+$`) })).toBeVisible();
    }
    await expect(page.getByRole("contentinfo")).toContainText("Spiffing");
    await expect(page.getByRole("link", { name: "RSS feed" })).toBeVisible();
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "What is this" })).toBeVisible();
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "How to use" })).toBeVisible();
  });

  test("every category tab has pieces to browse", async ({ page }) => {
    await page.goto("/");
    test.skip(
      await page.getByText("The archive is empty").isVisible(),
      "this target has no seed or catalog",
    );
    const filters = page.getByRole("navigation", { name: "Filter by category" });
    const slugs: Record<string, string> = {
      Web: "web",
      Branding: "branding",
      Product: "product",
      Motion: "motion",
      Illustration: "illustration",
      "3D": "3d",
      Print: "print",
    };
    for (const chip of ["Web", "Branding", "Product", "Motion", "Illustration", "3D", "Print"]) {
      await filters.getByRole("link", { name: new RegExp(`^${chip}\\s`) }).click();
      await expect(page).toHaveURL(new RegExp(`/${slugs[chip]}$`));
      await expect(page.getByText("The archive is empty")).toHaveCount(0);
      await expect(page.getByText("Nothing on this shelf")).toHaveCount(0);
      const cards = page.locator(".feed-grid article");
      await expect(cards.first()).toBeVisible();
      expect(await cards.count()).toBeGreaterThanOrEqual(2);
      await expect(cards.first().getByRole("heading", { level: 2 })).toBeVisible();
    }
  });

  test("category and sort are reflected in the URL and the active chip", async ({ page }) => {
    await page.goto("/");
    const filters = page.getByRole("navigation", { name: "Filter by category" });
    await filters.getByRole("link", { name: /^Web/ }).click();
    await expect(page).toHaveURL(/\/web$/);
    await expect(filters.getByRole("link", { name: /^Web/ })).toHaveAttribute("aria-current", "page");

    await page.getByRole("button", { name: /Sort/ }).or(page.getByRole("button", { name: "Latest" })).first().click();
    await page.getByRole("menuitem", { name: "Featured" }).click();
    await expect(page).toHaveURL(/\/web\?sort=Featured$/);

    await filters.getByRole("link", { name: /^All/ }).click();
    await expect(page).toHaveURL(/\/featured$/);
  });

  test("search is a plain GET and shows a result heading", async ({ page }) => {
    await page.goto("/web");
    const box = page.getByRole("searchbox", { name: "Search the archive" });
    await box.fill("zzzz-no-such-piece");
    await box.press("Enter");
    await expect(page).toHaveURL(/\/web\?q=zzzz-no-such-piece$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Nothing matches");
    await expect(page.getByText("Nothing on this shelf")).toBeVisible();
    await page.getByRole("link", { name: "Clear search" }).first().click();
    await expect(page).toHaveURL(/\/web$/);
  });

  test("the slash key focuses search", async ({ page, isMobile }) => {
    test.skip(isMobile, "no physical keyboard");
    await page.goto("/");
    const box = page.getByRole("searchbox", { name: "Search the archive" });
    // The shortcut is wired up on hydration; retry until the client is live.
    await expect(async () => {
      await page.locator("body").click({ position: { x: 5, y: 5 } });
      await page.keyboard.press("/");
      await expect(box).toBeFocused({ timeout: 500 });
    }).toPass({ timeout: 10_000 });
    await expect(box).toHaveValue("");
  });

  test("guide pages explain the archive and how to use it", async ({ page }) => {
    await page.goto("/what-is");
    await expect(page).toHaveTitle(/About Spiffing/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("What is Spiffing?");
    await page.getByRole("link", { name: "How to use it" }).click();
    await expect(page).toHaveURL(/\/how-to-use$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("How to browse the archive.");
    await expect(page.getByRole("main").getByRole("heading", { level: 2, name: "Browse" })).toBeVisible();
    await expect(page.getByRole("main").getByRole("heading", { level: 2, name: "Publish" })).toBeVisible();
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Gallery" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("unknown routes get the branded 404", async ({ page }) => {
    const res = await page.goto("/posts/this-does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByText("This piece has left the case.")).toBeVisible();
    await page.getByRole("link", { name: "Back to the gallery" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("feeds and crawl files are served", async ({ request }) => {
    const rss = await request.get("/feed.xml");
    expect(rss.status()).toBe(200);
    expect(rss.headers()["content-type"]).toContain("application/rss+xml");
    expect(await rss.text()).toContain("<rss");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const sitemapBody = await sitemap.text();
    expect(sitemapBody).toContain("/what-is");
    expect(sitemapBody).toContain("/how-to-use");
    expect(sitemapBody).toContain("/web");
    expect(sitemapBody).not.toContain("?category=");

    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    const body = await robots.text();
    expect(body).toContain("Disallow: /admin");
    expect(body).toContain("Sitemap:");

    const og = await request.get("/opengraph-image");
    expect(og.status()).toBe(200);
    expect(og.headers()["content-type"]).toContain("image/png");

    const icon = await request.get("/icon.svg");
    expect(icon.status()).toBe(200);
  });

  test("admin is not linked in public chrome and is only reached by URL", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("banner").getByRole("link", { name: "Admin" })).toHaveCount(0);
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Desk sign in" })).toHaveCount(0);

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByRole("heading", { level: 1, name: "Desk" })).toBeVisible();
  });

  test("has no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});
