# Vitrine

A curated design archive — interface, brand and print work in a masonry gallery.
Built with Next.js (App Router) and Tailwind CSS, ready to deploy on Vercel.

The layout started as a study of [inspora.design](https://www.inspora.design/), which
runs the same stack (Next.js App Router + Tailwind on Vercel, images on a separate CDN,
behind Vercel Attack Challenge Mode). Vitrine has since taken its own direction: its own
name and mark, masthead, warm paper palette, pill filters with counts, hover captions,
and a detail view built around a metadata table. No assets or copy from that site are
used here.

## Features

- **Masthead + gallery** — a stated point of view above the grid, then the work.
- **Category filters** — All, Web, Branding, Product, Motion, Illustration, 3D, Print,
  each showing its count. Driven by `?category=`, so every view is linkable and
  server-rendered.
- **Sort** — Latest / Featured, via `?sort=`.
- **Masonry grid** — CSS grid with short implicit rows; each card gets an explicit
  `grid-row-end: span N` from its measured height. Keeps DOM order correct, which a
  `column-count` layout cannot (it reads down each column).
- **Infinite scroll** — 16 cards per page, 60 in total.
- **Hover captions** — title and designer fade in over the artwork; the resting state
  shows only the designer's avatar so the work reads first.
- **Detail view** — artwork on a canvas at left, panel at right with close and prev/next
  controls, category, title, description, a metadata table and a source link. Arrow keys
  page through the archive; Escape returns to the gallery.
- **Footer** — brand, every category as a link, outbound links and a colophon. It sits on
  the gallery only: the detail view is a full-height viewer and the 404 is a centred dead
  end, so neither has anywhere sensible to put one.

## Content

The gallery reads from Sanity when it is configured, and from the seed set in the repo
when it is not — so a fresh clone builds and deploys with a full gallery before any CMS
exists, and a CMS outage degrades to the seed set instead of an empty page.

### Adding work once Sanity is set up

Open `/studio` on the deployed site, create a **Designer**, then a **Piece** (title,
slug, artwork, description, category, designer, source URL). Hit Publish — the webhook
busts the gallery's cache tag and it is live in seconds. No redeploy.

Each piece's aspect ratio comes from the uploaded image's own dimensions, so the masonry
packs correctly without you entering anything.

### Connecting Sanity

1. Create a free project at [sanity.io/manage](https://www.sanity.io/manage) and note the
   project id.
2. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SANITY_PROJECT_ID`.
3. Add the same variables in Vercel → Project → Settings → Environment Variables.
4. In Sanity, add `http://localhost:3333` and your Vercel domain under **API → CORS
   origins** (allow credentials) so the embedded Studio can connect.
5. In Sanity, add **API → Webhooks**: URL `https://<your-domain>/api/revalidate`, dataset
   `production`, trigger on create/update/delete for `post`, and set a secret. Put the
   same value in `SANITY_REVALIDATE_SECRET`.

The webhook route verifies Sanity's signature, so an unsigned or wrongly-signed request
is rejected.

### Seed artwork

`scripts/generate-media.mjs` draws every seed piece as an SVG, deterministically from a
seed, with a composition per category — a browser mockup for Web, a phone screen for
Product, a mark-and-swatches board for Branding, a type specimen for Print, a frame strip
and easing curve for Motion, and so on. Nothing is fetched or copied from anywhere.

```bash
npm run seed:media    # regenerates public/posts, public/creators and lib/media-manifest.json
```

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
```

`npm run dev` runs webpack rather than Turbopack. Turbopack segfaults (SIGSEGV in its
native binding) on this project as soon as a `/posts/[id]` route is compiled, taking the
dev server down with it. `next build` uses Turbopack and is unaffected, as is production.
`npm run dev:turbo` is kept for retrying once that is fixed upstream.

The `/studio` route takes a couple of minutes to compile the first time in dev — the
Sanity Studio bundle is large. It is cached after that, and it is prerendered in
production.

## Deploying to Vercel

No required environment variables, so it deploys as-is:

```bash
npx vercel        # preview
npx vercel --prod
```

It deploys with no environment variables at all (serving the seed gallery). Add the
Sanity variables whenever you want to start publishing from the CMS.

Or push to a Git repo and import it at vercel.com — the framework preset is detected
automatically.

## Layout notes

- `.feed-grid` uses `grid-auto-rows: 4px`. A 1px unit gives exact gaps but needs several
  thousand implicit tracks for a full gallery, which makes every style recalculation
  expensive — enough to lock up a tab. At 4px the packing is visually identical.
- The row gap is read from the grid's computed `column-gap`, so the two stay in step
  across breakpoints without duplicating the value in JS.
- The gallery re-measures on width changes only. Re-running on height would loop, since
  the spans being written are what change the grid's height.
- Infinite scroll uses an IntersectionObserver with a throttled scroll listener behind
  it, both funnelling through one guard. The throttle is timestamp-based rather than
  rAF-based: rAF never runs in a hidden tab, which would leave a pending-frame latch
  stuck permanently.
