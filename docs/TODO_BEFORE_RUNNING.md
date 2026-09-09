# Before you run

Tick these before the first `npm run dev`. Testers: if a box is empty, stop and ask; do not invent secrets.

## Required for the desk

- [ ] Node 22 (CI uses 22; local 20+ is usually fine)
- [ ] `npm install` completed
- [ ] `.env.local` exists (copy from `.env.example`)
- [ ] `ADMIN_EMAIL` is a real-looking email (`admin@spiffing.local` is fine)
- [ ] `ADMIN_PASSWORD` is at least 8 characters, with a letter **and** a number
- [ ] `ADMIN_SESSION_SECRET` is at least 16 characters, random, **not** committed

Without those three admin vars, the gallery still runs; `/admin` will say the desk is not configured.

## Optional

- [ ] `BLOB_READ_WRITE_TOKEN` — only if you want production-like persistence locally (`vercel env pull`)
- [ ] `NEXT_PUBLIC_SITE_URL` — canonical origin for sitemap/robots/OG (Vercel fills this from the production domain if unset)
- [ ] Sanity vars — only if you will use `/studio`

## Do not

- Commit `.env.local`, `data/*.json`, or `data/uploads/`
- Upload SVG as artwork (rejected on purpose)
- Expect `public/uploads` to work on `next start` — local files go through `/uploads/[name]` from `data/uploads`

## First-run path

1. `npm run dev`
2. `/admin/login` with the env email and password
3. Settings → seed is **on** by default so every category tab has sample work. Turn it off to show only desk uploads.
4. New → publish one JPG/PNG/WebP/GIF
5. `/` should show that piece at the top of Latest
