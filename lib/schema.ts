import { galleryHref } from "./gallery-url";
import { pieceAlt, pieceCanonical } from "./seo";
import { absoluteUrl, siteConfig, SITE_NAME } from "./site";
import type { Post } from "./types";

type JsonLd = Record<string, unknown>;

const ORG_ID = () => `${absoluteUrl("/")}#organization`;
const SITE_ID = () => `${absoluteUrl("/")}#website`;

export function organizationSchema(): JsonLd {
  return {
    "@type": "Organization",
    "@id": ORG_ID(),
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/icon.svg"),
    description: siteConfig.description,
  };
}

export function websiteSchema(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": SITE_ID(),
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: siteConfig.description,
    inLanguage: siteConfig.language,
    publisher: { "@id": ORG_ID() },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbSchema(crumbs: Crumb[]): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function collectionSchema(opts: {
  name: string;
  description: string;
  path: string;
  posts: Post[];
}): JsonLd {
  return {
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    isPartOf: { "@id": SITE_ID() },
    mainEntity: itemListSchema(opts.posts, opts.path),
  };
}

export function itemListSchema(posts: Post[], path: string): JsonLd {
  return {
    "@type": "ItemList",
    numberOfItems: posts.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    url: absoluteUrl(path),
    itemListElement: posts.slice(0, 40).map((post, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(pieceCanonical(post)),
      name: post.title,
    })),
  };
}

export function creativeWorkSchema(post: Post): JsonLd {
  const url = absoluteUrl(pieceCanonical(post));
  const image = post.media.src.startsWith("http") ? post.media.src : absoluteUrl(post.media.src);
  return {
    "@type": "CreativeWork",
    name: post.title,
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: url,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    inLanguage: siteConfig.language,
    genre: post.category,
    creator: {
      "@type": "Person",
      name: post.creator.handle,
    },
    publisher: { "@id": ORG_ID() },
    isPartOf: { "@id": SITE_ID() },
    image: {
      "@type": "ImageObject",
      url: image,
      width: post.media.width,
      height: post.media.height,
      caption: pieceAlt(post),
    },
  };
}

export function howToSchema(): JsonLd {
  return {
    "@type": "HowTo",
    name: "How to browse the Spiffing design archive",
    description:
      "Browse, search and open pieces in the Spiffing archive by category, featured work and individual design.",
    url: absoluteUrl("/how-to-use"),
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Open the gallery",
        text: "Start at the homepage. The masthead, category shelves and the card grid are the public surface.",
        url: absoluteUrl("/how-to-use#open-the-gallery"),
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Filter or search",
        text: "Open a category shelf or press / to search. Every word in the query must match.",
        url: absoluteUrl("/how-to-use#filter-or-search"),
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Open a piece",
        text: "Open a card for the artwork, metadata and concept. Escape returns to the gallery.",
        url: absoluteUrl("/how-to-use#open-a-piece"),
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Keep a feed",
        text: "Subscribe to the RSS feed or bookmark Featured for the rust-pipped work.",
        url: absoluteUrl("/how-to-use#keep-a-feed"),
      },
    ],
  };
}

export function pieceBreadcrumbs(post: Post): Crumb[] {
  return [
    { name: "Home", path: "/" },
    { name: post.category, path: galleryHref({ category: post.category }) },
    { name: post.title, path: pieceCanonical(post) },
  ];
}

export function shelfBreadcrumbs(name: string, path: string): Crumb[] {
  return [
    { name: "Home", path: "/" },
    { name, path },
  ];
}

export function graph(nodes: JsonLd[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
