import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack does not walk up into the home dir.
  turbopack: { root: path.join(__dirname) },
  // Artwork is allowed up to 8 MB; leave headroom for multipart wrappers.
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "*.blob.vercel-storage.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/about", destination: "/what-is", permanent: true },
      { source: "/rss.xml", destination: "/feed.xml", permanent: true },
    ];
  },
};

export default nextConfig;
