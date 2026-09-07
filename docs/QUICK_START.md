# Quick start

```bash
git clone <this-repo>
cd inspora-clone
cp .env.example .env.local
# Fill ADMIN_EMAIL, ADMIN_PASSWORD (>= 8 chars), ADMIN_SESSION_SECRET (>= 16 chars)
npm install
npm run dev          # http://localhost:3000
```

Open `/` for the gallery (empty until you publish, unless you turn seed on). Open `/admin` for the desk.

```bash
npm run check        # tsc + eslint + vitest
npm run test:e2e     # Playwright vs a production build
```

## Commands (this is a Next.js app, not two Windows processes)

There is no `START_ADMIN.bat` / `START_BACKEND.bat`. One process serves both surfaces.

| Task | Command |
| --- | --- |
| Dev server | `npm run dev` |
| Production | `npm run build && npm run start` |
| Desk | already at `/admin` on the same server |
| Seed SVGs | `npm run seed:media` |

Use webpack in dev (`npm run dev`). Turbopack can segfault on `/posts/[id]` (`npm run dev:turbo` is only for retrying that).

Next: [TODO_BEFORE_RUNNING.md](./TODO_BEFORE_RUNNING.md) then [SETUP_GUIDE.md](./SETUP_GUIDE.md) if you need Blob or Sanity.
