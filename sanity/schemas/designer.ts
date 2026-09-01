import { defineField, defineType } from "sanity";

export const designer = defineType({
  name: "designer",
  title: "Designer",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "handle",
      title: "Handle",
      type: "string",
      description: "Shown under the work, without the @.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "url",
      title: "Profile URL",
      type: "url",
    }),
    defineField({
      name: "avatar",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "handle", media: "avatar" },
  },
});
