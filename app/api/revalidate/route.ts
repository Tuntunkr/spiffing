import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { POSTS_TAG } from "@/lib/sanity/client";

/**
 * Sanity webhook target. Publishing in the Studio busts the gallery's cache
 * tag, so new work is live within seconds without a redeploy.
 *
 * Configure in Sanity: API → Webhooks → URL <site>/api/revalidate, and set the
 * same secret here as SANITY_REVALIDATE_SECRET.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { message: "SANITY_REVALIDATE_SECRET is not set" },
      { status: 500 },
    );
  }

  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(req, secret);

    if (!isValidSignature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }
    if (!body?._type) {
      return NextResponse.json({ message: "Missing _type in payload" }, { status: 400 });
    }

    // Next 16 requires a cacheLife profile; "max" purges the tag outright.
    revalidateTag(POSTS_TAG, "max");
    return NextResponse.json({ revalidated: true, type: body._type, now: Date.now() });
  } catch (error) {
    console.error("[revalidate] webhook failed:", error);
    return NextResponse.json({ message: "Webhook handling failed" }, { status: 500 });
  }
}
