import { getPosts } from "@/lib/posts";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** RSS 2.0 of the whole archive, newest first. */
export async function GET() {
  const origin = siteUrl().origin;
  const posts = (await getPosts()).slice(0, 50);
  const lastBuild = posts[0]?.publishedAt ?? new Date().toISOString();

  const items = posts
    .map((p) => {
      const link = `${origin}/posts/${p.id}`;
      const image = p.media.src.startsWith("http") ? p.media.src : `${origin}${p.media.src}`;
      return `    <item>
      <title>${escape(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <category>${escape(p.category)}</category>
      <dc:creator>${escape(p.creator.handle)}</dc:creator>
      <description>${escape(p.description)}</description>
      <enclosure url="${escape(image)}" type="image/*" length="0" />
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escape(SITE_NAME)}</title>
    <link>${origin}/</link>
    <atom:link href="${origin}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escape(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${new Date(lastBuild).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
