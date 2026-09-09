import { ImageResponse } from "next/og";
import { getPost } from "@/lib/posts";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME} piece`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function PieceOg({ params }: { params: Promise<{ id: string }> }) {
  const post = await getPost((await params).id);
  const title = post?.title ?? SITE_NAME;
  const category = post?.category ?? "Archive";
  const description = post?.description ?? "A piece from the Spiffing design archive.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#faf9f7",
          color: "#16150f",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 28, fontWeight: 600 }}>{SITE_NAME}</span>
          <span style={{ fontSize: 22, color: "#736f65" }}>{category}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 600, letterSpacing: -2, lineHeight: 1.05, maxWidth: 980 }}>
            {title}
          </div>
          <div style={{ fontSize: 26, color: "#736f65", maxWidth: 900, lineHeight: 1.35 }}>
            {description}
          </div>
        </div>
        <div style={{ fontSize: 22, color: "#736f65" }}>Design worth keeping.</div>
      </div>
    ),
    size,
  );
}
