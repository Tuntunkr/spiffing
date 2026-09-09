import { expect, test } from "@playwright/test";

const SHELVES = [
  { path: "/web", title: /Web Design Inspiration/, h1: "Web." },
  { path: "/branding", title: /Branding Inspiration/, h1: "Branding." },
  { path: "/product", title: /Product Design Inspiration/, h1: "Product." },
  { path: "/motion", title: /Motion Design Inspiration/, h1: "Motion." },
  { path: "/illustration", title: /Illustration Inspiration/, h1: "Illustration." },
  { path: "/3d", title: /3D Design Inspiration/, h1: "3D." },
  { path: "/print", title: /Print Design Inspiration/, h1: "Print." },
  { path: "/featured", title: /Featured Design/, h1: "Featured." },
];

async function jsonLd(page: { locator: (sel: string) => { allTextContents: () => Promise<string[]> } }) {
  return (await page.locator('script[type="application/ld+json"]').allTextContents()).join("\n");
}

test.describe("public SEO", () => {
  test("homepage is indexable with a unique title, description, H1 and canonical", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Spiffing — Design Worth Keeping");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /curated archive of interface/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /localhost:3100\/?$/);
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots ?? "").not.toMatch(/noindex/i);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Design worth keeping.");
    const graph = await jsonLd(page);
    expect(graph).toContain("WebSite");
    expect(graph).toContain("Organization");
  });

  test("every shelf has unique metadata, an H1 and JSON-LD", async ({ page }) => {
    for (const shelf of SHELVES) {
      await page.goto(shelf.path);
      await expect(page).toHaveTitle(shelf.title);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${shelf.path}$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(shelf.h1);
      const graph = await jsonLd(page);
      expect(graph).toContain("CollectionPage");
      expect(graph).toContain("BreadcrumbList");
      expect(graph).not.toContain("aggregateRating");
    }
  });

  test("search and mixed filters stay noindex", async ({ page }) => {
    await page.goto("/?q=dashboard");
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
    await page.goto("/web?sort=Featured");
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
  });

  test("old category query URLs move to clean shelves", async ({ page }) => {
    await page.goto("/?category=Web");
    await expect(page).toHaveURL(/\/web$/);
    await page.goto("/?category=Web&q=ledger");
    await expect(page).toHaveURL(/\/web\?q=ledger$/);
  });

  test("a piece page has unique metadata, breadcrumbs and CreativeWork schema", async ({ page }) => {
    await page.goto("/posts/v-1");
    await expect(page).toHaveTitle(/Ledger — pricing/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/posts\/v-1$/);
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    const graph = await jsonLd(page);
    expect(graph).toContain("CreativeWork");
    expect(graph).toContain("ImageObject");
    expect(graph).not.toContain("aggregateRating");
    const alts = await page.locator("main img").evaluateAll((imgs) =>
      imgs.map((img) => (img as HTMLImageElement).alt),
    );
    expect(alts.some((alt) => alt.includes("Ledger"))).toBe(true);
  });

  test("guides, 404, sitemap, robots and RSS are in place", async ({ page, request }) => {
    await page.goto("/what-is");
    await expect(page).toHaveTitle(/About Spiffing/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("What is Spiffing?");

    await page.goto("/how-to-use");
    await expect(page).toHaveTitle(/How to Use Spiffing/);
    expect(await jsonLd(page)).toContain("HowTo");

    const missing = await page.goto("/posts/this-does-not-exist");
    expect(missing?.status()).toBe(404);
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const map = await sitemap.text();
    expect(map).toContain("/web");
    expect(map).toContain("/featured");
    expect(map).toContain("/posts/");
    expect(map).not.toContain("?category=");
    expect(map).not.toContain("/admin");

    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    const body = await robots.text();
    expect(body).toContain("Disallow: /admin");
    expect(body).toContain("Sitemap:");

    const rss = await request.get("/feed.xml");
    expect(rss.status()).toBe(200);
    expect(await rss.text()).toContain("<rss");

    await page.goto("/about");
    await expect(page).toHaveURL(/\/what-is$/);
  });
});
