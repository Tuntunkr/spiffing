# SEO setup — Spiffing

Manual steps after deploy. The app is ready; these accounts cannot be created from the repo.

Canonical origin today: `https://vitrine-fawn.vercel.app`  
Override later with `NEXT_PUBLIC_SITE_URL`.

---

## Environment variables

Set in Vercel → Project → Settings → Environment Variables (Production).

| Variable | Used for | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin, sitemap, robots, OG | `https://vitrine-fawn.vercel.app` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console HTML-tag verify | token from GSC |
| `BING_SITE_VERIFICATION` | Bing `msvalidate.01` | token from Bing |

Leave a variable blank to disable that integration. GA4, GSC and Bing do nothing until filled.

Copy the same keys into `.env.local` for local checks. See `.env.example`.

When the custom domain is ready:

1. Add the domain in Vercel.
2. Change `NEXT_PUBLIC_SITE_URL` to `https://your-domain.com`.
3. Redeploy.
4. Re-verify Search Console / Bing on the new host.
5. Submit the new sitemap.

---

## Google Search Console

1. Open [Google Search Console](https://search.google.com/search-console) and add a **URL-prefix** property for `https://vitrine-fawn.vercel.app`.
2. Choose **HTML tag** verification. Copy the `content` value only.
3. Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in Vercel and redeploy.
4. Click **Verify**.
5. Submit sitemap: `https://vitrine-fawn.vercel.app/sitemap.xml`.
6. Use **URL Inspection** on `/`, `/web`, `/what-is`, `/how-to-use` and one piece (`/posts/v-1`).
7. Request indexing on those URLs.
8. Watch Coverage (now “Pages”) and Performance over the following weeks.

A domain property is better once a custom domain and DNS TXT record exist.

---

## Bing Webmaster Tools

1. Open [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Add the site. Import from Search Console if available, or verify with a meta tag.
3. Set `BING_SITE_VERIFICATION` to the `msvalidate.01` value and redeploy.
4. Submit the same sitemap URL.

---

## Google Analytics 4

1. Create a GA4 property and a Web data stream for the live origin.
2. Copy the Measurement ID (`G-…`) into `NEXT_PUBLIC_GA_ID`.
3. Redeploy. `@next/third-parties` loads `gtag` only when this is set.
4. Confirm in GA4 DebugView / Realtime: `page_view` plus custom events below.

### Events (no PII)

| Event | When |
| --- | --- |
| `page_view` | Automatic with GA4 |
| `search` | Archive search (`search_term`, `results`) |
| `category_click` | Category chip / hero shelf link |
| `piece_view` | Piece page mount |
| `image_open` | Artwork lightbox |
| `filter_used` | Latest / Featured sort |
| `rss_click` | RSS link |
| `outbound_click` / `external_link_click` | `target="_blank"` off-site |

Do not send emails, names, or form values.

---

## Vercel Analytics and Speed Insights

`@vercel/analytics` and `@vercel/speed-insights` are mounted in the root layout.

1. In the Vercel project, enable **Analytics** and **Speed Insights**.
2. After traffic arrives, check Web Vitals (LCP, INP, CLS) there.

No extra env vars.

---

## Post-deploy checks

- `https://vitrine-fawn.vercel.app/robots.txt` lists the sitemap and disallows `/admin`, `/api/`, `/studio`.
- `https://vitrine-fawn.vercel.app/sitemap.xml` returns 200 and only canonical URLs.
- [Rich Results Test](https://search.google.com/test/rich-results) on `/`, `/web`, `/posts/v-1`, `/how-to-use`.
- [PageSpeed Insights](https://pagespeed.web.dev/) on `/` (mobile).
- Share a piece URL in Slack / iMessage to confirm OG (artwork) and Twitter `summary_large_image`.
