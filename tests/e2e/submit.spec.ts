import { writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { JPEG_2x1 } from "../fixtures/images";
import { ARTWORK, login, notice } from "./helpers";

test.describe("public submissions", () => {
  test("header Submit opens the form, pending stays off the gallery, approve publishes to the category tab", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const title = `Public Submit ${Date.now()}`;

    await page.goto("/");
    await page.getByRole("banner").getByRole("link", { name: "Submit", exact: true }).click();
    await expect(page).toHaveURL(/\/submit$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Submit a piece.");

    await page.getByRole("button", { name: "Send for review" }).click();
    await expect(page.getByText("Your name is required.")).toBeVisible();
    await expect(page.getByText("Title is required.")).toBeVisible();
    await expect(page.getByText(/Upload the artwork/)).toBeVisible();

    await page.getByLabel("Your name").fill("https://spam.test");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Title").fill("<script>x</script>");
    await page.getByLabel("Description").fill("ok");
    await page.getByLabel("Original URL").fill("javascript:alert(1)");
    await page.getByRole("button", { name: "Send for review" }).click();
    await expect(page.getByText(/name, not a link/)).toBeVisible();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
    await expect(page.getByText(/cannot contain HTML/)).toBeVisible();
    await expect(page.getByText(/short sentence/)).toBeVisible();
    await expect(page.getByText(/full http\(s\) link/)).toBeVisible();

    const tiny = path.join(os.tmpdir(), `tiny-submit-${Date.now()}.jpg`);
    writeFileSync(tiny, JPEG_2x1);
    await page.locator("#artwork").setInputFiles(tiny);
    await expect(page.getByText(/at least 400px/i)).toBeVisible();

    await page.getByLabel(/Original URL/).fill("");
    await page.getByLabel("Your name").fill("Priya Sharma");
    await page.getByLabel("Email").fill("priya@studio.com");
    await page.getByLabel("Category").selectOption("Print");
    await page.getByLabel("Title").fill(title);
    await page.getByLabel("Description").fill("A public print piece waiting on the desk.");
    await page.getByLabel("Handle").fill("priyastudio");
    await page.locator("#artwork").setInputFiles(ARTWORK);
    await expect(page.getByText(/800 × 1000/)).toBeVisible();
    await page.getByRole("button", { name: "Send for review" }).click();

    await expect(page).toHaveURL(/\/submit\/thanks$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Sent for review.");

    await page.goto("/");
    await expect(page.getByRole("link", { name: title })).toHaveCount(0);
    await page.goto("/print");
    await expect(page.getByRole("link", { name: title })).toHaveCount(0);

    await login(page);
    await page.getByRole("navigation", { name: "Desk" }).getByRole("link", { name: /Inbox/ }).click();
    await expect(page).toHaveURL(/\/admin\/submissions/);
    const row = page.getByRole("row", { name: new RegExp(title) });
    await expect(row).toBeVisible();
    await expect(row.getByText("Pending")).toBeVisible();
    await row.getByRole("link", { name: "Review" }).click();

    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(page.getByText("priya@studio.com")).toBeVisible();
    await page.getByRole("button", { name: "Approve and publish" }).click();
    await expect(page).toHaveURL(/\/admin\/submissions/);
    await expect(notice(page)).toContainText("Approved");

    await page.goto("/print");
    await expect(page.getByRole("link", { name: title })).toBeVisible();
    await page.goto("/web");
    await expect(page.getByRole("link", { name: title })).toHaveCount(0);
  });

  test("the desk can reject a pending piece so it never reaches a shelf", async ({ page }) => {
    test.setTimeout(60_000);
    const title = `Reject Me ${Date.now()}`;

    await page.goto("/submit");
    await page.getByLabel("Your name").fill("Arjun Mehta");
    await page.getByLabel("Email").fill("arjun@studio.com");
    await page.getByLabel("Category").selectOption("Web");
    await page.getByLabel("Title").fill(title);
    await page.getByLabel("Description").fill("A piece that will be turned down.");
    await page.getByLabel("Handle").fill("arjunstudio");
    await page.locator("#artwork").setInputFiles(ARTWORK);
    await page.getByRole("button", { name: "Send for review" }).click();
    await expect(page).toHaveURL(/\/submit\/thanks$/);

    await login(page);
    await page.goto("/admin/submissions");
    await page.getByRole("row", { name: new RegExp(title) }).getByRole("link", { name: "Review" }).click();
    page.once("dialog", (d) => d.accept());
    await page.getByLabel(/Reason/).fill("Too close to existing work.");
    await page.getByRole("button", { name: "Reject" }).click();
    await expect(notice(page)).toContainText("Rejected");

    await page.goto("/");
    await expect(page.getByRole("link", { name: title })).toHaveCount(0);
  });
});
