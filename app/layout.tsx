import type { Metadata } from "next";
import { Urbanist, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: {
    default: "WACUS",
    template: "%s | WACUS",
  },
  description: "화려한 3D 인터랙션을 경험하세요",
  keywords: ["3D", "Three.js", "인터랙션", "홍보사이트"],
  authors: [{ name: "WACUS" }],
  creator: "WACUS",
  publisher: "WACUS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    title: "WACUS",
    description: "화려한 3D 인터랙션을 경험하세요",
    siteName: "WACUS",
  },
  twitter: {
    card: "summary_large_image",
    title: "WACUS",
    description: "화려한 3D 인터랙션을 경험하세요",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Google Search Console 등에서 받은 verification 코드를 추가하세요
    // google: "verification_code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth">
      <body
        className={`${urbanist.variable} ${notoSansKR.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
