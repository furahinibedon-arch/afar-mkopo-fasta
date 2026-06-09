import type{Metadata}from"next";
import"./globals.css";
import{LanguageProvider}from"@/context/LanguageContext";

export const metadata:Metadata = {
  title: "AFAR MKOPO FASTA",
  description: "Fast, reliable microfinance",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png'
  }
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return(<html lang="en"><body className="min-h-screen bg-gradient-to-br from-dark-50 via-primary-50 to-brand-50 antialiased"><LanguageProvider>{children}</LanguageProvider></body></html>);
}