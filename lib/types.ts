export const CATEGORIES = [
  "Web",
  "Branding",
  "Product",
  "Motion",
  "Illustration",
  "3D",
  "Print",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const SORTS = ["Latest", "Featured"] as const;
export type Sort = (typeof SORTS)[number];

export type Post = {
  id: string;
  title: string;
  description: string;
  category: Category;
  creator: { handle: string; avatar: string };
  media: { src: string; width: number; height: number };
  slides: number;
  sourceUrl: string;
  featured: boolean;
  publishedAt: string;
};
