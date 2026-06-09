"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import { LogOut, Globe } from "lucide-react";

export default function Layout({ children, portal = "public" }: { children: React.ReactNode; portal?: "borrower" | "staff" | "admin" | "public" }) {
  const router = useRouter(), pathname = usePathname(), { language, setLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const h = () => setScrolled(window.scrollY > 4); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  const isPublic = pathname === "/";
  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); router.push("/"); };
  
  return (
    <div className="min-h-screen bg-dark-50">
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur shadow-md" : "bg-white border-b border-dark-200"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href={isPublic ? "/" : `/${portal === "public" ? "" : portal}`} className="flex items-center gap-2.5">
            <div className="h-10 flex items-center">
              <img 
                src="/logo.png" 
                alt="AFAR MKOPO FASTA Logo" 
                className="h-full w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'h-full flex items-center';
                  fallback.innerHTML = `
                    <p class="text-dark-800 font-black text-sm">AFAR MKOPO</p>
                    <p class="text-brand-500 font-black text-xs tracking-widest ml-1">FASTA</p>
                  `;
                  e.currentTarget.parentElement?.appendChild(fallback);
                }}
              />
            </div>
            {!isPublic && portal !== "public" && <span className="hidden sm:block ml-2 px-2 py-0.5 bg-dark-100 text-dark-600 text-xs font-semibold rounded-md capitalize">{portal}</span>}
          </Link>
          <div className="flex items-center gap-2">
            {!isPublic && portal === "borrower" && <nav className="hidden md:flex gap-1 mr-2"><NL href="/borrower" label={t.applyForLoan} p={pathname} exact/><NL href="/borrower/loans" label={t.myLoans} p={pathname}/><NL href="/borrower/profile" label={t.myProfile} p={pathname}/></nav>}
            {!isPublic && portal === "staff" && <nav className="hidden md:flex gap-1 mr-2"><NL href="/staff" label="Queue" p={pathname} exact/></nav>}
            {!isPublic && portal === "admin" && <nav className="hidden md:flex gap-1 mr-2"><NL href="/admin" label="Dashboard" p={pathname} exact/><NL href="/admin/loans" label="Loans" p={pathname}/><NL href="/admin/borrowers" label="Users" p={pathname}/><NL href="/admin/balance" label="Balance" p={pathname}/></nav>}
            <button onClick={() => setLanguage(language === "en" ? "sw" : "en")} className="px-3 py-1.5 bg-dark-100 hover:bg-dark-200 text-dark-700 text-xs font-semibold rounded-lg flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              {language === "en" ? " SW" : " EN"}
            </button>
            {!isPublic && <button onClick={logout} className="px-3 py-1.5 text-dark-500 hover:text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg flex items-center gap-1">
              <LogOut className="w-3.5 h-3.5" />
              {t.logout}
            </button>}
          </div>
        </div>
      </header>
      <main className="pt-16"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div></main>
      <footer className="border-t border-dark-200 py-4 mt-8"><p className="text-center text-dark-400 text-xs">&copy;{new Date().getFullYear()} AFAR MKOPO FASTA</p></footer>
    </div>
  );
}

function NL({ href, label, p, exact = false }: { href: string; label: string; p: string; exact?: boolean }) {
  const active = exact ? p === href : p.startsWith(href);
  return <Link href={href} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${active ? "bg-primary-600 text-white" : "text-dark-600 hover:bg-dark-100"}`}>{label}</Link>;
}