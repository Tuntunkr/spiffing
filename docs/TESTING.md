# Testing

Testers: start at [TODO_BEFORE_RUNNING.md](./TODO_BEFORE_RUNNING.md). Use this as the script. Feature IDs match [FEATURES.md](./FEATURES.md).

## Automated (must stay green)

```bash
npm run check        # tsc, eslint, vitest (~99 tests)
npm run test:e2e     # Playwright, 31 specs + 1 skip (slash key on mobile)
```

CI: `.github/workflows/ci.yml` on push/PR to `main`.

E2e uses a **throwaway** `DATA_DIR` and an empty `BLOB_READ_WRITE_TOKEN` so it cannot touch live Blob. Locally it drives installed Chrome (`channel: "chrome"`) because Playwright 1.63 has no Chromium build for older macOS; CI uses bundled Chromium.

| Spec | Covers |
| --- | --- |
| `tests/e2e/gallery.spec.ts` | G1–G4, G9, G10, P1–P5, 404, overflow, mobile |
| `tests/e2e/auth.spec.ts` | A1–A4, lockout |
| `tests/e2e/pieces.spec.ts` | A5–A11, G4 on published work, lightbox |
| `tests/e2e/settings.spec.ts` | A12–A13 |
| `tests/unit/*` | validation, slug, search, session HMAC, lockout math, image headers |
| `tests/integration/actions.test.ts` | create/update/delete against the local store |

## Manual gallery

1. `/` — masthead, chips with counts, sort, footer RSS. **No** Admin link, **no** Join, **no** subscribe, **no** X/Instagram. Desk is `/admin` typed in the address bar.
2. Click Web → URL `/web`, chip `aria-current=page`.
3. Sort Featured on All → `/featured`. Featured inside Web → `/web?sort=Featured`.
4. Search `zzzznothing` → “Nothing matches” + empty shelf.
5. `/` focuses search on desktop.
6. Open a piece — header stays (logo / Gallery go home). Esc closes, arrows move, click image opens lightbox, Esc does **not** leave the page while lightbox is open. Scroll to the ink **Concept** band at the bottom.
7. Piece without original URL has no “View the original”.
8. `/posts/nope` → branded 404.
9. `/feed.xml` is RSS; `/robots.txt` disallows `/admin`.

## Manual desk

1. Logged-out `/admin` → login.
2. Empty submit → field errors, stay on login.
3. Wrong password → “Email or password is wrong.” Email field still filled.
4. Sign in → Pieces. Email visible on desktop. Sign out → login again.
5. New: skip artwork → “Upload the artwork…”. Paste `javascript:alert(1)` as URL → rejected.
6. Drop a JPG — preview shows `W × H`. Publish → green notice, row in table, card on `/` with a **loaded** image (not a broken icon).
7. Edit title, clear URL, save → detail updates, original button gone.
8. Remove → confirm → gone from desk and gallery, detail 404s.
9. Settings: seed is on by default; turn it off → only uploads; on again → sample work returns.
10. Password change in one browser; a second browser already signed in must land on login.

## Visual pass

Walk [VISUAL_GUIDE.md](./VISUAL_GUIDE.md) at 390 and 1440. Fail the build review if:

- A primary button is not an ink pill
- A new grey appears that is not in the token table
- Skeleton shimmer (we pulse)
- Horizontal overflow on `/`
- Clerk, newsletter, or placeholder social links

## Live smoke (after deploy)

```bash
BASE=https://vitrine-fawn.vercel.app
curl -s -o /dev/null -w "%{http_code}\n" $BASE/
curl -s -o /dev/null -w "%{http_code}\n" $BASE/admin/login
curl -s -o /dev/null -w "%{http_code}\n" $BASE/robots.txt
curl -s -o /dev/null -w "%{http_code}\n" $BASE/feed.xml
```

Expect 200. Unknown piece `/posts/nope` expect 404.
