# SEO keyword map — Spiffing

Intent is expressed in titles, H1s, URLs, descriptions, intro copy, alt text, anchors and JSON-LD. There is no stuffed `keywords` meta tag.

| Page type | Route | Primary intent | Secondary intent | Title / H1 alignment |
| --- | --- | --- | --- | --- |
| Homepage | `/` | Design archive | Design inspiration | `Spiffing — Design Worth Keeping` / “Design worth keeping.” |
| About | `/what-is` | What is Spiffing | Curated design archive | About title / “What is Spiffing?” |
| How to use | `/how-to-use` | Browse a design archive | How to search the gallery | How-to title / “How to browse the archive.” |
| Web | `/web` | Web design inspiration | UI / interface archive | Web title / “Web.” |
| Branding | `/branding` | Branding inspiration | Identity design | Branding title / “Branding.” |
| Product | `/product` | Product design | App design | Product title / “Product.” |
| Motion | `/motion` | Motion design | Animation / loaders | Motion title / “Motion.” |
| Illustration | `/illustration` | Illustration inspiration | Editorial illustration | Illustration title / “Illustration.” |
| 3D | `/3d` | 3D design | Material studies | 3D title / “3D.” |
| Print | `/print` | Print design | Editorial / typography | Print title / “Print.” |
| Featured | `/featured` | Featured design | Best of the archive | Featured title / “Featured.” |
| Piece | `/posts/[id]` | Project / piece name | Category + design type | `{title} — {kind} \| Spiffing` |
| Search | `/?q=` or `/web?q=` | — | — | **noindex** — not a landing page |
| In-shelf featured | `/web?sort=Featured` | — | — | **noindex** — duplicate of `/web` + `/featured` |

## How intent is used

- **Title + H1 + URL** carry the primary phrase once.
- **Description** restates the archive value for that shelf.
- **Intro paragraph** on each shelf is unique editorial copy, not a keyword list.
- **Image alt** describes the still (`{title}. {description}`), not a keyword string.
- **Internal anchors** use the category name (“Web”, “See all”) or the piece title.
- **JSON-LD** `genre` / `CollectionPage.name` repeat the category as an entity, not as stuffing.

## Not indexed (on purpose)

Designer handles exist (`studioquiet`, …) but there are no `/designers/*` pages. Tag pages do not exist. Both would be thin.
