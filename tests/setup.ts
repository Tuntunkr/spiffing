import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeEach } from "vitest";

/**
 * Tests never touch Vercel Blob or the real data/ folder: the store is pointed
 * at a fresh temp directory before every test and the Blob token is blanked.
 */
const root = mkdtempSync(path.join(os.tmpdir(), "vitrine-test-"));
let n = 0;

beforeEach(() => {
  process.env.BLOB_READ_WRITE_TOKEN = "";
  process.env.DATA_DIR = path.join(root, String(n++));
  process.env.ADMIN_EMAIL = "desk@example.com";
  process.env.ADMIN_PASSWORD = "correct-horse-1";
  process.env.ADMIN_SESSION_SECRET = "0123456789abcdef0123456789abcdef";
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});
