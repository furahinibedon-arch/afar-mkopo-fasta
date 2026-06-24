"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import {
  LogOut, Globe, User, LayoutDashboard, FileText,
  Users, Wallet, ClipboardList, ChevronRight, Menu, X, BarChart3
} from "lucide-react";

type PortalUser = {
  firstName?: string; lastName?: string;
  role?: string; profilePictureUrl?: string | null;
};

const ROLE_STYLES: Record<string, string> = {
  ADMIN:        "bg-blue-50 text-blue-700 border-blue-200",
  CEO:          "bg-red-50 text-red-700 border-red-200",
  DIRECTOR:     "bg-amber-50 text-amber-700 border-amber-200",
  LOAN_OFFICER: "bg-emerald-50 text-emerald-700 border-emerald-200",
  BORROWER:     "bg-zinc-100 text-zinc-600 border-zinc-200",
};

const ADMIN_NAV = [
  { href: "/admin",           label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/loans",     label: "Loans",     icon: FileText },
  { href: "/admin/borrowers", label: "Users",     icon: Users },
  { href: "/admin/balance",   label: "Balance",   icon: Wallet },
  { href: "/admin/reports",   label: "Reports",   icon: BarChart3 },
];

const BORROWER_NAV = [
  { href: "/borrower",         label: "Apply",    icon: ClipboardList, exact: true },
  { href: "/borrower/loans",   label: "My Loans", icon: FileText },
  { href: "/borrower/profile", label: "Profile",  icon: User },
];

const STAFF_NAV = [
  { href: "/staff", label: "Loan Queue", icon: ClipboardList, exact: true },
];

export default function Layout({
  children, portal = "public"
}: {
  children: React.ReactNode;
  portal?: "borrower" | "staff" | "admin" | "public";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [portalUser, setPortalUser] = useState<PortalUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isPublic = pathname === "/";

  useEffect(() => {
    // Auth guard  redirect to login if no token
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");
    if (!isPublic && !token) { router.replace("/"); return; }
    if (stored) { try { setPortalUser(JSON.parse(stored)); } catch {} }
    const onStorage = () => {
      const u = localStorage.getItem("user");
      if (u) { try { setPortalUser(JSON.parse(u)); } catch {} }
    };
    window.addEventListener("storage", onStorage);

    // Inactivity timeout  15 minutes
    const TIMEOUT = 15 * 60 * 1000;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/");
      }, TIMEOUT);
    };
    const events = ["mousemove","keydown","click","touchstart","scroll"];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset(); // start timer on mount

    return () => {
      window.removeEventListener("storage", onStorage);
      events.forEach(e => window.removeEventListener(e, reset));
      clearTimeout(timer);
    };
  }, [isPublic, router]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const initials = portalUser
    ? `${portalUser.firstName?.[0] ?? ""}${portalUser.lastName?.[0] ?? ""}`.toUpperCase()
    : "";
  const displayName = portalUser
    ? `${portalUser.firstName ?? ""} ${portalUser.lastName ?? ""}`.trim()
    : "";
  const roleLabel = portalUser?.role ?? "";
  const roleStyle = ROLE_STYLES[roleLabel] ?? "bg-zinc-100 text-zinc-600 border-zinc-200";

  const profileHref =
    portal === "borrower" ? "/borrower/profile"
    : portal === "staff"  ? "/staff/profile"
    : "/admin/profile";

  const navItems =
    portal === "admin"    ? ADMIN_NAV
    : portal === "borrower" ? BORROWER_NAV
    : portal === "staff"  ? STAFF_NAV
    : [];

  const isAdmin = portal === "admin";

  //  Top bar (all portals) 
  const TopBar = () => (
    <header className="fixed inset-x-0 top-0 z-50 h-12 flex items-center px-4 gap-3 topbar-shell">
      {/* Mobile menu toggle (admin only) */}
      {isAdmin && (
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="lg:hidden p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500"
        >
          <Menu className="w-4 h-4" />
        </button>
      )}

      {/* Logo */}
      <Link
        href={isPublic ? "/" : `/${portal === "public" ? "" : portal}`}
        className="flex items-center gap-2 shrink-0"
      >
        <div className="h-7 flex items-center">
          <img
            src="/logo.png"
            alt="AFAR MKOPO FASTA"
            className="h-full w-auto object-contain"
            onError={e => {
              e.currentTarget.style.display = "none";
              const fb = document.createElement("span");
              fb.className = "text-zinc-900 font-bold text-sm tracking-tight";
              fb.textContent = "AFAR MKOPO FASTA";
              e.currentTarget.parentElement?.appendChild(fb);
            }}
          />
        </div>
      </Link>

      {/* Inline nav (non-admin portals) */}
      {!isAdmin && !isPublic && (
        <nav className="hidden md:flex items-center gap-0.5 ml-4">
          {navItems.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "topnav-link-active" : "topnav-link"}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side controls */}
      <div className="flex items-center gap-1">
        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === "en" ? "sw" : "en")}
          className="btn-ghost text-xs py-1 px-2 gap-1"
        >
          <Globe className="w-3.5 h-3.5" />
          {language === "en" ? "SW" : "EN"}
        </button>

        {/* User chip */}
        {!isPublic && portalUser && (
          <Link
            href={profileHref}
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-zinc-100 transition-colors duration-100 group"
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-primary-600 shrink-0 ring-1 ring-zinc-200">
              {portalUser.profilePictureUrl ? (
                <img src={portalUser.profilePictureUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : initials ? (
                <span className="text-white text-[10px] font-bold">{initials}</span>
              ) : (
                <User className="w-3.5 h-3.5 text-white" />
              )}
            </div>
            {/* Name + role */}
            <div className="hidden sm:flex flex-col leading-none gap-0.5">
              <span className="text-xs font-semibold text-zinc-800 truncate max-w-[110px] group-hover:text-zinc-900">
                {displayName}
              </span>
              <span className={`text-[10px] font-medium px-1.5 py-px rounded border w-fit ${roleStyle}`}>
                {roleLabel.replace("_", " ")}
              </span>
            </div>
          </Link>
        )}

        {/* Logout */}
        {!isPublic && (
          <button
            onClick={logout}
            className="btn-ghost text-xs py-1 px-2 gap-1 text-zinc-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.logout}</span>
          </button>
        )}
      </div>
    </header>
  );

  //  Sidebar (admin only) 
  const Sidebar = () => (
    <>
      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed top-12 left-0 bottom-0 z-40 w-56 flex flex-col transition-transform duration-200 sidebar-shell
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <nav className="flex-1 p-3 space-y-0.5">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 pt-2 pb-1.5">Menu</p>
          {ADMIN_NAV.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={active ? "nav-link-active" : "nav-link"}
              >
                <span className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors
                  ${active ? "bg-sky-500/20" : "bg-white/8 group-hover:bg-white/15"}`}>
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-sky-300" : "text-slate-400"}`} />
                </span>
                {item.label}
                {active && <ChevronRight className="w-3 h-3 ml-auto text-sky-300 opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-white/10">
          <Link href="/admin/profile" className="nav-link text-xs w-full">
            <User className="w-4 h-4 shrink-0" />
            My Profile
          </Link>
        </div>
      </aside>
    </>
  );

  //  Layout shells 
  if (isPublic) {
    return (
      <div className="min-h-screen page-shell">
        <TopBar />
        <main className="pt-12">
        <main className="pt-12">$5{children}</main>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen page-shell">
        <TopBar />
        <Sidebar />
        <Sidebar />$5
        <main className="lg:pl-56 pt-12">
          <div className="max-w-7xl mx-auto px-5 py-6">{children}</div>
        </main>
        <footer className="lg:pl-56 border-t border-zinc-200 bg-white py-3">
          <p className="max-w-7xl mx-auto px-5 text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} AFAR MKOPO FASTA
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-shell">
      <TopBar />
      <main className="pt-12">
      <main className="pt-12">$5
        <div className="max-w-5xl mx-auto px-4 py-6">{children}</div>
      </main>
      <footer className="border-t border-zinc-200 bg-white py-3">
        <p className="max-w-5xl mx-auto px-4 text-xs text-zinc-400">
          &copy; {new Date().getFullYear()} AFAR MKOPO FASTA
        </p>
      </footer>
    </div>
  );
}






