# Implementation status

Shipped on production ([vitrine-fawn.vercel.app](https://vitrine-fawn.vercel.app)). Use this as the “what exists today” list when reviewing a PR. New work updates [FEATURES.md](./FEATURES.md) first, then this table.

## Done

| Area | Status |
| --- | --- |
| Public masonry gallery | Done — G1–G12 |
| Detail viewer + lightbox + share + related | Done — D1–D10 |
| Desk login (cookie, scrypt, lockout, session version) | Done — A1–A4, A13 |
| Publish / edit / delete with server image inspect | Done — A5–A11 |
| Seed toggle, password change | Done — A12–A13 |
| Private JSON blobs + public artwork blobs | Done |
| Local uploads via `/uploads/[name]` | Done |
| Search `?q=` | Done |
| RSS, sitemap, robots, OG, icon | Done |
| Loading / error / 404 | Done |
| Design system (paper palette, pills, Inter) | Done — see DESIGN_SYSTEM.md |
| Vitest + Playwright + GitHub Actions | Done |
| Clerk / fake subscribe / dead social links | Removed |

## Out of scope (do not assume they exist)

- Multi-admin or roles
- Draft / hide a piece without deleting
- Real multi-image slideshow (Frames is a number + badge only)
- Visitor accounts
- Newsletter
- Sanity required (it is optional)

## When you change something

1. Update the feature row in [FEATURES.md](./FEATURES.md)
2. Update the module file (gallery / desk / storage / API)
3. If it is visible, update [VISUAL_GUIDE.md](./VISUAL_GUIDE.md) or [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
4. Add or adjust a test in [TESTING.md](./TESTING.md)
5. Keep [README](../README.md) as a short door — do not duplicate this folder there
