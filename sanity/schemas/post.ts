import { defineField, defineType } from "sanity";
import { CATEGORIES } from "../../lib/types";

export const post = defineType({
  name: "post",
  title: "Piece",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Used as the URL: /posts/<slug>",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "image",
      title: "Artwork",
      type: "image",
      options: { hotspot: true },
      description: "The aspect ratio of this image drives its size in the gallery.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      validation: (r) => r.required().max(300),
    }),
    defineField({
      name: "concept",
      title: "Concept",
      type: "text",
      rows: 5,
      description: "Longer note shown in the dark band under the piece. Falls back to description if empty.",
      validation: (r) => r.max(800),
    }),
    defineField({
      name: "category",
      type: "string",
      options: { list: [...CATEGORIES] },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "designer",
      type: "reference",
      to: [{ type: "designer" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "sourceUrl",
      title: "Original URL",
      type: "url",
      description: "Where the work lives. Linked from the detail view.",
    }),
    defineField({
      name: "slides",
      title: "Frames",
      type: "number",
      initialValue: 1,
      validation: (r) => r.min(1).integer(),
    }),
    defineField({
      name: "featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "image" },
  },
});
