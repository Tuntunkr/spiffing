import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import GuideShell from "@/components/GuideShell";
import JsonLd from "@/components/JsonLd";
import SubmitForm from "@/components/SubmitForm";
import { submitPiece } from "./actions";
import { breadcrumbSchema, graph, organizationSchema, websiteSchema } from "@/lib/schema";
import { pageMetadata, SUBMIT_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(SUBMIT_SEO);

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Submit", path: "/submit" },
];

export default function SubmitPage() {
  return (
    <GuideShell current="submit">
      <JsonLd data={graph([organizationSchema(), websiteSchema(), breadcrumbSchema(CRUMBS)])} />
      <div className="mx-auto max-w-[1080px] px-4 pb-8 pt-12 sm:px-6 sm:pt-16 xl:px-8">
        <Breadcrumbs crumbs={CRUMBS} />
        <p className="mt-5 inline-flex items-center rounded-full border border-[#e7e3da] bg-white px-3 py-1 text-[12px] text-[#736f65]">
          Public submission
        </p>
        <h1 className="display mt-4 max-w-[16ch] text-[34px] font-semibold leading-[1.05] sm:text-[48px]">
          Submit a piece.
        </h1>
        <p className="mt-5 max-w-[54ch] text-[16px] leading-relaxed text-[#736f65] sm:text-[18px]">
          Fill in the work, the designer and a still. It stays in the desk inbox until it is checked. If it holds
          up, it is published on its category shelf.
        </p>
        <div className="mt-10">
          <SubmitForm action={submitPiece} />
        </div>
      </div>
    </GuideShell>
  );
}
