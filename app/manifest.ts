import type { MetadataRoute } from "next";
import { siteConfig, SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: siteConfig.description,
    start_url: "/",
    display: "browser",
    background_color: "#faf9f7",
    theme_color: "#faf9f7",
    lang: siteConfig.language,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
