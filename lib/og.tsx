import { ImageResponse } from "next/og";

/**
 * Shared Open Graph / social-share image builder.
 * Used by app/opengraph-image.tsx and each viral tool's opengraph-image.tsx
 * so every link shared on WhatsApp / LinkedIn / X renders a branded preview card.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

interface OgOptions {
  eyebrow?: string;   // small label above the title
  title: string;      // main headline
  subtitle?: string;  // supporting line
  accent?: string;    // accent colour for eyebrow + rule
}

export function renderOgImage({ eyebrow, title, subtitle, accent = "#818cf8" }: OgOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(1200px 600px at 20% 0%, #1b1b4b 0%, #050B1A 55%)",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              fontSize: 40,
            }}
          >
            🧠
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800, color: "#ffffff" }}>
            <span>Career</span>
            <span style={{ color: "#818cf8" }}>Intel</span>
            <span style={{ color: "#fbbf24", fontSize: 22, marginLeft: 8, marginTop: 4 }}>SA</span>
          </div>
        </div>

        {/* Headline block */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {eyebrow && (
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 700,
                color: accent,
                textTransform: "uppercase",
                letterSpacing: 2,
                marginBottom: 20,
              }}
            >
              {eyebrow}
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.05,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                display: "flex",
                fontSize: 32,
                color: "rgba(255,255,255,0.6)",
                marginTop: 28,
                maxWidth: 980,
                lineHeight: 1.3,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Footer row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", width: 60, height: 5, background: accent, borderRadius: 4 }} />
            <div style={{ display: "flex", fontSize: 26, color: "rgba(255,255,255,0.55)" }}>
              careerintelsa.co.za
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "rgba(255,255,255,0.4)" }}>
            🇿🇦 Built for South Africa
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
