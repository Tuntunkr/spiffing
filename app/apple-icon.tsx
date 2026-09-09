import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS home-screen icon — same ink square and geometric S as `app/icon.svg`. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#16150f",
          borderRadius: 40,
        }}
      >
        <svg width="118" height="118" viewBox="0 0 32 32">
          <rect x="2.6" y="2.6" width="26.8" height="26.8" rx="3" fill="none" stroke="#faf9f7" strokeWidth="2.6" />
          <path d="M11.1 9.15h9.8v3.05h-6.55v1.85h6.55v7.8H11.1v-3.05h6.55v-1.85H11.1z" fill="#faf9f7" />
        </svg>
      </div>
    ),
    size,
  );
}
