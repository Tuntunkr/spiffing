# SEO Audit — Spiffing

**Live URL:** https://vitrine-fawn.vercel.app  
**Audited:** 8 September 2026  
**Stack:** Next.js 16.3 App Router, React 19, TypeScript  
**Scope:** Full technical + on-page + analytics audit of the production site and this repository.

This document records the **before** state. Implemented fixes are listed in [SEO-IMPLEMENTATION-REPORT.md](./SEO-IMPLEMENTATION-REPORT.md).

---

## Executive summary

Spiffing already had a real SEO foundation: `metadataBase`, per-route canonicals, filtered views `noindex`, a dynamic sitemap, robots, RSS, OG image generation, and `lang="en"`. It was **not** production-complete.

The highest-impact gaps were:

1. **Category URLs were query strings** (`/?category=Web`), so unique category metadata could not be a stable, indexable URL.
2. **No JSON-LD** anywhere.
3. **Production sitemap returned HTTP 500** at audit time.
4. **No analytics** (GA4, Search Console, Bing, Vercel Analytics, Speed Insights).
5. **Infinite scroll hid pieces 17+ from the initial HTML.**
6. **Global title/description leaked onto pages** that only set a title.
7. **Images used empty `alt=""`** on cards and hero stills.

Overall health before this work: **partial / 5.5 of 10**. Crawlable, but thin on entity signals, category landing pages, and measurement.

---

## Site context

| Item | Value |
| --- | --- |
| Product | Curated design archive (interface, brand, print, product, motion, illustration, 3D) |
| Brand | Spiffing |
| Content | ~60 seed pieces + optional desk uploads / Sanity |
| Router | App Router only (`app/`). No Pages Router. |
| Public routes | `/`, `/what-is`, `/how-to-use`, `/posts/[id]`, `/feed.xml` |
| Private routes | `/admin/*`, `/studio/*`, `/api/*` |
| Data | `lib/posts.ts` → catalog + Sanity + seed |
| Piece IDs | Stable slugs such as `v-1` (`/posts/v-1`), not query IDs |

Primary SEO goals: brand discovery, design-archive and category inspiration queries, and unique piece pages.

---

## Current implementation (before)

### What already existed (keep)

| Area | Status | Notes |
| --- | --- | --- |
| HTTPS / Vercel | Pass | Live on `vitrine-fawn.vercel.app` |
| `metadataBase` | Pass | `lib/site.ts` → `siteUrl()` |
| Homepage H1 | Pass | “Design worth keeping.” |
| Homepage title | Partial | `Spiffing — Design worth keeping` |
| Piece metadata | Partial | Title + description + canonical + OG image URL |
| Filter/search robots | Pass | `noindex, follow` when `q`, category, or non-default sort is set |
| Admin robots | Pass | `noindex, follow: false` |
| RSS | Pass | `/feed.xml`, valid RSS 2.0, absolute links |
| Default OG image | Pass | `app/opengraph-image.tsx` 1200×630 |
| Icons | Partial | `app/icon.svg`, `app/apple-icon.tsx` |
| Fonts | Pass | `next/font` Inter + Montserrat, `display: swap` |
| Viewport / theme | Pass | `themeColor: #faf9f7` |
| 404 status | Pass | Unknown `/posts/[id]` returns HTTP 404 |
| Related pieces | Partial | Same category, limit 3, newest first |
| Internal footer links | Pass | Categories, guides, RSS, sitemap |
| Search is GET | Pass | Works without JS |
| `lang="en"` | Pass | Root layout |

### Architecture notes

- **App Router, server-rendered pages.** Titles, H1s, cards (first 16), and guides are in HTML. Good.
- **Categories were not routes.** `galleryHref()` built `/?category=Web`. Sitemap listed those query URLs as if they were canonical category pages, while `generateMetadata` marked them `noindex`. That is a contradiction: sitemap said “index this”, robots/meta said “do not”.
- **Piece URLs `/posts/[id]` are clean enough.** Do not invent `/piece/ledger-pricing` — that would create a second URL for the same work.
- **About is `/what-is`.** Keep as canonical; `/about` should redirect.
- **RSS is `/feed.xml`.** Keep; add discovery + `/rss.xml` redirect.
- **No designer or tag routes.** Handles exist (`studioquiet`, etc.) but pages would be thin. Do not index them.

---

## Findings

### Technical SEO

| ID | Issue | Impact | Evidence | Priority |
| --- | --- | --- | --- | --- |
| T1 | Production `/sitemap.xml` returned **500** | High — Google cannot ingest the URL list | Live fetch 8 Sep 2026 | **P0** |
| T2 | Sitemap included `noindex` category query URLs | High — conflicting signals | `app/sitemap.ts` + `generateMetadata` | **P0** |
| T3 | No indexable category URLs (`/web`, `/branding`, …) | High — cannot rank category intent | `lib/gallery-url.ts` | **P0** |
| T4 | `/?q=` search is noindex (good) but form still posts to `/` with hidden `category` | Medium — duplicate URL shapes | `SearchForm.tsx` | **P1** |
| T5 | Robots blocks admin/studio/api (good) but does not mention search params; does not allow assets explicitly (fine) | Low | Live `robots.txt` | **P2** |
| T6 | No `site.webmanifest` | Low | No `app/manifest.ts` | **P2** |
| T7 | 404 page has no category/search recovery links | Medium | `app/not-found.tsx` | **P1** |
| T8 | No documented redirects (`/about`, old query URLs, `/rss.xml`) | Medium | No `next.config` redirects | **P1** |
| T9 | Infinite scroll: first HTML paint is 16 cards; rest require JS scroll | High for crawl of homepage grid | `Feed.tsx` `PAGE = 16` | **P1** |
| T10 | Trailing-slash policy is default (no slash). Canonicals are consistent if we keep that. | — | Next default | — |
| T11 | `siteUrl()` can resolve to a preview host if `NEXT_PUBLIC_SITE_URL` is unset | Medium — wrong canonicals on previews | `lib/site.ts` | **P1** |

### Metadata

| ID | Issue | Impact | Evidence | Priority |
| --- | --- | --- | --- | --- |
| M1 | Root layout title default is `Spiffing`, not the recommended brand title | Medium | `app/layout.tsx` | **P1** |
| M2 | Guide pages only set `title` + `description` + canonical. No unique OG/Twitter, no authors/publisher | Medium | `what-is`, `how-to-use` | **P1** |
| M3 | Homepage filtered views reuse near-duplicate titles (`“q” · Web`) | Low (already noindex) | `generateMetadata` | **P2** |
| M4 | Piece titles are `{title} — Spiffing` via template; missing category/design-type qualifier | Medium | `posts/[id]/page.tsx` | **P1** |
| M5 | Piece OG uses raw artwork URL (good) but no generated 1200×630 fallback | Low | same | **P2** |
| M6 | No RSS `<link rel="alternate">` in document head | Medium | `layout.tsx` | **P1** |
| M7 | No `verification` keys for GSC / Bing | High for setup | `layout.tsx` | **P1** |
| M8 | Keywords unused (correct to avoid stuffing); no keyword map | Medium | missing doc | **P2** |
| M9 | What-is / how-to-use titles are generic (“What is this”, “How to use”) | Medium | live titles | **P1** |

### Content / on-page

| ID | Issue | Impact | Evidence | Priority |
| --- | --- | --- | --- | --- |
| C1 | Category “pages” have almost no unique copy (“N pieces on this shelf.”) | High | gallery page | **P1** |
| C2 | What-is H1 is not the brand question (“Design guidance a visitor can browse.”) | Medium | live `/what-is` | **P1** |
| C3 | What-is lacks explicit curation, cadence, attribution, rights | Medium | page copy | **P1** |
| C4 | How-to-use is a genuine step list but has no HowTo/Breadcrumb schema | Medium | page | **P1** |
| C5 | Card and hero images use `alt=""` | High for image search + a11y | `PostCard`, `GalleryHero` | **P0** |
| C6 | Related rail is category-only, newest, max 3 | Medium | `getRelated` | **P2** |
| C7 | No visible breadcrumbs on piece or guide pages | Medium | `PostPanel` | **P1** |
| C8 | Piece pages do not expose a crawlable list of remaining archive links beyond 3 related | Low | detail page | **P2** |
| C9 | No designer/tag landings — correctly omitted (thin) | — | `Post` type has no tags | — |

### Schema

| ID | Issue | Impact | Priority |
| --- | --- | --- | --- |
| S1 | No `WebSite` / `Organization` | High | **P0** |
| S2 | No `CollectionPage` / `ItemList` on gallery or categories | High | **P1** |
| S3 | No `CreativeWork` / `ImageObject` on pieces | High | **P1** |
| S4 | No `BreadcrumbList` | Medium | **P1** |
| S5 | No `HowTo` on `/how-to-use` | Low | **P2** |
| S6 | No fake Product/Review markup (good — do not add) | — | — |

### Analytics

| ID | Issue | Impact | Priority |
| --- | --- | --- | --- |
| A1 | No GA4 | High | **P1** |
| A2 | No Vercel Analytics / Speed Insights | Medium | **P1** |
| A3 | No GSC / Bing verification env | High | **P1** |
| A4 | No event taxonomy | Medium | **P2** |

### Performance (SEO-relevant)

| ID | Issue | Impact | Priority |
| --- | --- | --- | --- |
| P1 | Cards use raw `<img>`, not `next/image` | Medium — no automatic srcset/AVIF | **P1** |
| P2 | Hero stills have no `fetchPriority` / `priority` | Medium — LCP | **P1** |
| P3 | Homepage can request many large stills as the user scrolls | Medium | **P2** |
| P4 | Fonts already via `next/font` (good) | — | — |
| P5 | Feed is a client component; first 16 cards still SSR (good) | — | — |

### Internal linking

| ID | Issue | Impact | Priority |
| --- | --- | --- | --- |
| L1 | Homepage hero does not link to category shelves | Medium | **P1** |
| L2 | Category chips already link, but to query URLs | High | **P0** |
| L3 | Piece → category link exists | Pass | — |
| L4 | No Home → Category → Piece breadcrumb trail | Medium | **P1** |
| L5 | 404 is a dead end except “Back to the gallery” | Medium | **P1** |

---

## Indexability map (before)

| URL | Index? | Problem |
| --- | --- | --- |
| `/` | Yes | Weak unique description vs guides; no schema |
| `/?category=Web` | **Noindex** but **in sitemap** | Conflicting |
| `/?q=*` | Noindex | Correct |
| `/?sort=Featured` | Noindex | Featured has no indexable URL |
| `/posts/[id]` | Yes | Unique body; thin metadata qualifier |
| `/what-is` | Yes | Generic title |
| `/how-to-use` | Yes | Generic title |
| `/admin/*` | Noindex + robots disallow | Correct |
| `/studio` | Robots disallow | Correct |
| 404 | HTTP 404 | Correct; page itself is thin |

---

## Recommended fixes (implemented next)

### P0

1. Harden sitemap generation so it cannot 500; emit only canonical indexable URLs.
2. Introduce clean shelf routes: `/web`, `/branding`, `/product`, `/motion`, `/illustration`, `/3d`, `/print`, `/featured`.
3. 301 old `/?category=` and `/?sort=Featured` URLs to those routes.
4. Add meaningful image alt text.
5. Add `WebSite` + `Organization` JSON-LD.

### P1

6. Central `siteConfig` + SEO metadata map; unique title/description/OG/Twitter/canonical per indexable route.
7. Dynamic piece metadata from catalog data (no hardcoded examples).
8. Guide copy + H1 updates; HowTo + breadcrumbs.
9. Crawlable text index of pieces beyond the first 16 cards.
10. Related pieces 3–6 with category + textual overlap.
11. robots/manifest/RSS discovery/verification env vars.
12. GA4 + Vercel Analytics + Speed Insights (env-gated).
13. Useful 404.
14. Image `priority` / `next/image` on LCP surfaces.

### P2

15. Per-piece OG image generation.
16. Keyword map document.
17. Stronger robots comments for search params.
18. Automated SEO tests.

### P3

19. Designer pages — only if a handle ever has enough unique text. **Not now.**
20. Tag pages — no tag field. **Not now.**

---

## What we will not do

- Keyword stuffing or hidden text.
- Product/Review schema on design pieces.
- Indexing search or arbitrary filter combinations.
- Changing piece URLs from `/posts/[id]`.
- Creating `/web/orbit-analytics` when `/posts/v-8` already exists.
- Thin author or tag indexes.
- Buying links or doorway pages.

---

## Priority legend

- **P0** — Blocks indexing or sends conflicting crawl signals.
- **P1** — High impact on rankings, sharing, or measurement.
- **P2** — Solid production hygiene.
- **P3** — Nice to have; skip if it creates thin pages.
