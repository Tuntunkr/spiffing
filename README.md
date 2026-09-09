# Spiffing

A curated design archive — interface, brand and print — with a public listing gallery and a private desk.

Live: [https://vitrine-fawn.vercel.app](https://vitrine-fawn.vercel.app)

**Documentation for developers and testers lives in [`docs/`](./docs/INDEX.md).** That folder is the source of truth for features, diagrams, the design system, and test scripts. This README stays short on purpose.

| Start | File |
| --- | --- |
| Index | [docs/INDEX.md](./docs/INDEX.md) |
| Run it | [docs/QUICK_START.md](./docs/QUICK_START.md) |
| Before first run | [docs/TODO_BEFORE_RUNNING.md](./docs/TODO_BEFORE_RUNNING.md) |
| All features + diagrams | [docs/FEATURES.md](./docs/FEATURES.md) |
| Design tokens / UI rules | [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) |
| Test script | [docs/TESTING.md](./docs/TESTING.md) |
| SEO setup | [SEO-SETUP.md](./SEO-SETUP.md) |

```bash
cp .env.example .env.local   # ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET
npm install
npm run dev                  # http://localhost:3000   gallery /  desk /admin
npm run check                # tsc + eslint + vitest
npm run test:e2e
```

`npm run dev` uses webpack. Turbopack can segfault on `/posts/[id]` in this project.

The layout began as a study of [inspora.design](https://www.inspora.design/). Spiffing is its own name, mark, palette and copy; nothing was taken from that site.
