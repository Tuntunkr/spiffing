# API reference

There is no public JSON API. Mutations are Next.js server actions. These are the HTTP surfaces testers and integrators can hit.

## Pages

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/` | public | `category`, `sort`, `q` |
| GET | `/posts/[id]` | public | 404 if missing |
| GET | `/admin/login` | public | Redirects if already in |
| GET | `/admin` | cookie | Pieces |
| GET | `/admin/new` | cookie | Form |
| GET | `/admin/[id]/edit` | cookie | 404 body if unknown (streamed) |
| GET | `/admin/settings` | cookie | Seed + password |
| GET | `/studio/[[...tool]]` | public | Only useful with Sanity env |

Unauthenticated desk URLs redirect to `/admin/login`.

## Documents and assets

| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| GET | `/feed.xml` | RSS 2.0 | Dynamic, 50 items |
| GET | `/sitemap.xml` | xml | Home, categories, posts |
| GET | `/robots.txt` | txt | Disallow `/admin`, `/api/`, `/studio` |
| GET | `/icon.svg` | svg | |
| GET | `/opengraph-image` | png 1200×630 | |
| GET | `/uploads/[name]` | image | Local disk only; 404 if odd name |
| POST | `/api/revalidate` | Sanity signature | Busts gallery cache |

## Server actions

All `'use server'`. Desk actions call `requireAdmin()` first.

| Action | File | Result |
| --- | --- | --- |
| `loginAdmin` | `app/admin/auth-actions.ts` | Cookie + redirect, or `{ error, fields, email }` |
| `logoutAdmin` | same | Clear cookie → login |
| `createPiece` | `app/admin/actions.ts` | Redirect `?published=` |
| `updatePiece` | same | Redirect `?updated=` |
| `deletePiece` | same | Redirect `?removed=1` |
| `changeAdminPassword` | `app/admin/settings-actions.ts` | `{ ok }` + new cookie |
| `updateSeedVisibility` | same | `{ ok }` + `revalidatePath` |

Piece FormData keys: `title`, `description`, `category`, `handle`, `sourceUrl`, `slides`, `featured` (`on`), `artwork`, `avatar`, `id` (edit only).

## Cookie

| Name | `vitrine_admin` |
| --- | --- |
| httpOnly | yes |
| sameSite | strict |
| path | `/` |
| maxAge | 7 days |
| secure | production unless `SESSION_COOKIE_SECURE=false` |

Payload: base64url JSON `{ email, exp, pv }` + HMAC-SHA256.

## Errors testers will see (verbatim)

| Situation | Message |
| --- | --- |
| Missing env | Desk login is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET. |
| Bad credentials | Email or password is wrong. |
| Lockout | Too many attempts. Try again in N minutes. |
| Bad artwork type | Use a JPG, PNG, WebP or GIF. |
| Too large | Image must be under 8 MB. |
| Bytes ≠ type | The file is not a JPG/PNG/… |
| Empty source vs junk | Enter a full http(s) link, or leave it empty. |
