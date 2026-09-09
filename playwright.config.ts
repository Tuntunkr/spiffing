import { mkdtempSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

/**
 * E2E runs against a production build on its own port with its own throwaway
 * data directory. The Blob token is blanked explicitly (an empty value beats
 * .env.local) so nothing here can touch the live store. Set E2E_BASE_URL to
 * run the public-gallery specs against a deployed site instead.
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const dataDir = mkdtempSync(path.join(os.tmpdir(), "spiffing-e2e-"));

/**
 * CI uses Playwright's bundled Chromium. Locally, default to the installed
 * Google Chrome so the suite runs on macOS versions Playwright no longer ships
 * a Chromium for. Override with PW_CHANNEL=chromium.
 */
const channel = process.env.CI ? undefined : (process.env.PW_CHANNEL ?? "chrome");
const browser = channel === "chromium" ? {} : { channel };

export const E2E_ADMIN = {
  email: "desk@example.com",
  password: "correct-horse-1",
};

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  timeout: 30_000,
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], ...browser } },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], ...browser },
      testMatch: /gallery\.spec\.ts/,
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run build && npx next start -p ${PORT}`,
        url: baseURL,
        timeout: 240_000,
        reuseExistingServer: false,
        env: {
          BLOB_READ_WRITE_TOKEN: "",
          DATA_DIR: dataDir,
          ADMIN_EMAIL: E2E_ADMIN.email,
          ADMIN_PASSWORD: E2E_ADMIN.password,
          ADMIN_SESSION_SECRET: "e2e-session-secret-0123456789abcdef",
          SESSION_COOKIE_SECURE: "false",
          NEXT_PUBLIC_SITE_URL: baseURL,
        },
      },
});
