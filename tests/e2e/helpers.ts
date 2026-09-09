import path from "node:path";
import { expect, type Locator, type Page } from "@playwright/test";
import { E2E_ADMIN } from "../../playwright.config";

export const FIXTURES = path.join(__dirname, "fixtures");
export const ARTWORK = path.join(FIXTURES, "e2e-artwork.jpg");
export const AVATAR = path.join(FIXTURES, "e2e-avatar.png");

/** The form's own alert, not Next's route announcer (which is also role=alert). */
export function formAlert(page: Page): Locator {
  return page.locator("form [role='alert']");
}

/** Transient desk confirmation after a redirect. */
export function notice(page: Page): Locator {
  return page.locator("main [role='status']");
}

export async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(E2E_ADMIN.email);
  await page.getByLabel("Password", { exact: true }).fill(E2E_ADMIN.password);
  await page.getByRole("button", { name: "Sign in to the desk" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

export async function publish(
  page: Page,
  piece: {
    title: string;
    description: string;
    concept?: string;
    category: string;
    handle: string;
    sourceUrl?: string;
    featured?: boolean;
  },
): Promise<string> {
  await page.goto("/admin/new");
  await page.getByLabel("Category").selectOption(piece.category);
  await page.getByLabel("Title").fill(piece.title);
  await page.getByLabel("Description").fill(piece.description);
  if (piece.concept !== undefined) await page.getByLabel(/^Concept/).fill(piece.concept);
  await page.getByLabel("Handle").fill(piece.handle);
  if (piece.sourceUrl !== undefined) await page.getByLabel(/Original URL/).fill(piece.sourceUrl);
  if (piece.featured) await page.getByLabel("Feature this piece").check();
  await page.locator("#artwork").setInputFiles(ARTWORK);
  await expect(page.getByText(/800 × 1000/)).toBeVisible();
  await page.getByRole("button", { name: "Publish to gallery" }).click();

  // The notice strips ?published= from the URL as soon as it mounts, so read
  // the id from the row's edit link rather than the address bar.
  await expect(page).toHaveURL(/\/admin(\?.*)?$/);
  await expect(notice(page)).toContainText("Published");
  const href = await page
    .getByRole("row", { name: new RegExp(piece.title) })
    .getByRole("link", { name: "Edit" })
    .getAttribute("href");
  return href!.match(/^\/admin\/(.+)\/edit$/)![1];
}

export async function removePiece(page: Page, id: string) {
  await page.goto(`/admin/${id}/edit`);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page).toHaveURL(/\/admin(\?.*)?$/);
  await expect(notice(page)).toContainText("Removed");
}
