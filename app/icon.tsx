import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Generated favicon: brain mark on the brand indigo→violet gradient.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6366f1, #a855f7)",
          borderRadius: 14,
          fontSize: 38,
        }}
      >
        🧠
      </div>
    ),
    { ...size }
  );
}
