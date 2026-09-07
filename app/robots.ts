import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const origin = siteUrl().origin;
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/admin/", "/api/", "/studio"] }],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
