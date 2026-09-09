import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import GuideShell from "@/components/GuideShell";
import JsonLd from "@/components/JsonLd";
import { galleryHref } from "@/lib/gallery-url";
import { breadcrumbSchema, graph, organizationSchema, websiteSchema } from "@/lib/schema";
import { ABOUT_SEO, pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { CATEGORIES } from "@/lib/types";

export const metadata: Metadata = pageMetadata(ABOUT_SEO);

const CTA =
  "focus-ring inline-flex h-11 items-center justify-center rounded-full px-5 text-[15px] font-medium transition-[opacity,transform] active:scale-[0.98]";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "About", path: "/what-is" },
];

export default function WhatIsPage() {
  return (
    <GuideShell current="about">
      <JsonLd data={graph([organizationSchema(), websiteSchema(), breadcrumbSchema(CRUMBS)])} />
      <div className="mx-auto max-w-[920px] px-4 pb-8 pt-12 sm:px-6 sm:pt-16 xl:px-8">
        <Breadcrumbs crumbs={CRUMBS} />
        <p className="mt-5 text-[12px] uppercase tracking-[0.14em] text-[#a8a396]">The archive</p>
        <h1 className="display mt-3 max-w-[18ch] text-[34px] font-semibold leading-[1.05] sm:text-[48px] xl:text-[56px]">
          What is Spiffing?
        </h1>
        <p className="mt-5 max-w-[54ch] text-[16px] leading-relaxed text-[#736f65] sm:text-[18px]">
          {SITE_NAME} is a curated archive of interface, brand, product, print, motion, illustration
          and 3D design worth keeping. Cards stay readable. The desk behind them stays private.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/how-to-use" className={`${CTA} bg-[#16150f] text-white hover:opacity-85`}>
            How to use it
          </Link>
          <Link
            href="/"
            className={`${CTA} border border-[#e7e3da] bg-white text-[#16150f] hover:border-[#d5cfc2]`}
          >
            Browse the gallery
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-[920px] gap-px px-4 sm:px-6 xl:px-8">
        <section className="border-t border-[#e7e3da] py-12 sm:py-16">
          <h2 className="display text-[24px] font-semibold sm:text-[28px]">Purpose</h2>
          <p className="mt-4 max-w-[58ch] text-[16px] leading-relaxed text-[#4d4a42]">
            A public case of design that still holds: hierarchy you can read, type that behaves, and
            the one decision that was left out. It is not a shop, a moodboard dump, or a sign-up wall.
          </p>
        </section>

        <section className="border-t border-[#e7e3da] py-12 sm:py-16">
          <h2 className="display text-[24px] font-semibold sm:text-[28px]">Editorial approach</h2>
          <p className="mt-4 max-w-[58ch] text-[16px] leading-relaxed text-[#4d4a42]">
            Pieces are added weekly and kept intentionally small. A listing is a still, a title, a
            short description, a designer handle and a category. Featured work sits at the front of
            that list when you ask for it. Search matches words across title, description, concept,
            handle and category.
          </p>
        </section>

        <section className="border-t border-[#e7e3da] py-12 sm:py-16">
          <h2 className="display text-[24px] font-semibold sm:text-[28px]">Curation</h2>
          <p className="mt-4 max-w-[58ch] text-[16px] leading-relaxed text-[#4d4a42]">
            The shelf is a working archive, not an algorithm. Work stays if the idea is still visible
            after the decoration is ignored. The public site never links to the desk. If you collect
            here, you type{" "}
            <code className="rounded-md bg-[#f1efe9] px-1.5 py-0.5 font-mono text-[14px]">/admin</code>{" "}
            yourself.
          </p>
        </section>

        <section className="border-t border-[#e7e3da] py-12 sm:py-16">
          <h2 className="display text-[24px] font-semibold sm:text-[28px]">Categories</h2>
          <p className="mt-4 max-w-[58ch] text-[16px] leading-relaxed text-[#4d4a42]">
            Seven shelves, plus Featured. Each one is its own page.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <li key={category}>
                <Link
                  href={galleryHref({ category })}
                  className="focus-ring inline-flex h-9 items-center rounded-full border border-[#e7e3da] bg-white px-4 text-[14px] text-[#16150f] hover:border-[#d5cfc2]"
                >
                  {category}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/featured"
                className="focus-ring inline-flex h-9 items-center rounded-full border border-[#e7e3da] bg-white px-4 text-[14px] text-[#16150f] hover:border-[#d5cfc2]"
              >
                Featured
              </Link>
            </li>
          </ul>
        </section>

        <section className="border-t border-[#e7e3da] py-12 sm:py-16">
          <h2 className="display text-[24px] font-semibold sm:text-[28px]">Attribution and rights</h2>
          <p className="mt-4 max-w-[58ch] text-[16px] leading-relaxed text-[#4d4a42]">
            Seed artwork in this archive was generated for Spiffing. Uploaded pieces keep the
            designer handle you set. An original URL appears only when it is filled. Do not treat
            the stills as a licence to reuse someone else’s work — follow the source link when it
            exists, and ask the maker when it does not.
          </p>
        </section>

        <section className="border-t border-[#e7e3da] py-12 sm:py-16">
          <h2 className="display text-[24px] font-semibold sm:text-[28px]">What a piece looks like</h2>
          <p className="mt-4 max-w-[58ch] text-[16px] leading-relaxed text-[#4d4a42]">
            On the card: a 3:2 cover, preview thumbs, title, two lines of description, then category
            and handle. On the piece page: artwork, metadata, related work, and a concept band.
            Escape returns to the gallery. Arrow keys walk the shelf.
          </p>
        </section>
      </div>

      <div className="mx-auto max-w-[920px] px-4 pb-20 sm:px-6 xl:px-8">
        <div className="rounded-[1.35rem] border border-[#e7e3da] bg-white px-6 py-10 sm:px-10 sm:py-12">
          <h2 className="display text-[24px] font-semibold sm:text-[28px]">Put it to work.</h2>
          <p className="mt-3 max-w-[46ch] text-[16px] leading-relaxed text-[#736f65]">
            Four steps to browse the shelf, and four more if you publish from the desk.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/how-to-use" className={`${CTA} bg-[#16150f] text-white hover:opacity-85`}>
              Open the tutorial
            </Link>
            <Link
              href="/"
              className={`${CTA} border border-[#e7e3da] bg-[#faf9f7] text-[#16150f] hover:border-[#d5cfc2]`}
            >
              See the cards
            </Link>
          </div>
        </div>
      </div>
    </GuideShell>
  );
}
