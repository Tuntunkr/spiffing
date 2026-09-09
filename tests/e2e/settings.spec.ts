import { expect, test } from "@playwright/test";
import { E2E_ADMIN } from "../../playwright.config";
import { formAlert, login, notice } from "./helpers";

test.describe("desk settings", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("seed toggle changes what the public gallery shows", async ({ page }) => {
    const restoreSeed = async () => {
      await page.goto("/admin/settings");
      await page.getByLabel(/Show the built-in seed archive/).check();
      await page.getByRole("button", { name: "Save shelf" }).click();
      await expect(notice(page)).toContainText("updated");
    };

    try {
      await page.goto("/");
      await expect(page.getByText("The archive is empty")).toHaveCount(0);
      await expect(page.locator(".feed-grid article").first()).toBeVisible();

      await page.goto("/admin/settings");
      await page.getByLabel(/Show the built-in seed archive/).uncheck();
      await page.getByRole("button", { name: "Save shelf" }).click();
      await expect(notice(page)).toContainText("updated");

      await page.goto("/");
      await expect(page.getByRole("link", { name: "Ledger — pricing" })).toHaveCount(0);

      await restoreSeed();

      await page.goto("/");
      await expect(page.getByText("The archive is empty")).toHaveCount(0);
      await expect(page.locator(".feed-grid article").first()).toBeVisible();
    } finally {
      await restoreSeed().catch(() => undefined);
    }
  });

  test("password change validates, applies, and invalidates other sessions", async ({ page, browser }) => {
    await page.goto("/admin/settings");

    // Client-side rules.
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(page.getByText("Current password is required.")).toBeVisible();
    await page.getByLabel("Current password").fill(E2E_ADMIN.password);
    await page.getByLabel("New password", { exact: true }).fill("weak");
    await page.getByLabel("Confirm new password").fill("weak2");
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(page.getByText(/at least 8 characters/)).toBeVisible();
    await expect(page.getByText("The two new passwords do not match.")).toBeVisible();

    // Wrong current password is caught server-side.
    await page.getByLabel("Current password").fill("not-the-password-1");
    await page.getByLabel("New password", { exact: true }).fill("brand-new-pass-2");
    await page.getByLabel("Confirm new password").fill("brand-new-pass-2");
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(page.getByText("Current password is wrong.")).toBeVisible();

    // A second browser session, signed in before the change.
    const other = await browser.newContext();
    const otherPage = await other.newPage();
    await login(otherPage);

    // Real change.
    await page.getByLabel("Current password").fill(E2E_ADMIN.password);
    await page.getByLabel("New password", { exact: true }).fill("brand-new-pass-2");
    await page.getByLabel("Confirm new password").fill("brand-new-pass-2");
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(notice(page)).toContainText("Password updated");

    // This session survives; the other one is signed out.
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin$/);
    await otherPage.goto("/admin");
    await expect(otherPage).toHaveURL(/\/admin\/login$/);
    await other.close();

    // Old password fails, new one works.
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.getByLabel("Email").fill(E2E_ADMIN.email);
    await page.getByLabel("Password", { exact: true }).fill(E2E_ADMIN.password);
    await page.getByRole("button", { name: "Sign in to the desk" }).click();
    await expect(formAlert(page)).toHaveText("Email or password is wrong.");
    // The address is kept after a failed attempt; only the password needs retyping.
    await expect(page.getByLabel("Email")).toHaveValue(E2E_ADMIN.email);
    await page.getByLabel("Password", { exact: true }).fill("brand-new-pass-2");
    await page.getByRole("button", { name: "Sign in to the desk" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    // Restore the original password so the other specs keep working.
    await page.goto("/admin/settings");
    await page.getByLabel("Current password").fill("brand-new-pass-2");
    await page.getByLabel("New password", { exact: true }).fill(E2E_ADMIN.password);
    await page.getByLabel("Confirm new password").fill(E2E_ADMIN.password);
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(notice(page)).toContainText("Password updated");
  });
});
