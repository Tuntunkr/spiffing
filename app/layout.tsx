import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Inter, Montserrat } from "next/font/google";
import Analytics from "@/components/Analytics";
import JsonLd from "@/components/JsonLd";
import { GA_ID } from "@/lib/analytics";
import { graph, organizationSchema, websiteSchema } from "@/lib/schema";
import { siteConfig, siteUrl, SITE_NAME } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
const bingVerification = process.env.BING_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: { default: siteConfig.title, template: `%s — ${SITE_NAME}` },
  description: siteConfig.description,
  applicationName: SITE_NAME,
  authors: [{ name: siteConfig.creator, url: siteUrl() }],
  creator: siteConfig.creator,
  publisher: SITE_NAME,
  category: siteConfig.category,
  keywords: ["design archive", "design inspiration", "curated design", "Spiffing"],
  alternates: {
    types: {
      "application/rss+xml": [
        { url: "/feed.xml", title: `${SITE_NAME} RSS Feed` },
      ],
    },
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    type: "website",
    locale: siteConfig.locale,
    siteName: SITE_NAME,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon" }],
  },
  verification: {
    google: googleVerification || undefined,
    other: bingVerification ? { "msvalidate.01": bingVerification } : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#faf9f7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={siteConfig.language} className={`${inter.variable} ${montserrat.variable}`}>
      <body className="font-sans antialiased">
        <JsonLd data={graph([organizationSchema(), websiteSchema()])} />
        {children}
        <Analytics />
        {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
      </body>
    </html>
  );
}
