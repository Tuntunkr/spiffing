# SEO implementation report — Spiffing

**Live URL:** https://vitrine-fawn.vercel.app  
**Implemented:** 8 September 2026  
**Audit:** [SEO-AUDIT.md](./SEO-AUDIT.md)

---

## Before

Partial technical SEO. `metadataBase`, per-route canonicals, filter `noindex`, sitemap, robots, RSS and OG existed, but:

- Categories were query strings (`/?category=Web`) and those URLs were both **in the sitemap** and **noindex**.
- Production `/sitemap.xml` returned **500**.
- No JSON-LD.
- No analytics or webmaster verification hooks.
- Cards used `alt=""`.
- Infinite scroll hid pieces 17+ from the first HTML.
- Guide titles were generic.

Health before: **5.5 / 10**.

## After

Central `siteConfig`, clean shelf routes, unique metadata, JSON-LD, crawlable indexes, related pieces, GA4/Vercel analytics hooks, hardened sitemap, and the docs in this folder.

Health after (code + tests): **8.5 / 10**. Remaining points are live tokens (GA4/GSC/Bing) and field Web Vitals.

---

## Routes

| Route | SEO Title | Meta Description | Primary Intent | Canonical | Index |
| --- | --- | --- | --- | --- | --- |
| `/` | Spiffing — Design Worth Keeping | Explore a curated archive of interface, brand, product, print, motion, illustration and 3D design worth keeping. | Design archive | `/` | Yes |
| `/what-is` | About Spiffing — A Curated Design Archive | Learn what Spiffing is, how the design archive is curated, and why the collection focuses on interface, brand, print and product design. | What is Spiffing | `/what-is` | Yes |
| `/how-to-use` | How to Use Spiffing — Browse the Design Archive | Learn how to browse, search and explore the Spiffing design archive by category, featured work and individual design pieces. | Browse the archive | `/how-to-use` | Yes |
| `/web` | Web Design Inspiration — Curated Web Design Archive \| Spiffing | Explore a curated collection of web design, interface layouts, dashboards, landing pages and digital experiences. | Web design inspiration | `/web` | Yes |
| `/branding` | Branding Inspiration — Curated Brand Design Archive \| Spiffing | Explore selected identity systems, logos, visual identities and branding work from the Spiffing archive. | Branding inspiration | `/branding` | Yes |
| `/product` | Product Design Inspiration — Curated Archive \| Spiffing | Explore curated product design, apps, wallets, tools and digital product experiences from the Spiffing archive. | Product design | `/product` | Yes |
| `/motion` | Motion Design Inspiration — Curated Motion Archive \| Spiffing | Explore selected motion studies, loaders, animation concepts and motion design from the Spiffing archive. | Motion design | `/motion` | Yes |
| `/illustration` | Illustration Inspiration — Curated Illustration Archive \| Spiffing | Explore curated illustration work, visual studies and editorial illustration from the Spiffing archive. | Illustration inspiration | `/illustration` | Yes |
| `/3d` | 3D Design Inspiration — Curated 3D Archive \| Spiffing | Explore selected 3D design, rendered objects, material studies and visual experiments. | 3D design | `/3d` | Yes |
| `/print` | Print Design Inspiration — Curated Print Archive \| Spiffing | Explore selected print design, editorial layouts, programmes, typography and physical design work. | Print design | `/print` | Yes |
| `/featured` | Featured Design — Best of the Spiffing Archive | Explore featured selections from the Spiffing archive, covering web, branding, product, motion, illustration, 3D and print design. | Featured design | `/featured` | Yes |
| `/?q=*` | Search — Spiffing | Search results in the Spiffing design archive. | — | shelf without `q` | **No** |
| `/web?sort=Featured` | Web title (noindex) | Web description | — | `/web` | **No** |
| `/admin/*` | Desk | — | — | — | **No** |

### Seed pieces

Titles are `{title} — {kind} | Spiffing`. Descriptions use the catalog text, padded only when shorter than 80 characters.

| Route | SEO Title | Meta Description | Primary Intent | Canonical | Index |
| --- | --- | --- | --- | --- | --- |
| `/posts/v-1` | Ledger — pricing — Web Design \| Spiffing | Three plans compared without a feature table. The row you care about stays pinned as you scroll. | Web | `/posts/v-1` | Yes |
| `/posts/v-2` | Tally — daily — Product Design \| Spiffing | Habit tracking framed as progress, never judgement. Missed days stay quiet. Explore Tally — daily, product design from the Spiffing archive. | Product | `/posts/v-2` | Yes |
| `/posts/v-3` | Kestrel identity — Brand Design \| Spiffing | A bird mark reduced until only the turn of the wing is left. Six sizes, one drawing. | Branding | `/posts/v-3` | Yes |
| `/posts/v-4` | Type specimen — Arbor — Print Design \| Spiffing | The family shown at the sizes it actually ships at, not just at 200pt. Explore Type specimen — Arbor, print design from the Spiffing archive. | Print | `/posts/v-4` | Yes |
| `/posts/v-5` | Easing study — Motion Design \| Spiffing | Six curves compared on one timeline. Hand-tuned first, then measured. Explore Easing study, motion design from the Spiffing archive. | Motion | `/posts/v-5` | Yes |
| `/posts/v-6` | Field notes series — Illustration \| Spiffing | Twelve spot illustrations for a nature app, drawn on one grid. Explore Field notes series, illustration from the Spiffing archive. | Illustration | `/posts/v-6` | Yes |
| `/posts/v-7` | Material study — 3D Design \| Spiffing | One form, nine finishes. Lighting held constant so the material is the variable. | 3D | `/posts/v-7` | Yes |
| `/posts/v-8` | Orbit analytics — Web Design \| Spiffing | A console built for glancing: one headline number, one trend, everything else a click away. | Web | `/posts/v-8` | Yes |
| `/posts/v-9` | Ferry transit — Product Design \| Spiffing | Departure board first, map second. Works offline on the platform. Explore Ferry transit, product design from the Spiffing archive. | Product | `/posts/v-9` | Yes |
| `/posts/v-10` | Icon set — Orbit — 3D Design \| Spiffing | Rendered icons that still read at 24px, which is where they live. Explore Icon set — Orbit, 3d design from the Spiffing archive. | 3D | `/posts/v-10` | Yes |
| `/posts/v-11` | Northbound — Web Design \| Spiffing | A freight marketplace landing page. The quote form is the hero — no carousel above it. | Web | `/posts/v-11` | Yes |
| `/posts/v-12` | Nook wallet — Product Design \| Spiffing | Balance, then the next thing you owe. Everything else lives one swipe down. Explore Nook wallet, product design from the Spiffing archive. | Product | `/posts/v-12` | Yes |
| `/posts/v-13` | Foundry & Ash — Brand Design \| Spiffing | A ceramics studio identity built from a single kiln-mouth curve. Explore Foundry & Ash, brand design from the Spiffing archive. | Branding | `/posts/v-13` | Yes |
| `/posts/v-14` | Festival programme — Print Design \| Spiffing | Four days on one folded sheet. It reads flat and it reads folded. Explore Festival programme, print design from the Spiffing archive. | Print | `/posts/v-14` | Yes |
| `/posts/v-15` | Loader — Relay — Motion Design \| Spiffing | A three-second wait made to feel like one. It never loops visibly. Explore Loader — Relay, motion design from the Spiffing archive. | Motion | `/posts/v-15` | Yes |
| `/posts/v-16` | Editorial — drift — Illustration \| Spiffing | A long-read opener about migration. Mood over literal depiction. Explore Editorial — drift, illustration from the Spiffing archive. | Illustration | `/posts/v-16` | Yes |
| `/posts/v-17` | Product render — 3D Design \| Spiffing | A speaker shot in soft studio light, no environment reflections to date it. Explore Product render, 3d design from the Spiffing archive. | 3D | `/posts/v-17` | Yes |
| `/posts/v-18` | Casewell docs — Web Design \| Spiffing | Documentation with a real measure. Code samples sit inline instead of in a side rail. | Web | `/posts/v-18` | Yes |
| `/posts/v-19` | Cadence player — Product Design \| Spiffing | Playback controls sized for a dark room and a moving train. Explore Cadence player, product design from the Spiffing archive. | Product | `/posts/v-19` | Yes |
| `/posts/v-20` | Abstract loop — 3D Design \| Spiffing | A form that reads as one object from every angle in the turn. Explore Abstract loop, 3d design from the Spiffing archive. | 3D | `/posts/v-20` | Yes |
| `/posts/v-21` | Fold — homepage — Web Design \| Spiffing | Editorial pacing on a developer tool site. Long scroll, four ideas, no feature grid. | Web | `/posts/v-21` | Yes |
| `/posts/v-22` | Grove plant care — Product Design \| Spiffing | Watering schedules that forgive you. Photos track growth over months. Explore Grove plant care, product design from the Spiffing archive. | Product | `/posts/v-22` | Yes |
| `/posts/v-23` | Meridian rebrand — Brand Design \| Spiffing | A quieter mark and a much wider type ramp. The old logo was doing too much. Explore Meridian rebrand, brand design from the Spiffing archive. | Branding | `/posts/v-23` | Yes |
| `/posts/v-24` | Annual report — Print Design \| Spiffing | Financials laid out so a reader without a finance degree gets through it. Explore Annual report, print design from the Spiffing archive. | Print | `/posts/v-24` | Yes |
| `/posts/v-25` | Chart transitions — Motion Design \| Spiffing | Data changing shape without losing the reader's place. Explore Chart transitions, motion design from the Spiffing archive. | Motion | `/posts/v-25` | Yes |
| `/posts/v-26` | Onboarding set — Illustration \| Spiffing | Four scenes that carry meaning without any text baked in. Explore Onboarding set, illustration from the Spiffing archive. | Illustration | `/posts/v-26` | Yes |
| `/posts/v-27` | Packaging mock — 3D Design \| Spiffing | The bottle rendered before the glass existed, to settle the proportions. Explore Packaging mock, 3d design from the Spiffing archive. | 3D | `/posts/v-27` | Yes |
| `/posts/v-28` | Relay status — Web Design \| Spiffing | An uptime page that stays legible during an incident, including on a phone at 3am. | Web | `/posts/v-28` | Yes |
| `/posts/v-29` | Rally split — Product Design \| Spiffing | Splitting a bill without arithmetic or awkwardness. Explore Rally split, product design from the Spiffing archive. | Product | `/posts/v-29` | Yes |
| `/posts/v-30` | Glass series — 3D Design \| Spiffing | Refraction tuned by eye until it stopped looking like a render. Explore Glass series, 3d design from the Spiffing archive. | 3D | `/posts/v-30` | Yes |
| `/posts/v-31` | Meridian booking — Web Design \| Spiffing | Dates, guests, and price in one pass. The calendar never traps you in a modal. Explore Meridian booking, web design from the Spiffing archive. | Web | `/posts/v-31` | Yes |
| `/posts/v-32` | Signal check — Product Design \| Spiffing | A mood log that takes eleven seconds and never nags. Explore Signal check, product design from the Spiffing archive. | Product | `/posts/v-32` | Yes |
| `/posts/v-33` | Hallow Press — Brand Design \| Spiffing | An independent publisher's system: one serif, one grotesque, and a lot of restraint. | Branding | `/posts/v-33` | Yes |
| `/posts/v-34` | Exhibition posters — Print Design \| Spiffing | A six-poster run held together by one rule and one colour. Explore Exhibition posters, print design from the Spiffing archive. | Print | `/posts/v-34` | Yes |
| `/posts/v-35` | Nav choreography — Motion Design \| Spiffing | Menu open and close as one continuous move rather than two. Explore Nav choreography, motion design from the Spiffing archive. | Motion | `/posts/v-35` | Yes |
| `/posts/v-36` | Seasons — Illustration \| Spiffing | One landscape, four palettes, no redrawing. Explore Seasons, illustration from the Spiffing archive. | Illustration | `/posts/v-36` | Yes |
| `/posts/v-37` | Soft bodies — 3D Design \| Spiffing | Squash and stretch on inanimate objects, kept just short of cartoon. Explore Soft bodies, 3d design from the Spiffing archive. | 3D | `/posts/v-37` | Yes |
| `/posts/v-38` | Thicket CMS — Web Design \| Spiffing | Content modelling made visual — fields, relations, and previews on one canvas. Explore Thicket CMS, web design from the Spiffing archive. | Web | `/posts/v-38` | Yes |
| `/posts/v-39` | Pantry — Product Design \| Spiffing | What you have, what expires next, what that makes for dinner. Explore Pantry, product design from the Spiffing archive. | Product | `/posts/v-39` | Yes |
| `/posts/v-40` | Chrome type — 3D Design \| Spiffing | A display face rendered in metal without tipping into nostalgia. Explore Chrome type, 3d design from the Spiffing archive. | 3D | `/posts/v-40` | Yes |
| `/posts/v-41` | Halcyon careers — Web Design \| Spiffing | Roles listed as sentences, not cards. Filters collapse when there is nothing to filter. | Web | `/posts/v-41` | Yes |
| `/posts/v-42` | Trailhead — Product Design \| Spiffing | Route planning with elevation you can read at a glance while walking. Explore Trailhead, product design from the Spiffing archive. | Product | `/posts/v-42` | Yes |
| `/posts/v-43` | Tidewater — Brand Design \| Spiffing | Coastal conservation charity. The palette comes from actual water samples. Explore Tidewater, brand design from the Spiffing archive. | Branding | `/posts/v-43` | Yes |
| `/posts/v-44` | Menu — Salt Room — Print Design \| Spiffing | Priced without currency symbols. Nothing is bolded to sell it harder. Explore Menu — Salt Room, print design from the Spiffing archive. | Print | `/posts/v-44` | Yes |
| `/posts/v-45` | Empty state — Nook — Motion Design \| Spiffing | The illustration animates once, on first sight, and then stays still. Explore Empty state — Nook, motion design from the Spiffing archive. | Motion | `/posts/v-45` | Yes |
| `/posts/v-46` | Error states — Illustration \| Spiffing | Something broke, drawn so nobody feels blamed for it. Explore Error states, illustration from the Spiffing archive. | Illustration | `/posts/v-46` | Yes |
| `/posts/v-47` | Terrain — 3D Design \| Spiffing | Procedural landscape, hand-corrected where the algorithm got boring. Explore Terrain, 3d design from the Spiffing archive. | 3D | `/posts/v-47` | Yes |
| `/posts/v-48` | Pilot onboarding — Web Design \| Spiffing | Four steps with honest progress. Skipping is allowed and remembered. Explore Pilot onboarding, web design from the Spiffing archive. | Web | `/posts/v-48` | Yes |
| `/posts/v-49` | Draft — writing — Product Design \| Spiffing | A phone writing app with one screen, one font, and a word count you can hide. Explore Draft — writing, product design from the Spiffing archive. | Product | `/posts/v-49` | Yes |
| `/posts/v-50` | Light study — 3D Design \| Spiffing | The same scene at six times of day. Only the sun moves. Explore Light study, 3d design from the Spiffing archive. | 3D | `/posts/v-50` | Yes |
| `/posts/v-51` | Salt & Sable — Web Design \| Spiffing | A small shop's storefront. Product photography carries the page; type stays out of the way. | Web | `/posts/v-51` | Yes |
| `/posts/v-52` | Coop banking — Product Design \| Spiffing | Shared household money. Every transaction says who and why. Explore Coop banking, product design from the Spiffing archive. | Product | `/posts/v-52` | Yes |
| `/posts/v-53` | Nine Yards — Brand Design \| Spiffing | A tailoring house identity that works embroidered, embossed, and at 16px. Explore Nine Yards, brand design from the Spiffing archive. | Branding | `/posts/v-53` | Yes |
| `/posts/v-54` | Field guide — Print Design \| Spiffing | Pocket-sized, waterproof stock, and legible in bad light. Explore Field guide, print design from the Spiffing archive. | Print | `/posts/v-54` | Yes |
| `/posts/v-55` | Logo build — Motion Design \| Spiffing | A five-second identity animation that still works as a still frame. Explore Logo build, motion design from the Spiffing archive. | Motion | `/posts/v-55` | Yes |
| `/posts/v-56` | Cover — Hallow — Illustration \| Spiffing | A book jacket that survives being shrunk to a thumbnail. Explore Cover — Hallow, illustration from the Spiffing archive. | Illustration | `/posts/v-56` | Yes |
| `/posts/v-57` | Torus set — 3D Design \| Spiffing | A shape family exploring how far a torus bends before it reads as something else. | 3D | `/posts/v-57` | Yes |
| `/posts/v-58` | Corvid dashboard — Web Design \| Spiffing | Dense figures, generous whitespace. Density is a setting, not a default. Explore Corvid dashboard, web design from the Spiffing archive. | Web | `/posts/v-58` | Yes |
| `/posts/v-59` | Loop fitness — Product Design \| Spiffing | Sets and reps logged with a thumb, between sets, without looking. Explore Loop fitness, product design from the Spiffing archive. | Product | `/posts/v-59` | Yes |
| `/posts/v-60` | Studio scene — 3D Design \| Spiffing | A staging setup reused across a whole product line. Explore Studio scene, 3d design from the Spiffing archive. | 3D | `/posts/v-60` | Yes |

Desk-published pieces use the same generators from live catalog data. They appear in the sitemap on the next request (`force-dynamic`).

---

## Schema

| Page | JSON-LD |
| --- | --- |
| All public pages (root) | `WebSite`, `Organization` |
| Home + shelves | `CollectionPage` + `ItemList` |
| Shelves + pieces + guides | `BreadcrumbList` |
| `/posts/[id]` | `CreativeWork` + `ImageObject` |
| `/how-to-use` | `HowTo` (four browse steps) |

Never `Product`, `Review`, or `aggregateRating`.

---

## Analytics

| Integration | Status |
| --- | --- |
| GA4 (`NEXT_PUBLIC_GA_ID`) | Wired; silent until the ID is set |
| Search Console | `verification.google` from env |
| Bing | `msvalidate.01` from env |
| Vercel Analytics | Mounted |
| Speed Insights | Mounted |
| Events | `search`, `category_click`, `piece_view`, `image_open`, `filter_used`, `rss_click`, `outbound_click`, `external_link_click` |

Setup steps: [SEO-SETUP.md](./SEO-SETUP.md).

---

## Technical SEO

- Sitemap generation no longer throws if the catalog read fails; it emits static routes.
- Sitemap lists `/`, guides, eight shelves, and every piece. No query URLs, no `/admin`.
- Robots allows assets, disallows `/admin`, `/api/`, `/studio`, and search `?q=` for Googlebot.
- Query shelves (`/?category=Web`, `/?sort=Featured`) 308 in **one hop** via `proxy.ts`, keeping `q`.
- RSS discovery in the document head; `/rss.xml` redirects to `/feed.xml`.
- Manifest, Apple icon, SVG favicon, theme color `#faf9f7`.
- Per-piece OG image route at `/posts/[id]/opengraph-image` (1200×630) plus artwork URL in metadata.

---

## Performance

- Hero LCP still gets `fetchPriority="high"` and eager load.
- Card images keep intrinsic width/height (CLS).
- `next/image` AVIF/WebP remote patterns for Sanity and Blob.
- Fonts remain `next/font` + `display: swap`.
- First 16 cards stay in the HTML; pieces after that are linked in a server-rendered text index.
- GA4 is gated so an empty ID loads no gtag script.

---

## Tests

- Unit: unique titles/descriptions, canonicals, noindex rules, sitemap shape, JSON-LD builders, related picker, gallery URLs.
- E2E: `tests/e2e/seo.spec.ts` plus updated gallery URL/copy assertions.

---

## Remaining (manual)

1. Paste `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` in Vercel.
2. Submit `sitemap.xml` in Search Console and Bing.
3. Confirm Web Vitals after real traffic.
4. When a custom domain exists, change `NEXT_PUBLIC_SITE_URL` and re-verify.

## Remaining opportunities (not built)

- Designer pages — too thin today.
- Tag pages — no tag field.
- `next/image` on every card — seed SVGs and mixed Blob URLs; `img` + dimensions is the safer LCP path for now.
- Off-site backlinks and Google Business — not a local business.

---

## Files (SEO surface)

`lib/site.ts`, `lib/seo.ts`, `lib/schema.ts`, `lib/gallery-url.ts`, `lib/related.ts`, `lib/sitemap-entries.ts`, `lib/analytics.ts`, `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`, `app/(gallery)/page.tsx`, `app/(gallery)/[shelf]/page.tsx`, `app/posts/[id]/page.tsx`, `app/posts/[id]/opengraph-image.tsx`, `app/what-is/page.tsx`, `app/how-to-use/page.tsx`, `app/not-found.tsx`, `next.config.ts`, `.env.example`, and the public components listed in the audit follow-up.
