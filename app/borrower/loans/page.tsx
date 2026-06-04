"use client";
import{useEffect,useState}from"react";
import{useRouter}from"next/navigation";
import Layout from"@/components/Layout";
import{useLanguage}from"@/context/LanguageContext";
import{getMyLoans}from"@/lib/api";
export default function MyLoans(){
  const router=useRouter(),{t}=useLanguage();
  const[loans,setLoans]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[err,setErr]=useState<string|null>(null);
  useEffect(()=>{if(!localStorage.getItem("token")){router.push("/");return;}getMyLoans().then(setLoans).catch((e:any)=>setErr(e.message)).finally(()=>setLoading(false));},[router]);
  const badge=(s:string)=><span className={`badge-${s.toLowerCase()}`}>{s}</span>;
  return(<Layout portal="borrower"><div className="mb-8"><h1 className="text-3xl font-black text-navy-800">{t.myLoans}</h1></div>
    {loading&&<div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"/></div>}
    {err&&<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"> {err}</div>}
    {!loading&&!err&&loans.length===0&&<div className="card text-center py-16"><p className="text-slate-400 text-lg mb-4">No loan applications yet.</p><a href="/borrower" className="btn-primary">Apply Now</a></div>}
    <div className="space-y-4">{loans.map((loan:any)=>(<div key={loan.id} className="card-hover"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><div className="flex items-center gap-2 mb-2">{badge(loan.status)}<span className="text-xs text-slate-400">{new Date(loan.createdAt).toLocaleDateString()}</span></div><p className="text-2xl font-black text-navy-800">Tsh {Number(loan.amount).toLocaleString()}</p><p className="text-slate-500 text-sm mt-1">{loan.purpose||""}</p></div><div className="text-sm text-slate-500 space-y-1 sm:text-right"><p>Interest: <strong className="text-navy-800">{Number(loan.interestRate)}%</strong></p><p>Period: <strong className="text-navy-800">{loan.repaymentPeriod} days</strong></p><p>Total: <strong className="text-navy-800">Tsh {Number(loan.totalAmount).toLocaleString()}</strong></p></div></div></div>))}</div>
  </Layout>);
}