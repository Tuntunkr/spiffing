# Design system

Single source for look and feel. Tokens live in [`app/globals.css`](../app/globals.css) (`@theme`) and are reused as hex in components so the paper palette stays exact.

When you add UI, match this file. Do not introduce a second grey or a new radius “because it looked close”.

## Principles

1. **Paper, not dashboard.** Background `#faf9f7`, ink `#16150f`, hairlines `#e7e3da`. The archive is a case, not an admin theme with a dark sidebar.
2. **Cards read as listings.** Preview on top, title, description and meta always visible — never a hover-only caption.
3. **One accent.** `#c2452c` is a pulse (live dot, featured pip). It is not a primary button colour.
4. **Pills for actions, rounded-2xl for surfaces.** Buttons and chips are full pills. Cards and fieldsets are `1rem` / `1.25rem` radii.
5. **Display type is Montserrat, body is Inter.** Class `.display` on titles only (`letter-spacing: -0.025em`). UI chrome stays Inter.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| Paper | `#faf9f7` | Page, sticky bars (`bg-paper/85` + blur) |
| Surface | `#ffffff` | Cards, forms, chips at rest |
| Ink | `#16150f` | Text, primary buttons, active chips |
| Muted | `#736f65` | Secondary text, idle nav |
| Quiet | `#a8a396` | Hints, counts, kbd, colophon |
| Hairline | `#e7e3da` | Borders, rules |
| Hairline hover | `#d5cfc2` | Chip/button hover border |
| Accent | `#c2452c` | Live dot, featured pip, destructive text |
| Danger wash | `#f8ece8` / `#c2452c` | Field errors, alerts |
| Success wash | `#eef6ea` / `#2f5d28` | Notices, password-ok |
| Canvas | `#f1efe9` | Detail artwork well, card placeholder |
| Footer | `#f4f2ed` | Gallery footer band |
| Type | Inter (UI) + Montserrat (titles) | `--font-inter` / `--font-montserrat` via `next/font` |

## Type scale (as used)

| Role | Size | Weight | Class |
| --- | --- | --- | --- |
| Gallery H1 | 36 / 48 / 56 | 600 | `.display` landing hero |
| Card title | 17 / 18 | 500 | `.display` |
| Desk H1 | 28 / 34 | 600 | `.display` |
| Detail H1 | 24 / 27 | 600 | `.display` |
| Body | 15 | 400 | muted or ink |
| Meta / chips | 13–14 | 400–500 | — |
| Eyebrow | 12–13 | 400 | uppercase tracking `[0.12em]`–`[0.14em]`, quiet |

Body never goes below 14px in forms (iOS zoom). Search uses `.ios-no-focus-zoom`.

## Shape

| Element | Radius |
| --- | --- |
| Primary button, chips, search | `9999px` (pill) |
| Text fields | `0.75rem` (`rounded-xl`) |
| Cards, fieldsets, empty shelf | `1rem` (`rounded-2xl`) |
| Artwork / avatars | `0.75rem` / full |

Primary button: `h-11`, ink fill, white label, `hover:opacity-85`. Quiet button: white, hairline border. Destructive: rust text, rust hairline.

## Focus

`.focus-ring:focus-visible` → 2px ink outline, 3px offset. Every control that can be tabbed must use it (or inherit). Do not remove outlines.

## Motion

| Name | When |
| --- | --- |
| `card-in` 420ms | Infinite-scroll cards after the first page |
| `hero-still-in` 700ms | Landing stills enter, staggered |
| `skeleton-pulse` 1.6s | Loading placeholders (opacity, not shimmer) |
| `notice-enter` 260ms | Desk confirmation banners |
| Card hover | `-translate-y-0.5` / 300ms on the card |

`prefers-reduced-motion: reduce` kills animations and smooth scroll.

## Layout

- Gallery max width `1680px`, padding `px-4 sm:px-6 xl:px-8` plus `min-[1700px]:px-12`
- Desk max width `1180px` with a `232px` rail on large screens
- Sticky header `68px` / `76px` (gallery), mobile desk `60px`, paper at 85% + `backdrop-blur-md`
- Feed: 2 columns → 3 at 1024 → 4 at 1440. Equal-height cards, gap 16 / 20.

## Components (canonical)

| Component | File | Notes |
| --- | --- | --- |
| Logo | `components/Logo.tsx` | Open frame + geometric S |
| Header | `components/Header.tsx` | Search is a GET form |
| Hero | `components/GalleryHero.tsx` | Landing case: type left, live stills right |
| Search | `components/SearchForm.tsx` | `/` focuses; clear is a link |
| Filter chips | `components/FilterBar.tsx` | Count in quiet type |
| Sort | `components/SortDropdown.tsx` | Menu, not a native select |
| Card | `components/PostCard.tsx` | 3:2 cover, thumbs, Montserrat title, description, avatar + handle |
| Concept | `components/ConceptBand.tsx` | Ink band under the piece; optional desk field |
| Empty | `components/EmptyShelf.tsx` | Dashed case, never a blank page |
| Detail art | `components/Artwork.tsx` | Click → lightbox |
| Panel | `components/PostPanel.tsx` | Esc / arrows |
| Desk fields | `components/admin/form.tsx` | Shared `FIELD` / `LABEL` / `HINT` |
| Notices | `components/admin/Notice.tsx` | Green bar after redirect |

New gallery chrome must look like the header + chips. New desk chrome must look like `form.tsx` + white fieldsets.

## Do / don't

**Do:** reuse hex from this table; keep primary buttons ink pills; hide “View the original” when `sourceUrl` is empty; hide the Frames row when `slides === 1`.

**Don't:** add Clerk buttons, an Admin link in public chrome, fake newsletter fields, placeholder social URLs, SVG uploads, or a third sans font. Inter + Montserrat is the pairing.
