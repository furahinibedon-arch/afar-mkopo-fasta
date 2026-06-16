"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import { LogOut, Globe, User } from "lucide-react";

type PortalUser = {
  firstName?: string;
  lastName?: string;
  role?: string;
  profilePictureUrl?: string | null;
};

const ROLE_COLOURS: Record<string, string> = {
  ADMIN:        "bg-blue-100 text-blue-700",
  CEO:          "bg-red-100 text-red-700",
  DIRECTOR:     "bg-amber-100 text-amber-700",
  LOAN_OFFICER: "bg-emerald-100 text-emerald-700",
  BORROWER:     "bg-dark-100 text-dark-600",
};

export default function Layout({ children, portal = "public" }: { children: React.ReactNode; portal?: "borrower" | "staff" | "admin" | "public" }) {
  const router = useRouter(), pathname = usePathname(), { language, setLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [portalUser, setPortalUser] = useState<PortalUser | null>(null);

  useEffect(() => { const h = () => setScrolled(window.scrollY > 4); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setPortalUser(JSON.parse(stored)); } catch {}
    }
    // Re-read on storage change (e.g. role update)
    const onStorage = () => {
      const u = localStorage.getItem("user");
      if (u) { try { setPortalUser(JSON.parse(u)); } catch {} }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isPublic = pathname === "/";
  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); router.push("/"); };

  const initials = portalUser
    ? `${portalUser.firstName?.[0] ?? ""}${portalUser.lastName?.[0] ?? ""}`.toUpperCase()
    : "";
  const displayName = portalUser ? `${portalUser.firstName ?? ""} ${portalUser.lastName ?? ""}`.trim() : "";
  const roleLabel = portalUser?.role ?? "";
  const rolePill = ROLE_COLOURS[roleLabel] ?? "bg-dark-100 text-dark-600";

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-primary-50 to-brand-50">
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur shadow-lg" : "bg-gradient-to-r from-white to-primary-50 border-b border-dark-100"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
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
                  fallback.innerHTML = `<p class="text-dark-800 font-black text-sm">AFAR MKOPO</p><p class="text-brand-600 font-black text-xs tracking-widest ml-1">FASTA</p>`;
                  e.currentTarget.parentElement?.appendChild(fallback);
                }}
              />
            </div>
            
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Nav links */}
            {!isPublic && portal === "borrower" && <nav className="hidden md:flex gap-1 mr-2"><NL href="/borrower" label={t.applyForLoan} p={pathname} exact/><NL href="/borrower/loans" label={t.myLoans} p={pathname}/><NL href="/borrower/profile" label={t.myProfile} p={pathname}/></nav>}
            {!isPublic && portal === "staff" && <nav className="hidden md:flex gap-1 mr-2"><NL href="/staff" label="Queue" p={pathname} exact/></nav>}
            {!isPublic && portal === "admin" && <nav className="hidden md:flex gap-1 mr-2"><NL href="/admin" label="Dashboard" p={pathname} exact/><NL href="/admin/loans" label="Loans" p={pathname}/><NL href="/admin/borrowers" label="Users" p={pathname}/><NL href="/admin/balance" label="Balance" p={pathname}/></nav>}

            {/* Language toggle */}
            <button onClick={() => setLanguage(language === "en" ? "sw" : "en")} className="px-3 py-1.5 bg-gradient-to-r from-dark-100 to-primary-100 hover:from-dark-200 hover:to-primary-200 text-dark-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all">
              <Globe className="w-3.5 h-3.5" />
              {language === "en" ? " SW" : " EN"}
            </button>

            {/* User info card  shown when logged in */}
            {!isPublic && portalUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-dark-200">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary-500 to-brand-500 shrink-0 ring-2 ring-white shadow">
                  {portalUser.profilePictureUrl ? (
                    <img src={portalUser.profilePictureUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : initials ? (
                    <span className="text-white text-xs font-black">{initials}</span>
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                {/* Name + role */}
                <div className="hidden sm:flex flex-col leading-tight">
                  <span className="text-dark-800 text-xs font-bold truncate max-w-[120px]">{displayName}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full w-fit ${rolePill}`}>{roleLabel.replace("_", " ")}</span>
                </div>
              </div>
            )}

            {/* Logout */}
            {!isPublic && <button onClick={logout} className="px-3 py-1.5 text-dark-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all">
              <LogOut className="w-3.5 h-3.5" />
              {t.logout}
            </button>}
          </div>
        </div>
      </header>
      <main className="pt-16"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div></main>
      <footer className="bg-gradient-to-r from-dark-100 to-primary-100 border-t border-dark-200 py-4 mt-8"><p className="text-center text-dark-700 text-xs">&copy;{new Date().getFullYear()} AFAR MKOPO FASTA</p></footer>
    </div>
  );
}

function NL({ href, label, p, exact = false }: { href: string; label: string; p: string; exact?: boolean }) {
  const active = exact ? p === href : p.startsWith(href);
  return <Link href={href} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${active ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md" : "text-dark-700 hover:bg-gradient-to-r hover:from-dark-100 hover:to-primary-100"}`}>{label}</Link>;
}

