# Visual guide

What a tester should *see*. Tokens and rules: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md). Feature IDs: [FEATURES.md](./FEATURES.md).

GitHub and most IDEs render the mermaid blocks in the other docs. This file is the screen checklist.

## Colour sample

```
Paper   ████  #faf9f7    page
Ink     ████  #16150f    type, primary button
Muted   ████  #736f65    secondary
Hairline████  #e7e3da    rules
Accent  ████  #c2452c    live / featured pip only
```

## Screen: Gallery home

```
┌ sticky header 68/76px, paper/85 + blur ─────────────────────────────────┐
│ [V] Vitrine    Gallery   Featured     ( search pieces…    / )    Admin │
└─────────────────────────────────────────────────────────────────────────┘
  Design worth keeping.                          (H1 .display)
  A working archive of…                          (15px muted)

  [All 12] [Web 3] [Branding 2] …                    Sort Latest ▾
  ┌────┐ ┌────┐ ┌────┐ ┌────┐
  │img │ │img │ │img │ │img │   2 / 3 / 4 cols
  │  o │ │  o │ │  o │ │  o │   o = avatar, bottom-left
  └────┘ └────┘ └────┘ └────┘
  footer: Vitrine  Browse  More  Follow (RSS, sitemap, desk)
```

Pass: chips are pills; active chip is ink/white; search is a pill; no “Join”; no fake X/Instagram; empty catalog shows the dashed case, not a blank grid.

## Screen: Search

Eyebrow `SEARCH`, H1 like `2 pieces for “ledger”` or `Nothing matches`, “Clear search” link, chips still visible with counts for that query.

## Screen: Detail

```
┌ canvas #f1efe9 ──────────────┬ panel 360–480px ─────────────┐
│                              │  [x]              [←] [→]    │
│      artwork (click zoom)    │  (Product)  Featured         │
│                              │  Title                       │
│                              │  Description                 │
│                              │  Designer / Added / Size     │
│                              │  [ View the original ]       │
│                              │  [ Share ]  ← → · Esc        │
│                              │  MORE IN PRODUCT  See all    │
└──────────────────────────────┴──────────────────────────────┘
```

Pass: no original button if URL empty; Frames row only if slides > 1; lightbox is near-black `#16150f/95`; mobile stacks canvas then panel.

## Screen: 404

Centred logo, quiet `404`, “This piece has left the case.”, pill “Back to the gallery”.

## Screen: Login

Centred white card max 400px, H1 `Desk`, email + password + Show, ink pill “Sign in to the desk”, “Back to the gallery”. No Clerk widget.

## Screen: Pieces

Desk header (`Desk` + Pieces / New / Settings underline), H1 Pieces, chips, search pill, table on white rounded-2xl. Featured = ink pill + accent pip. Notice = green bar after publish.

## Screen: New / Edit

Two columns from `lg`: fields left (On the shelf, Designer), sticky aside (Artwork drop 4:5, Listing, publish). Errors are rust under the field, `aria-invalid`. Drop zone ring turns ink while dragging.

## Screen: Settings

Two white cards: seed checkbox + “Save shelf”; password trio + hint “At least 8 characters, with a letter and a number.”

## Breakpoints to check

| Width | Expect |
| --- | --- |
| 390 | Header wraps; search full width under logo; 2-col feed; desk nav strip under header |
| 768 | Filter still scrolls horizontally if needed |
| 1024 | 3-col feed; detail is side-by-side |
| 1440 | 4-col feed; “N pieces” in the header |

## States that must look designed

| State | Treatment |
| --- | --- |
| Loading | Skeleton pulse on gallery, desk table, not a spinner page |
| Empty | `EmptyShelf` dashed case |
| Error | `app/error.tsx` / desk `error.tsx` — copy + Try again |
| Pending submit | Button opacity 50 + “Saving…” / spinner |
| Success | Green notice or form status, never a browser alert (except delete confirm) |
