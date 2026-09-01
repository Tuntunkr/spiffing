/**
 * Sanity is optional. With no project id configured the site falls back to the
 * generated seed gallery, so it still builds and deploys before a CMS exists.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-01-01";

export const sanityEnabled = projectId.length > 0;
