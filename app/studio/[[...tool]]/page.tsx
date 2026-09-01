import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";
import { sanityEnabled } from "@/sanity/env";

/** The Studio ships its own chrome, so it opts out of the site's metadata. */
export const dynamic = "force-static";
export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  if (!sanityEnabled) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
        <h1 className="display text-[22px] font-semibold">Studio is not configured</h1>
        <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-[#736f65]">
          Set <code className="rounded bg-[#f1efe9] px-1.5 py-0.5">NEXT_PUBLIC_SANITY_PROJECT_ID</code>{" "}
          and <code className="rounded bg-[#f1efe9] px-1.5 py-0.5">NEXT_PUBLIC_SANITY_DATASET</code>{" "}
          to edit the gallery here. Until then the site serves its built-in seed gallery.
        </p>
      </main>
    );
  }
  return <NextStudio config={config} />;
}
