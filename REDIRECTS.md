# Redirects — Spiffing

All listed redirects are permanent (308 from `proxy.ts` / `permanentRedirect`, 308/301 from `next.config`).

`/?category=` and `/?sort=Featured` are rewritten in **one hop** by `proxy.ts` (with the gallery pages as a fallback). They are not listed in `next.config.ts`, because those config redirects would forward `category=` onto `/web` and create a chain.

| From | To | Why | Where |
| --- | --- | --- | --- |
| `/about` | `/what-is` | About is the existing guide route | `next.config.ts` |
| `/rss.xml` | `/feed.xml` | RSS already lives at `/feed.xml` | `next.config.ts` |
| `/?category=Web` | `/web` | Query shelves are not canonical | `proxy.ts` |
| `/?category=Branding` | `/branding` | same | `proxy.ts` |
| `/?category=Product` | `/product` | same | `proxy.ts` |
| `/?category=Motion` | `/motion` | same | `proxy.ts` |
| `/?category=Illustration` | `/illustration` | same | `proxy.ts` |
| `/?category=3D` | `/3d` | same | `proxy.ts` |
| `/?category=Print` | `/print` | same | `proxy.ts` |
| `/?sort=Featured` | `/featured` | Featured is its own shelf | `proxy.ts` |
| `/?category=Web&q=ledger` | `/web?q=ledger` | Keep search, drop the old category param | `proxy.ts` |
| `/web?category=Print` | `/print` | Strip leftover `category=` on a shelf | `proxy.ts` |

Search (`q`) and in-shelf featured (`/web?sort=Featured`) are **not** redirected. They stay on the URL, `noindex, follow`, and canonicalize to the clean shelf (`/web`).

## Not redirected

| URL | Reason |
| --- | --- |
| `/posts/[id]` | Already the public piece URL. Do not invent `/piece/ledger-pricing`. |
| `/what-is` | Canonical about page |
| `/how-to-use` | Canonical tutorial |
| `/admin/*` | Private. Robots disallow + `noindex` |
| Unknown slugs (`/designers/…`) | 404, not a thin landing |

## Custom domain

When `NEXT_PUBLIC_SITE_URL` changes, Vercel should 301 the old Vercel host to the custom domain at the project level. Do not add a second in-app host redirect or you will get a chain.
