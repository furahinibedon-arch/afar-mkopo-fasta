"use client";
import{useEffect,useState}from"react";
import{useRouter}from"next/navigation";
import Layout from"@/components/Layout";
import{useLanguage}from"@/context/LanguageContext";
import{getMe}from"@/lib/api";
export default function Profile(){
  const router=useRouter(),{t}=useLanguage();
  const[user,setUser]=useState<any>(null);
  const[loading,setLoading]=useState(true);
  useEffect(()=>{if(!localStorage.getItem("token")){router.push("/");return;}getMe().then(setUser).catch(()=>router.push("/")).finally(()=>setLoading(false));},[router]);
  if(loading)return<Layout portal="borrower"><div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"/></div></Layout>;
  return(<Layout portal="borrower"><div className="mb-8"><h1 className="text-3xl font-black text-navy-800">{t.myProfile}</h1></div>
    <div className="card max-w-2xl">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100"><div className="w-16 h-16 rounded-2xl bg-navy-800 flex items-center justify-center shadow-glow-navy"><span className="text-white font-black text-xl">{user?.firstName?.[0]}{user?.lastName?.[0]}</span></div><div><p className="text-xl font-black text-navy-800">{user?.firstName} {user?.lastName}</p><p className="text-slate-500 text-sm">{user?.email}</p><span className="badge-approved mt-1 inline-block">{user?.role}</span></div></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">{[{l:t.firstName,v:user?.firstName},{l:t.lastName,v:user?.lastName},{l:t.email,v:user?.email},{l:t.phone,v:user?.phone},{l:"Member since",v:user?.createdAt?new Date(user.createdAt).toLocaleDateString():""}].map(({l,v})=>(<div key={l}><p className="label">{l}</p><p className="text-navy-800 font-semibold">{v||""}</p></div>))}</div>
    </div>
  </Layout>);
}