import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import CookieBanner from "@/components/cookie-banner";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "CareerIntel SA — AI Career Intelligence Platform",
    template: "%s | CareerIntel SA",
  },
  description:
    "South Africa's leading AI-powered career intelligence platform. Build winning CVs, discover in-demand careers, close skills gaps, and predict your salary growth.",
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
    title: "CareerIntel SA — AI Career Intelligence Platform",
    description: "South Africa's #1 AI-powered career intelligence engine. Close the skills gap. Unlock your potential.",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans`}>
          <LanguageProvider>
            {children}
            <CookieBanner />
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
