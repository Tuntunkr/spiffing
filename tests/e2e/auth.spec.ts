import { expect, test } from "@playwright/test";
import { E2E_ADMIN } from "../../playwright.config";
import { formAlert, login } from "./helpers";

test.describe("desk authentication", () => {
  test("protected routes redirect to the login page", async ({ page }) => {
    for (const route of ["/admin", "/admin/new", "/admin/settings", "/admin/submissions", "/admin/submissions/ghost", "/admin/ghost/edit"]) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/admin\/login$/);
    }
  });

  test("client validation blocks empty and malformed input", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByRole("button", { name: "Sign in to the desk" }).click();
    await expect(page.getByText("Email is required.")).toBeVisible();
    await expect(page.getByText("Password is required.")).toBeVisible();

    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password", { exact: true }).fill("short");
    await page.getByRole("button", { name: "Sign in to the desk" }).click();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
    await expect(page.getByText(/at least 8 characters/)).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("wrong password is rejected without revealing which field", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(E2E_ADMIN.email);
    await page.getByLabel("Password", { exact: true }).fill("wrong-horse-9");
    await page.getByRole("button", { name: "Sign in to the desk" }).click();
    await expect(formAlert(page)).toHaveText("Email or password is wrong.");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("show/hide password toggle works", async ({ page }) => {
    await page.goto("/admin/login");
    const field = page.getByLabel("Password", { exact: true });
    await expect(field).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Show" }).click();
    await expect(field).toHaveAttribute("type", "text");
  });

  test("signs in, shows the desk, signs out and is locked out again", async ({ page }) => {
    await login(page);
    await expect(page.getByRole("heading", { level: 1, name: "Pieces" })).toBeVisible();
    await expect(page.getByText(E2E_ADMIN.email).first()).toBeVisible();

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);
    await page.goto("/admin/new");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("an already signed-in admin skips the login page", async ({ page }) => {
    await login(page);
    await page.goto("/admin/login");
    await expect(page).toHaveURL(/\/admin$/, { timeout: 10_000 });
  });

  test("a tampered session cookie is ignored", async ({ page, context }) => {
    await login(page);
    const cookies = await context.cookies();
    const session = cookies.find((c) => c.name === "spiffing_admin")!;
    await context.clearCookies();
    await context.addCookies([{ ...session, value: `${session.value.slice(0, -4)}AAAA` }]);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

});

test.describe("login lockout", () => {
  // Failures are counted per account and per client address. Give this spec
  // its own address so the lockout it triggers cannot bleed into other specs.
  test.use({ extraHTTPHeaders: { "x-forwarded-for": "203.0.113.77" } });

  test("locks the account after five bad attempts", async ({ page }) => {
    const email = "lockout@example.com";
    await page.goto("/admin/login");
    for (let i = 0; i < 5; i++) {
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password", { exact: true }).fill(`wrong-pass-${i}`);
      await page.getByRole("button", { name: "Sign in to the desk" }).click();
      await expect(formAlert(page)).toHaveText("Email or password is wrong.");
    }
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("wrong-pass-9");
    await page.getByRole("button", { name: "Sign in to the desk" }).click();
    await expect(formAlert(page)).toHaveText(/Too many attempts/);

    // The same address is now blocked for any account, including the real one.
    await page.getByLabel("Email").fill(E2E_ADMIN.email);
    await page.getByLabel("Password", { exact: true }).fill(E2E_ADMIN.password);
    await page.getByRole("button", { name: "Sign in to the desk" }).click();
    await expect(formAlert(page)).toHaveText(/Too many attempts/);
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});
