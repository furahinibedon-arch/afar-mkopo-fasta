import type{Metadata}from"next";
import"./globals.css";
import{LanguageProvider}from"@/context/LanguageContext";
export const metadata:Metadata={title:"AFAR MKOPO FASTA",description:"Fast, reliable microfinance"};
export default function RootLayout({children}:{children:React.ReactNode}){
  return(<html lang="en"><body className="min-h-screen bg-slate-50 antialiased"><LanguageProvider>{children}</LanguageProvider></body></html>);
}