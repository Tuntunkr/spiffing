import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME} — Design worth keeping`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="52" height="52" viewBox="0 0 32 32">
            <rect x="2.6" y="2.6" width="26.8" height="26.8" rx="3" fill="none" stroke="#16150f" strokeWidth="3.2" />
            <path d="M10 10.5h4.1l2 8 2-8H22l-4.2 13h-3.6L10 10.5Z" fill="#16150f" />
          </svg>
          <span style={{ fontSize: 34, fontWeight: 600, letterSpacing: -0.8 }}>{SITE_NAME}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 88, fontWeight: 600, letterSpacing: -3, lineHeight: 1.02 }}>
            Design worth keeping.
          </div>
          <div style={{ fontSize: 30, color: "#736f65", maxWidth: 900, lineHeight: 1.35 }}>
            {SITE_DESCRIPTION}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 24, color: "#736f65" }}>
          <div style={{ width: 12, height: 12, borderRadius: 999, background: "#c2452c" }} />
          Interface · Brand · Print
        </div>
      </div>
    ),
    size,
  );
}
