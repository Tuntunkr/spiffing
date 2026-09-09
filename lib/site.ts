/**
 * Single source of truth for brand, origin and crawl metadata.
 * Override the origin with NEXT_PUBLIC_SITE_URL when the custom domain is ready.
 */
export const DEFAULT_SITE_URL = "https://vitrine-fawn.vercel.app";

export const siteConfig = {
  name: "Spiffing",
  defaultUrl: DEFAULT_SITE_URL,
  title: "Spiffing — Design Worth Keeping",
  description:
    "A curated archive of interface, brand, product, print, motion, illustration and 3D design worth keeping.",
  tagline:
    "A working archive of interface, brand and print design — collected weekly, kept small on purpose.",
  creator: "Spiffing",
  locale: "en_US",
  language: "en",
  category: "design",
} as const;

export const SITE_NAME = siteConfig.name;
export const SITE_DESCRIPTION = siteConfig.description;
export const SITE_TITLE = siteConfig.title;

/**
 * Absolute origin for metadata, the sitemap and robots. Prefers an explicit
 * `NEXT_PUBLIC_SITE_URL`, then Vercel's production domain, then the shipped
 * default, then localhost in development.
 */
export function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return new URL(explicit);
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return new URL(`https://${vercel}`);
  if (process.env.NODE_ENV === "development") {
    return new URL(`http://localhost:${process.env.PORT ?? 3000}`);
  }
  return new URL(DEFAULT_SITE_URL);
}

export function siteOrigin(): string {
  return siteUrl().origin;
}

export function absoluteUrl(path = "/"): string {
  const url = siteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, url).toString().replace(/\/$/, normalized === "/" ? "/" : "");
}
