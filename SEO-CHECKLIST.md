# SEO checklist — Spiffing

## Technical

- [x] HTTPS (Vercel)
- [x] `metadataBase` + per-route canonicals
- [x] `robots.ts` + sitemap reference
- [x] Dynamic sitemap of indexable URLs only
- [x] 404 returns HTTP 404 and is `noindex`
- [x] `/about` → `/what-is`, `/rss.xml` → `/feed.xml`
- [x] Old `/?category=` and `/?sort=Featured` 308 to clean shelves
- [x] Clean shelf URLs (`/web`, `/branding`, …, `/featured`)
- [x] Search / mixed filters `noindex, follow`
- [x] Admin / studio / API disallowed
- [x] Mobile viewport + responsive layout
- [x] `next/font` with `display: swap`
- [x] Manifest, favicon, Apple icon, theme color
- [x] RSS at `/feed.xml` with head discovery
- [ ] Core Web Vitals — confirm in Search Console / Speed Insights after traffic

## Metadata

- [x] Unique title on every indexable route
- [x] Unique description on every indexable route
- [x] One H1 per public page
- [x] Self-canonical on indexable pages
- [x] Open Graph (title, description, url, type, locale, site name, image)
- [x] Twitter `summary_large_image`
- [x] Favicon + Apple icon
- [x] `site.webmanifest` via `app/manifest.ts`
- [x] GSC / Bing verification env hooks

## Content

- [x] Unique shelf intros
- [x] Semantic headings on guides
- [x] Internal links: home → shelves → pieces → related + category
- [x] Descriptive URLs (piece IDs stay `/posts/[id]`)
- [x] Meaningful image alt on cards, hero stills, artwork
- [x] Related pieces (3–6, category + language overlap)
- [x] Crawlable text index beyond the first 16 cards
- [x] Useful 404 with search + shelves

## Structured data

- [x] WebSite (+ SearchAction)
- [x] Organization
- [x] BreadcrumbList (shelves, pieces, guides)
- [x] CollectionPage + ItemList
- [x] CreativeWork + ImageObject
- [x] HowTo on `/how-to-use`
- [x] No Product / Review / rating markup

## Analytics

- [x] GA4 ready (`NEXT_PUBLIC_GA_ID`)
- [x] Search Console ready (`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`)
- [x] Bing ready (`BING_SITE_VERIFICATION`)
- [x] Vercel Analytics
- [x] Speed Insights
- [x] Event taxonomy (search, category, piece, image, filter, RSS, outbound)
- [ ] Paste live tokens in Vercel (manual)

## Do not

- [x] No keyword stuffing or hidden text
- [x] No indexed search results
- [x] No thin designer / tag indexes
- [x] No fake reviews or doorway pages
