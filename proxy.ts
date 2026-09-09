import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { galleryRedirectTarget, isShelfSlug } from "@/lib/gallery-url";

/**
 * One-hop 308s for leftover query shelves (`/?category=Web` → `/web`)
 * without forwarding `category=` onto the destination (which would chain).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const slug = pathname.replace(/^\//, "").replace(/\/$/, "");
  const gallery = pathname === "/" || isShelfSlug(slug);
  if (!gallery) return NextResponse.next();

  const dest = galleryRedirectTarget(pathname, search);
  if (!dest) return NextResponse.next();

  return NextResponse.redirect(new URL(dest, request.url), 308);
}

export const config = {
  matcher: ["/", "/web", "/branding", "/product", "/motion", "/illustration", "/3d", "/print", "/featured"],
};
