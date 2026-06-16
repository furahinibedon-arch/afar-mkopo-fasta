import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: {
    default: "AFAR MKOPO FASTA",
    template: "%s | AFAR MKOPO FASTA",
  },
  description: "Fast, reliable microfinance Tanzania",
  applicationName: "AFAR MKOPO FASTA",
  icons: {
    icon: [
      { url: "/favicon.svg",        type: "image/svg+xml" },
      { url: "/favicon-32x32.svg",  sizes: "32x32", type: "image/svg+xml" },
      { url: "/favicon-16x16.svg",  sizes: "16x16", type: "image/svg+xml" },
      { url: "/favicon.ico",        sizes: "any",   type: "image/x-icon" },
    ],
    apple: { url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-100 antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
