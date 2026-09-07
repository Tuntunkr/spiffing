import { expect, test } from "@playwright/test";

/**
 * Public surface. Runs on desktop and mobile, and can be pointed at a deployed
 * site with E2E_BASE_URL. Content-agnostic: it does not assume any piece exists.
 */
test.describe("public gallery", () => {
  test("home renders the masthead, filters and footer", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Vitrine/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Design worth keeping.");
    const filters = page.getByRole("navigation", { name: "Filter by category" });
    for (const chip of ["All", "Web", "Branding", "Product", "Motion", "Illustration", "3D", "Print"]) {
      await expect(filters.getByRole("link", { name: new RegExp(`^${chip}\\s*\\d+$`) })).toBeVisible();
    }
    await expect(page.getByRole("contentinfo")).toContainText("Vitrine");
    await expect(page.getByRole("link", { name: "RSS feed" })).toBeVisible();
  });

  test("category and sort are reflected in the URL and the active chip", async ({ page }) => {
    await page.goto("/");
    const filters = page.getByRole("navigation", { name: "Filter by category" });
    await filters.getByRole("link", { name: /^Web/ }).click();
    await expect(page).toHaveURL(/\?category=Web$/);
    await expect(filters.getByRole("link", { name: /^Web/ })).toHaveAttribute("aria-current", "page");

    await page.getByRole("button", { name: /Sort/ }).or(page.getByRole("button", { name: "Latest" })).first().click();
    await page.getByRole("menuitem", { name: "Featured" }).click();
    await expect(page).toHaveURL(/category=Web&sort=Featured$/);

    await filters.getByRole("link", { name: /^All/ }).click();
    await expect(page).toHaveURL(/\/\?sort=Featured$/);
  });

  test("search is a plain GET and shows a result heading", async ({ page }) => {
    await page.goto("/?category=Web");
    const box = page.getByRole("searchbox", { name: "Search the archive" });
    await box.fill("zzzz-no-such-piece");
    await box.press("Enter");
    await expect(page).toHaveURL(/category=Web&q=zzzz-no-such-piece$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Nothing matches");
    await expect(page.getByText("Nothing on this shelf")).toBeVisible();
    await page.getByRole("link", { name: "Clear search" }).first().click();
    await expect(page).toHaveURL(/\?category=Web$/);
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
    expect(await sitemap.text()).toContain("<urlset");

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

  test("admin is reachable from the header and lands on login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("banner").getByRole("link", { name: "Admin" }).click();
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
