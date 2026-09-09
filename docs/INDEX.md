# Spiffing documentation

This folder is the source of truth for what the product does, how it looks, and how to test it. When a feature changes, update the matching module file **and** the diagram in [FEATURES.md](./FEATURES.md).

## Start here

| If you need… | Open |
| --- | --- |
| A one-screen overview | [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) |
| Run it in five minutes | [QUICK_START.md](./QUICK_START.md) |
| Env, Blob, Vercel, Sanity | [SETUP_GUIDE.md](./SETUP_GUIDE.md) |
| Checklist before first run | [TODO_BEFORE_RUNNING.md](./TODO_BEFORE_RUNNING.md) |
| Desk login and sessions | [AUTH_SETUP.md](./AUTH_SETUP.md) |
| Colour, type, components | [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) |
| Every feature + diagrams | [FEATURES.md](./FEATURES.md) |
| What a screen should look like | [VISUAL_GUIDE.md](./VISUAL_GUIDE.md) |
| How to verify a change | [TESTING.md](./TESTING.md) |
| What is already shipped | [IMPLEMENTATION.md](./IMPLEMENTATION.md) |
| SEO | [SEO-AUDIT.md](../SEO-AUDIT.md) · [SEO-SETUP.md](../SEO-SETUP.md) · [SEO-CHECKLIST.md](../SEO-CHECKLIST.md) · [SEO-KEYWORD-MAP.md](../SEO-KEYWORD-MAP.md) · [REDIRECTS.md](../REDIRECTS.md) · [SEO-IMPLEMENTATION-REPORT.md](../SEO-IMPLEMENTATION-REPORT.md) |

Same names as a typical project pack also exist as pointers: [COMPLETE_IMPLEMENTATION.md](./COMPLETE_IMPLEMENTATION.md), [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md).

## Modules

| Module | File | Owns |
| --- | --- | --- |
| Public gallery | [GALLERY.md](./GALLERY.md) | Home, search, filters, card grid, detail, guides, 404 |
| Desk (admin) | [DESK.md](./DESK.md) | Login, catalog, piece form, settings |
| Storage | [STORAGE.md](./STORAGE.md) | Local `data/`, Vercel Blob, uploads |
| HTTP surface | [API_REFERENCE.md](./API_REFERENCE.md) | Routes, server actions, cookies |

The repo [README](../README.md) is a short front door. It should not grow into a second copy of this folder.
