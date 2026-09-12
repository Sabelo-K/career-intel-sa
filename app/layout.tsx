import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import CookieBanner from "@/components/cookie-banner";
import { Analytics } from "@vercel/analytics/next";
import { SA_CAREER_COUNT } from "@/lib/data/career-count";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "CareerIntel SA — Your next career step",
    template: "%s | CareerIntel SA",
  },
  description:
    "Career guidance for South African learners, job seekers and working adults. Explore careers, compare routes and build a practical plan for your next step.",
  keywords: [
    "career guidance South Africa",
    "CV builder SA",
    "jobs South Africa",
    "career intelligence",
    "skills gap analysis",
    "employability score",
    "AI career coach",
    "salary prediction SA",
    "graduate employment",
    "4IR careers",
  ],
  authors: [{ name: "CareerIntel SA" }],
  creator: "CareerIntel SA",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "/",
    title: "CareerIntel SA — Your next career step",
    description: "Explore possibilities. Compare career routes. Take your next step with CareerIntel SA.",
    siteName: "CareerIntel SA",
  },
  twitter: {
    card: "summary_large_image",
    title: "CareerIntel SA",
    description: "South Africa's AI Career Intelligence Platform",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050B1A",
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CareerIntel SA",
  url: "https://careerintelsa.co.za",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    `South Africa's AI-powered career intelligence platform. Build CVs, benchmark salaries in ZAR, analyse skills gaps, and get AI career coaching for ${SA_CAREER_COUNT} SA careers.`,
  inLanguage: ["en-ZA", "zu", "xh", "af", "st", "tn", "nso"],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "ZAR",
    description: "Free tier — no credit card required",
  },
  publisher: {
    "@type": "Organization",
    name: "CareerIntel SA",
    url: "https://careerintelsa.co.za",
    areaServed: "ZA",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
          />
        </head>
        <body className={`${inter.variable} font-sans`}>
          {/* Inline script: apply saved theme before first paint to avoid flash */}
          <script dangerouslySetInnerHTML={{ __html: `
            (function() {
              try {
                var t = localStorage.getItem('careerintel-theme');
                var html = document.documentElement;
                if (t === 'light') { html.classList.remove('dark'); }
                else if (t === 'system') {
                  if (!window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    html.classList.remove('dark');
                  }
                }
              } catch(e) {}
            })();
          ` }} />
          <LanguageProvider>
            {children}
            <CookieBanner />
          </LanguageProvider>
          {/* Cookieless page + event analytics — keeps our "no tracking
              cookies" promise true, so no extra consent gate is required. */}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
