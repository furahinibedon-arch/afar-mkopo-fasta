import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://afarmkopo.xyz"),
  title: {
    default: "AFAR MKOPO FASTA - Mkopo wa Haraka Tanzania | Fast Loans Mbeya",
    template: "%s | AFAR MKOPO FASTA",
  },
  description: "AFAR MKOPO FASTA ni kampuni ya mikopo ya haraka Mbeya, Tanzania. Pata mkopo wako mtandaoni kwa urahisi na usalama. Fast microfinance loans in Mbeya Tanzania - apply online today.",
  keywords: ["mkopo haraka", "mkopo Mbeya", "microfinance Tanzania", "fast loans Tanzania", "AFAR mkopo", "mkopo fasta", "loan Mbeya", "afar mkopo fasta", "mkopo online Tanzania"],
  applicationName: "AFAR MKOPO FASTA",
  authors: [{ name: "AFAR MKOPO FASTA", url: "https://afarmkopo.xyz" }],
  creator: "AFAR MKOPO FASTA",
  publisher: "Helder Company",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "sw_TZ",
    alternateLocale: "en_US",
    url: "https://afarmkopo.xyz",
    siteName: "AFAR MKOPO FASTA",
    title: "AFAR MKOPO FASTA - Mkopo wa Haraka Tanzania",
    description: "Pata mkopo wako mtandaoni kwa urahisi na usalama. Fast microfinance loans in Mbeya Tanzania.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "AFAR MKOPO FASTA Logo" }],
  },
  twitter: {
    card: "summary",
    title: "AFAR MKOPO FASTA - Mkopo wa Haraka Tanzania",
    description: "Pata mkopo wako mtandaoni kwa urahisi na usalama. Fast microfinance loans in Mbeya Tanzania.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://afarmkopo.xyz",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.svg", sizes: "32x32", type: "image/svg+xml" },
      { url: "/favicon-16x16.svg", sizes: "16x16", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
    apple: { url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    shortcut: "/favicon.svg",
  },
  verification: {
    google: "fsCGItR5rF6YA3SCYen3x3r9SwMXqjDoVRB6UxxuAiU4",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sw">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FinancialService",
              "name": "AFAR MKOPO FASTA",
              "alternateName": "Afar Mkopo Fasta",
              "url": "https://afarmkopo.xyz",
              "logo": "https://afarmkopo.xyz/logo.png",
              "description": "Fast microfinance loans in Mbeya, Tanzania. Mkopo wa haraka na salama.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Mbeya",
                "addressCountry": "TZ"
              },
              "telephone": "+255741525547",
              "areaServed": "TZ",
              "currenciesAccepted": "TZS",
              "openingHours": "Mo-Fr 08:00-17:00",
              "sameAs": ["https://afarmkopo.xyz"]
            })
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}

