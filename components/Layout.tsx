"use client";
import{usePathname,useRouter}from"next/navigation";
import{useLanguage}from"@/context/LanguageContext";
import{useEffect,useState}from"react";
export default function Layout({children,portal="public"}:{children:React.ReactNode;portal?:"borrower"|"staff"|"admin"|"public"}){
  const router=useRouter(),pathname=usePathname(),{language,setLanguage,t}=useLanguage();
  const[scrolled,setScrolled]=useState(false);
  useEffect(()=>{const h=()=>setScrolled(window.scrollY>4);window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h);},[]);
  const isPublic=pathname==="/";
  const logout=()=>{localStorage.removeItem("token");localStorage.removeItem("user");router.push("/");};
  return(
    <div className="min-h-screen bg-slate-50">
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled?"bg-white/95 backdrop-blur shadow-md":"bg-white border-b border-slate-100"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href={isPublic?"/":`/${portal==="public"?"":portal}`} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-navy-800 flex items-center justify-center shadow-glow-navy"><span className="text-brand-400 font-black text-xs">AF</span></div>
            <div><p className="text-navy-800 font-black text-sm">AFAR MKOPO</p><p className="text-brand-500 font-black text-xs tracking-widest">FASTA</p></div>
            {!isPublic&&portal!=="public"&&<span className="hidden sm:block ml-2 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-semibold rounded-md capitalize">{portal}</span>}
          </a>
          <div className="flex items-center gap-2">
            {!isPublic&&portal==="borrower"&&<nav className="hidden md:flex gap-1 mr-2"><NL href="/borrower" label={t.applyForLoan} p={pathname} exact/><NL href="/borrower/loans" label={t.myLoans} p={pathname}/><NL href="/borrower/profile" label={t.myProfile} p={pathname}/></nav>}
            {!isPublic&&portal==="staff"&&<nav className="hidden md:flex gap-1 mr-2"><NL href="/staff" label="Queue" p={pathname} exact/></nav>}
            {!isPublic&&portal==="admin"&&<nav className="hidden md:flex gap-1 mr-2"><NL href="/admin" label="Dashboard" p={pathname} exact/><NL href="/admin/loans" label="Loans" p={pathname}/><NL href="/admin/borrowers" label="Users" p={pathname}/></nav>}
            <button onClick={()=>setLanguage(language==="en"?"sw":"en")} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg">{language==="en"?" SW":" EN"}</button>
            {!isPublic&&<button onClick={logout} className="px-3 py-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/></svg>{t.logout}</button>}
          </div>
        </div>
      </header>
      <main className="pt-16"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div></main>
      <footer className="border-t border-slate-100 py-4 mt-8"><p className="text-center text-slate-400 text-xs">&copy;{new Date().getFullYear()} AFAR MKOPO FASTA</p></footer>
    </div>
  );
}
function NL({href,label,p,exact=false}:{href:string;label:string;p:string;exact?:boolean}){
  const active=exact?p===href:p.startsWith(href);
  return<a href={href} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${active?"bg-navy-800 text-white":"text-slate-600 hover:bg-slate-100"}`}>{label}</a>;
}
