import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import CopyBlock from "@/components/CopyBlock";
import GuideShell from "@/components/GuideShell";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema, graph, howToSchema, organizationSchema, websiteSchema } from "@/lib/schema";
import { HOWTO_SEO, pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = pageMetadata(HOWTO_SEO);

const CTA =
  "focus-ring inline-flex h-11 items-center justify-center rounded-full px-5 text-[15px] font-medium transition-[opacity,transform] active:scale-[0.98]";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "How to use", path: "/how-to-use" },
];

const BROWSE = [
  {
    id: "open-the-gallery",
    n: "01",
    title: "Open the gallery.",
    body: "Start at the home page. The masthead, category shelves and the card grid are the whole public surface. Featured is its own shelf, not a second site.",
  },
  {
    id: "filter-or-search",
    n: "02",
    title: "Filter or search.",
    body: "Chips open /web, /branding and the other shelves. Counts sit on the chip. Press / anywhere on the gallery to focus search. Every word in the query must match.",
  },
  {
    id: "open-a-piece",
    n: "03",
    title: "Open a piece.",
    body: "The card is a listing, not a hover caption. Thumbs switch the cover crop. On the piece page: artwork, metadata, related work, concept band. Escape goes home. Arrows walk neighbours.",
  },
  {
    id: "keep-a-feed",
    n: "04",
    title: "Keep a feed.",
    body: "RSS lists the newest fifty pieces. Bookmark Featured if you only want the rust-pipped work. The shelf is meant to stay small.",
  },
];

const PUBLISH = [
  {
    n: "01",
    title: "Type /admin.",
    body: "There is no public Admin link. The address bar is the door. An unknown session lands on Desk sign in.",
  },
  {
    n: "02",
    title: "Sign in to the desk.",
    body: "One account: the email in ADMIN_EMAIL. Five failed attempts lock that client for fifteen minutes. The session lasts a week unless the password changes.",
  },
  {
    n: "03",
    title: "Add a piece.",
    body: "Category, title, description, artwork and designer handle. Concept is optional. Original URL is optional. Publish puts it at the top of Latest.",
  },
  {
    n: "04",
    title: "Keep Settings honest.",
    body: "Seed archive on: the public gallery also shows the built-in sample work. Off: only what you uploaded. Change the password when you take the desk live.",
  },
];

export default function HowToUsePage() {
  return (
    <GuideShell current="howto">
      <JsonLd
        data={graph([organizationSchema(), websiteSchema(), breadcrumbSchema(CRUMBS), howToSchema()])}
      />
      <div className="mx-auto max-w-[920px] px-4 pb-8 pt-12 sm:px-6 sm:pt-16 xl:px-8">
        <Breadcrumbs crumbs={CRUMBS} />
        <p className="mt-5 inline-flex items-center rounded-full border border-[#e7e3da] bg-white px-3 py-1 text-[12px] text-[#736f65]">
          Tutorial · 8 steps
        </p>
        <h1 className="display mt-4 max-w-[16ch] text-[34px] font-semibold leading-[1.05] sm:text-[48px] xl:text-[56px]">
          How to browse the archive.
        </h1>
        <p className="mt-5 max-w-[54ch] text-[16px] leading-relaxed text-[#736f65] sm:text-[18px]">
          Anyone can browse {SITE_NAME}. Only the archive admin publishes. Four steps for visitors,
          four for the desk. Same cards either way.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className={`${CTA} bg-[#16150f] text-white hover:opacity-85`}>
            Browse the gallery
          </Link>
          <Link
            href="/what-is"
            className={`${CTA} border border-[#e7e3da] bg-white text-[#16150f] hover:border-[#d5cfc2]`}
          >
            What is this
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[920px] px-4 sm:px-6 xl:px-8">
        <h2 className="display text-[24px] font-semibold sm:text-[28px]">Browse</h2>
        <ol className="mt-8">
          {BROWSE.map((step) => (
            <li
              key={step.n}
              id={step.id}
              className="grid gap-3 border-t border-[#e7e3da] py-8 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-8"
            >
              <p className="display text-[22px] font-semibold tabular-nums text-[#a8a396]">{step.n}</p>
              <div>
                <h3 className="display text-[20px] font-semibold">{step.title}</h3>
                <p className="mt-2 max-w-[54ch] text-[15px] leading-relaxed text-[#736f65]">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="grid gap-4 pb-4 sm:grid-cols-2">
          <CopyBlock label="Search shortcut" filename="keyboard" value="/" />
          <CopyBlock label="RSS" filename="feed.xml" value="/feed.xml" />
        </div>
      </div>

      <div className="mx-auto max-w-[920px] px-4 pt-10 sm:px-6 xl:px-8">
        <h2 className="display text-[24px] font-semibold sm:text-[28px]">Publish</h2>
        <p className="mt-3 max-w-[54ch] text-[15px] leading-relaxed text-[#736f65]">
          The desk is a private catalog. Public chrome does not point at it. If you run this
          archive, these four steps are the whole loop.
        </p>
        <ol className="mt-8">
          {PUBLISH.map((step) => (
            <li key={step.n} className="grid gap-3 border-t border-[#e7e3da] py-8 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-8">
              <p className="display text-[22px] font-semibold tabular-nums text-[#a8a396]">{step.n}</p>
              <div>
                <h3 className="display text-[20px] font-semibold">{step.title}</h3>
                <p className="mt-2 max-w-[54ch] text-[15px] leading-relaxed text-[#736f65]">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="grid gap-4">
          <CopyBlock label="Desk path" filename="address bar" value="/admin" />
          <CopyBlock
            label="What the form needs"
            filename="piece"
            value={`category   one of Web, Branding, Product, Motion, Illustration, 3D, Print
title      required, 80 characters
artwork    JPG, PNG, WebP or GIF, up to 8 MB
handle     designer name, no @
concept    optional. shows in the ink band
sourceUrl  optional. hides View the original when empty`}
          />
        </div>

        <h2 className="display mt-16 text-[24px] font-semibold sm:text-[28px]">Contribute</h2>
        <p className="mt-3 max-w-[54ch] text-[15px] leading-relaxed text-[#736f65]">
          Anyone can send a piece. It waits in the desk inbox. If it holds up, it is approved onto its
          category shelf. It does not go live on submit.
        </p>
        <ol className="mt-8">
          <li className="grid gap-3 border-t border-[#e7e3da] py-8 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-8">
            <p className="display text-[22px] font-semibold tabular-nums text-[#a8a396]">01</p>
            <div>
              <h3 className="display text-[20px] font-semibold">Open Submit.</h3>
              <p className="mt-2 max-w-[54ch] text-[15px] leading-relaxed text-[#736f65]">
                The button sits on the right of the header. Category, title, description, artwork and a
                designer handle. Your email stays with the desk.
              </p>
            </div>
          </li>
          <li className="grid gap-3 border-t border-[#e7e3da] py-8 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-8">
            <p className="display text-[22px] font-semibold tabular-nums text-[#a8a396]">02</p>
            <div>
              <h3 className="display text-[20px] font-semibold">Wait for the desk.</h3>
              <p className="mt-2 max-w-[54ch] text-[15px] leading-relaxed text-[#736f65]">
                Approved work appears on the matching category tab. Rejected work never reaches the
                gallery.
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="mx-auto max-w-[920px] px-4 py-20 sm:px-6 xl:px-8">
        <div className="rounded-[1.35rem] border border-[#e7e3da] bg-white px-6 py-10 sm:px-10 sm:py-12">
          <h2 className="display text-[24px] font-semibold sm:text-[28px]">That is the whole loop.</h2>
          <p className="mt-3 max-w-[46ch] text-[16px] leading-relaxed text-[#736f65]">
            Browse with shelves and search. Publish from the desk when you have something worth
            keeping. The gallery stays the same size on purpose.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className={`${CTA} bg-[#16150f] text-white hover:opacity-85`}>
              Open the gallery
            </Link>
            <Link
              href="/what-is"
              className={`${CTA} border border-[#e7e3da] bg-[#faf9f7] text-[#16150f] hover:border-[#d5cfc2]`}
            >
              What is this
            </Link>
          </div>
        </div>
      </div>
    </GuideShell>
  );
}
