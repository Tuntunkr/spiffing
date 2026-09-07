export const SITE_NAME = "Vitrine";
export const SITE_DESCRIPTION =
  "A working archive of interface, brand and print design — collected weekly, kept small on purpose.";

/**
 * Absolute origin for metadata, the sitemap and robots. Prefers an explicit
 * `NEXT_PUBLIC_SITE_URL`, then Vercel's production domain, then localhost.
 */
export function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return new URL(`https://${vercel}`);
  return new URL(`http://localhost:${process.env.PORT ?? 3000}`);
}
