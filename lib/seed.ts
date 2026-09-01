/**
 * The gallery that ships in the repo. Used as-is until a Sanity project is
 * configured, and as the fallback if a fetch returns nothing.
 */
import manifest from "./media-manifest.json";
import type { Category, Post } from "./types";

type CategoryCopy = { title: string; description: string }[];

/**
 * Written per category so a filtered view reads like a real shelf rather than
 * the same generic captions reshuffled.
 */
const COPY: Record<Category, CategoryCopy> = {
  Web: [
    { title: "Ledger — pricing", description: "Three plans compared without a feature table. The row you care about stays pinned as you scroll." },
    { title: "Orbit analytics", description: "A console built for glancing: one headline number, one trend, everything else a click away." },
    { title: "Northbound", description: "A freight marketplace landing page. The quote form is the hero — no carousel above it." },
    { title: "Casewell docs", description: "Documentation with a real measure. Code samples sit inline instead of in a side rail." },
    { title: "Fold — homepage", description: "Editorial pacing on a developer tool site. Long scroll, four ideas, no feature grid." },
    { title: "Relay status", description: "An uptime page that stays legible during an incident, including on a phone at 3am." },
    { title: "Meridian booking", description: "Dates, guests, and price in one pass. The calendar never traps you in a modal." },
    { title: "Thicket CMS", description: "Content modelling made visual — fields, relations, and previews on one canvas." },
    { title: "Halcyon careers", description: "Roles listed as sentences, not cards. Filters collapse when there is nothing to filter." },
    { title: "Pilot onboarding", description: "Four steps with honest progress. Skipping is allowed and remembered." },
    { title: "Salt & Sable", description: "A small shop's storefront. Product photography carries the page; type stays out of the way." },
    { title: "Corvid dashboard", description: "Dense figures, generous whitespace. Density is a setting, not a default." },
  ],
  Product: [
    { title: "Tally — daily", description: "Habit tracking framed as progress, never judgement. Missed days stay quiet." },
    { title: "Ferry transit", description: "Departure board first, map second. Works offline on the platform." },
    { title: "Nook wallet", description: "Balance, then the next thing you owe. Everything else lives one swipe down." },
    { title: "Cadence player", description: "Playback controls sized for a dark room and a moving train." },
    { title: "Grove plant care", description: "Watering schedules that forgive you. Photos track growth over months." },
    { title: "Rally split", description: "Splitting a bill without arithmetic or awkwardness." },
    { title: "Signal check", description: "A mood log that takes eleven seconds and never nags." },
    { title: "Pantry", description: "What you have, what expires next, what that makes for dinner." },
    { title: "Trailhead", description: "Route planning with elevation you can read at a glance while walking." },
    { title: "Draft — writing", description: "A phone writing app with one screen, one font, and a word count you can hide." },
    { title: "Coop banking", description: "Shared household money. Every transaction says who and why." },
    { title: "Loop fitness", description: "Sets and reps logged with a thumb, between sets, without looking." },
  ],
  Branding: [
    { title: "Kestrel identity", description: "A bird mark reduced until only the turn of the wing is left. Six sizes, one drawing." },
    { title: "Foundry & Ash", description: "A ceramics studio identity built from a single kiln-mouth curve." },
    { title: "Meridian rebrand", description: "A quieter mark and a much wider type ramp. The old logo was doing too much." },
    { title: "Hallow Press", description: "An independent publisher's system: one serif, one grotesque, and a lot of restraint." },
    { title: "Tidewater", description: "Coastal conservation charity. The palette comes from actual water samples." },
    { title: "Nine Yards", description: "A tailoring house identity that works embroidered, embossed, and at 16px." },
  ],
  Print: [
    { title: "Type specimen — Arbor", description: "The family shown at the sizes it actually ships at, not just at 200pt." },
    { title: "Festival programme", description: "Four days on one folded sheet. It reads flat and it reads folded." },
    { title: "Annual report", description: "Financials laid out so a reader without a finance degree gets through it." },
    { title: "Exhibition posters", description: "A six-poster run held together by one rule and one colour." },
    { title: "Menu — Salt Room", description: "Priced without currency symbols. Nothing is bolded to sell it harder." },
    { title: "Field guide", description: "Pocket-sized, waterproof stock, and legible in bad light." },
  ],
  Motion: [
    { title: "Easing study", description: "Six curves compared on one timeline. Hand-tuned first, then measured." },
    { title: "Loader — Relay", description: "A three-second wait made to feel like one. It never loops visibly." },
    { title: "Chart transitions", description: "Data changing shape without losing the reader's place." },
    { title: "Nav choreography", description: "Menu open and close as one continuous move rather than two." },
    { title: "Empty state — Nook", description: "The illustration animates once, on first sight, and then stays still." },
    { title: "Logo build", description: "A five-second identity animation that still works as a still frame." },
  ],
  Illustration: [
    { title: "Field notes series", description: "Twelve spot illustrations for a nature app, drawn on one grid." },
    { title: "Editorial — drift", description: "A long-read opener about migration. Mood over literal depiction." },
    { title: "Onboarding set", description: "Four scenes that carry meaning without any text baked in." },
    { title: "Seasons", description: "One landscape, four palettes, no redrawing." },
    { title: "Error states", description: "Something broke, drawn so nobody feels blamed for it." },
    { title: "Cover — Hallow", description: "A book jacket that survives being shrunk to a thumbnail." },
  ],
  "3D": [
    { title: "Material study", description: "One form, nine finishes. Lighting held constant so the material is the variable." },
    { title: "Icon set — Orbit", description: "Rendered icons that still read at 24px, which is where they live." },
    { title: "Product render", description: "A speaker shot in soft studio light, no environment reflections to date it." },
    { title: "Abstract loop", description: "A form that reads as one object from every angle in the turn." },
    { title: "Packaging mock", description: "The bottle rendered before the glass existed, to settle the proportions." },
    { title: "Glass series", description: "Refraction tuned by eye until it stopped looking like a render." },
    { title: "Soft bodies", description: "Squash and stretch on inanimate objects, kept just short of cartoon." },
    { title: "Chrome type", description: "A display face rendered in metal without tipping into nostalgia." },
    { title: "Terrain", description: "Procedural landscape, hand-corrected where the algorithm got boring." },
    { title: "Light study", description: "The same scene at six times of day. Only the sun moves." },
    { title: "Torus set", description: "A shape family exploring how far a torus bends before it reads as something else." },
    { title: "Studio scene", description: "A staging setup reused across a whole product line." },
  ],
};

const CREATORS = [
  "ada.reyes", "studioquiet", "n.oren", "makeshift", "fieldnotes",
  "aviformwork", "lumen", "type.and.grid", "northloop", "practical",
  "slowinterface", "pixelmason", "coldbrewco", "atelier.nine",
];

/** Cursor per category so each post pulls the next unused caption. */
const cursors: Partial<Record<Category, number>> = {};

export const SEED_POSTS: Post[] = manifest.map((m, i) => {
  const n = i + 1;
  const category = m.category as Category;
  const pool = COPY[category];
  const c = cursors[category] ?? 0;
  cursors[category] = c + 1;
  const copy = pool[c % pool.length];
  const creatorIndex = (n * 5) % CREATORS.length;

  return {
    id: `v-${n}`,
    title: copy.title,
    description: copy.description,
    category,
    creator: {
      handle: CREATORS[creatorIndex],
      avatar: `/creators/creator-${creatorIndex + 1}.svg`,
    },
    media: { src: m.file, width: m.width, height: m.height },
    slides: n % 6 === 0 ? 2 + (n % 3) : 1,
    sourceUrl: "https://example.com/",
    featured: n % 4 === 0,
    // Fixed epoch keeps ordering stable between builds.
    publishedAt: new Date(Date.UTC(2026, 7, 29) - n * 36e5).toISOString(),
  };
});
