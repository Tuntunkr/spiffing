import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import GuideShell from "@/components/GuideShell";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Submission received — Spiffing",
  description: "Your design has been sent to the Spiffing desk for review. It is not live on the gallery yet.",
  canonical: "/submit/thanks",
  index: false,
});

const CTA =
  "focus-ring inline-flex h-11 items-center justify-center rounded-full px-5 text-[15px] font-medium transition-[opacity,transform] active:scale-[0.98]";

export default function SubmitThanksPage() {
  return (
    <GuideShell current="submit">
      <div className="mx-auto max-w-[720px] px-4 py-16 sm:px-6 sm:py-24">
        <Breadcrumbs crumbs={[{ name: "Home", path: "/" }, { name: "Submit", path: "/submit" }]} />
        <p className="mt-8 text-[12px] uppercase tracking-[0.14em] text-[#a8a396]">Inbox</p>
        <h1 className="display mt-3 text-[34px] font-semibold leading-[1.05] sm:text-[48px]">
          Sent for review.
        </h1>
        <p className="mt-5 max-w-[48ch] text-[16px] leading-relaxed text-[#736f65] sm:text-[18px]">
          The desk will look at the piece. If everything checks out it is approved and appears on its category
          shelf. It is not live yet.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className={`${CTA} bg-[#16150f] text-white hover:opacity-85`}>
            Back to the gallery
          </Link>
          <Link
            href="/submit"
            className={`${CTA} border border-[#e7e3da] bg-white text-[#16150f] hover:border-[#d5cfc2]`}
          >
            Submit another
          </Link>
        </div>
      </div>
    </GuideShell>
  );
}
