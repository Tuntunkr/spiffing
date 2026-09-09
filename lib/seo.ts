import type { Metadata } from "next";
import { galleryHref, type GalleryQuery } from "./gallery-url";
import { absoluteUrl, siteConfig, SITE_NAME } from "./site";
import type { Category, Post } from "./types";

export type SeoPage = {
  title: string;
  description: string;
  canonical: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogType?: "website" | "article";
  index: boolean;
};

export const HOME_SEO: SeoPage = {
  title: siteConfig.title,
  description:
    "Explore a curated archive of interface, brand, product, print, motion, illustration and 3D design worth keeping.",
  canonical: "/",
  keywords: ["design archive", "curated design archive", "design inspiration", "interface design inspiration"],
  index: true,
};

export const ABOUT_SEO: SeoPage = {
  title: "About Spiffing — A Curated Design Archive",
  description:
    "Learn what Spiffing is, how the design archive is curated, and why the collection focuses on interface, brand, print and product design.",
  canonical: "/what-is",
  keywords: ["what is Spiffing", "curated design archive", "design collection"],
  index: true,
};

export const SUBMIT_SEO: SeoPage = {
  title: "Submit a Design — Spiffing Archive",
  description:
    "Submit interface, brand, product or print work to the Spiffing archive. The desk reviews every piece before it appears on a category shelf.",
  canonical: "/submit",
  keywords: ["submit design", "design archive submission", "curated design gallery"],
  index: true,
};

export const HOWTO_SEO: SeoPage = {
  title: "How to Use Spiffing — Browse the Design Archive",
  description:
    "Learn how to browse, search and explore the Spiffing design archive by category, featured work and individual design pieces.",
  canonical: "/how-to-use",
  keywords: ["browse design archive", "design inspiration gallery"],
  index: true,
};

export type ShelfSeo = SeoPage & {
  h1: string;
  intro: string;
  intent: string;
};

export const SHELF_SEO: Record<string, ShelfSeo> = {
  web: {
    title: "Web Design Inspiration — Curated Web Design Archive | Spiffing",
    description:
      "Explore a curated collection of web design, interface layouts, dashboards, landing pages and digital experiences.",
    canonical: "/web",
    keywords: ["web design inspiration", "UI inspiration", "interface design archive"],
    h1: "Web",
    intro:
      "Interface layouts, dashboards, landing pages and documentation — collected when the hierarchy still holds at a glance.",
    intent: "Web design inspiration",
    index: true,
  },
  branding: {
    title: "Branding Inspiration — Curated Brand Design Archive | Spiffing",
    description:
      "Explore selected identity systems, logos, visual identities and branding work from the Spiffing archive.",
    canonical: "/branding",
    keywords: ["branding inspiration", "identity design", "logo archive"],
    h1: "Branding",
    intro:
      "Marks, type ramps and quiet systems that still read at a stamp, a sign, and sixteen pixels.",
    intent: "Branding inspiration",
    index: true,
  },
  product: {
    title: "Product Design Inspiration — Curated Archive | Spiffing",
    description:
      "Explore curated product design, apps, wallets, tools and digital product experiences from the Spiffing archive.",
    canonical: "/product",
    keywords: ["product design", "app design", "product UI archive"],
    h1: "Product",
    intro: "Apps and tools where the quiet states are designed as carefully as the happy path.",
    intent: "Product design",
    index: true,
  },
  motion: {
    title: "Motion Design Inspiration — Curated Motion Archive | Spiffing",
    description:
      "Explore selected motion studies, loaders, animation concepts and motion design from the Spiffing archive.",
    canonical: "/motion",
    keywords: ["motion design", "animation inspiration", "loader design"],
    h1: "Motion",
    intro: "Studies and loaders that have to survive as a still. Timing first, decoration never.",
    intent: "Motion design",
    index: true,
  },
  illustration: {
    title: "Illustration Inspiration — Curated Illustration Archive | Spiffing",
    description:
      "Explore curated illustration work, visual studies and editorial illustration from the Spiffing archive.",
    canonical: "/illustration",
    keywords: ["illustration inspiration", "editorial illustration"],
    h1: "Illustration",
    intro: "Spot series and editorial openers drawn to a grid so a set stays a set.",
    intent: "Illustration inspiration",
    index: true,
  },
  "3d": {
    title: "3D Design Inspiration — Curated 3D Archive | Spiffing",
    description: "Explore selected 3D design, rendered objects, material studies and visual experiments.",
    canonical: "/3d",
    keywords: ["3D design", "3D inspiration", "material study"],
    h1: "3D",
    intro: "Light, material and proportion held still so the form can be judged.",
    intent: "3D design",
    index: true,
  },
  print: {
    title: "Print Design Inspiration — Curated Print Archive | Spiffing",
    description:
      "Explore selected print design, editorial layouts, programmes, typography and physical design work.",
    canonical: "/print",
    keywords: ["print design", "editorial design", "typography archive"],
    h1: "Print",
    intro: "Specimens, programmes and reports sized for the hand, not a lightbox.",
    intent: "Print design",
    index: true,
  },
  featured: {
    title: "Featured Design — Best of the Spiffing Archive",
    description:
      "Explore featured selections from the Spiffing archive, covering web, branding, product, motion, illustration, 3D and print design.",
    canonical: "/featured",
    keywords: ["featured design", "best design archive"],
    h1: "Featured",
    intro: "The rust-pipped work — a short shelf across every category, not a second site.",
    intent: "Featured design",
    index: true,
  },
};

const CATEGORY_KIND: Record<Category, string> = {
  Web: "Web Design",
  Branding: "Brand Design",
  Product: "Product Design",
  Motion: "Motion Design",
  Illustration: "Illustration",
  "3D": "3D Design",
  Print: "Print Design",
};

export function pieceTitle(post: Post): string {
  return `${post.title} — ${CATEGORY_KIND[post.category]} | ${SITE_NAME}`;
}

export function pieceDescription(post: Post): string {
  const lead = post.description.trim();
  if (lead.length >= 80) return lead;
  const extra = `Explore ${post.title}, ${CATEGORY_KIND[post.category].toLowerCase()} from the ${SITE_NAME} archive.`;
  return lead ? `${lead} ${extra}` : extra;
}

export function pieceAlt(post: Post): string {
  const detail = post.description.replace(/\s+/g, " ").trim();
  const clipped = detail.length > 140 ? `${detail.slice(0, 137).trimEnd()}…` : detail;
  return clipped ? `${post.title}. ${clipped}` : `${post.title}, ${CATEGORY_KIND[post.category].toLowerCase()} from ${SITE_NAME}`;
}

export function pieceCanonical(post: Post): string {
  return `/posts/${post.id}`;
}

export function pageMetadata(page: SeoPage, extras: Metadata = {}): Metadata {
  const url = absoluteUrl(page.canonical);
  return {
    title: { absolute: page.title },
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: page.canonical },
    robots: page.index
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title: page.ogTitle ?? page.title,
      description: page.ogDescription ?? page.description,
      url,
      type: page.ogType ?? "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: page.ogTitle ?? page.title,
      description: page.ogDescription ?? page.description,
    },
    ...extras,
  };
}

export function galleryMetadata(query: GalleryQuery): Metadata {
  if (query.q) {
    const label = query.category !== "All" ? `${query.category} search` : "Search";
    return pageMetadata({
      title: `${label} — ${SITE_NAME}`,
      description: `Search results in the ${SITE_NAME} design archive.`,
      canonical: galleryHref({ category: query.category, sort: query.sort }),
      index: false,
    });
  }

  if (query.category !== "All" && query.sort === "Latest") {
    const slug = query.category === "3D" ? "3d" : query.category.toLowerCase();
    const shelf = SHELF_SEO[slug];
    if (shelf) return pageMetadata(shelf);
  }

  if (query.category === "All" && query.sort === "Featured") {
    return pageMetadata(SHELF_SEO.featured);
  }

  if (query.category !== "All") {
    const slug = query.category === "3D" ? "3d" : query.category.toLowerCase();
    const shelf = SHELF_SEO[slug];
    if (shelf) {
      return pageMetadata({
        ...shelf,
        canonical: galleryHref({ category: query.category }),
        index: false,
      });
    }
  }

  return pageMetadata(HOME_SEO);
}

export function pieceMetadata(post: Post): Metadata {
  const canonical = pieceCanonical(post);
  const title = pieceTitle(post);
  const description = pieceDescription(post);
  const image = {
    url: post.media.src,
    width: post.media.width,
    height: post.media.height,
    alt: pieceAlt(post),
  };
  return pageMetadata(
    {
      title,
      description,
      canonical,
      ogType: "article",
      index: true,
    },
    {
      authors: [{ name: post.creator.handle }],
      openGraph: {
        title,
        description,
        url: absoluteUrl(canonical),
        type: "article",
        locale: siteConfig.locale,
        siteName: siteConfig.name,
        publishedTime: post.publishedAt,
        modifiedTime: post.publishedAt,
        images: [image],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [post.media.src],
      },
    },
  );
}

export function collectIndexableTitles(): string[] {
  return [
    HOME_SEO.title,
    ABOUT_SEO.title,
    HOWTO_SEO.title,
    SUBMIT_SEO.title,
    ...Object.values(SHELF_SEO).map((page) => page.title),
  ];
}

export function collectIndexableDescriptions(): string[] {
  return [
    HOME_SEO.description,
    ABOUT_SEO.description,
    HOWTO_SEO.description,
    SUBMIT_SEO.description,
    ...Object.values(SHELF_SEO).map((page) => page.description),
  ];
}
