/**
 * One projection shared by every read, shaped to match the `Post` type so the
 * components do not care whether the data came from Sanity or the seed set.
 */
export const POST_PROJECTION = /* groq */ `{
  "id": slug.current,
  title,
  description,
  category,
  "creator": {
    "handle": coalesce(designer->handle, "unknown"),
    "avatar": coalesce(designer->avatar.asset->url, "")
  },
  "media": {
    "src": image.asset->url,
    "width": coalesce(image.asset->metadata.dimensions.width, 1600),
    "height": coalesce(image.asset->metadata.dimensions.height, 1200)
  },
  "slides": coalesce(slides, 1),
  "sourceUrl": coalesce(sourceUrl, ""),
  "featured": coalesce(featured, false),
  "publishedAt": coalesce(publishedAt, _createdAt)
}`;

export const ALL_POSTS_QUERY = /* groq */ `
  *[_type == "post" && defined(slug.current) && defined(image)]
  | order(publishedAt desc) ${POST_PROJECTION}
`;
