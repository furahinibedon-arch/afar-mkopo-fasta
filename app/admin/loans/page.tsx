"use client";
import{useEffect,useState}from"react";
import{useRouter}from"next/navigation";
import Layout from"@/components/Layout";
import{getAllLoans,updateLoanStatus}from"@/lib/api";
export default function AdminLoans(){
  const router=useRouter();
  const[loans,setLoans]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[busy,setBusy]=useState<string|null>(null);
  useEffect(()=>{const u=localStorage.getItem("user");if(!u){router.push("/");return;}load();},[router]);
  const load=()=>{getAllLoans().then(setLoans).catch(console.error).finally(()=>setLoading(false));};
  const action=async(id:string,status:string)=>{setBusy(id);try{await updateLoanStatus(id,status);load();}finally{setBusy(null);}};
  const badge=(s:string)=><span className={`badge-${s.toLowerCase()}`}>{s}</span>;
  const counts=["PENDING","APPROVED","REJECTED","DISBURSED","REPAID","DEFAULTED"].reduce((a:any,s)=>{a[s]=loans.filter(l=>l.status===s).length;return a;},{});
  return(<Layout portal="admin">
    <div className="mb-8"><h1 className="text-3xl font-black text-navy-800">Loan Management</h1></div>
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">{Object.entries(counts).map(([s,n]:any)=><div key={s} className="card text-center p-3"><p className="text-xs font-semibold text-slate-500 uppercase">{s}</p><p className="text-2xl font-black text-navy-800">{n}</p></div>)}</div>
    {loading?<div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"/></div>:
    <div className="card overflow-x-auto"><table className="w-full text-sm">
      <thead><tr className="border-b border-slate-200">{["Borrower","Phone","Amount","Purpose","Status","Applied","Actions"].map(h=><th key={h} className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
      <tbody>{loans.map((l:any)=><tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50">
        <td className="py-3 px-3 font-semibold">{l.borrower?.firstName} {l.borrower?.lastName}</td>
        <td className="py-3 px-3 text-slate-500">{l.borrower?.phone}</td>
        <td className="py-3 px-3 font-bold">Tsh {Number(l.amount).toLocaleString()}</td>
        <td className="py-3 px-3 text-slate-500 max-w-[140px] truncate">{l.purpose||""}</td>
        <td className="py-3 px-3">{badge(l.status)}</td>
        <td className="py-3 px-3 text-slate-400">{new Date(l.createdAt).toLocaleDateString()}</td>
        <td className="py-3 px-3"><div className="flex gap-1">{l.status==="PENDING"&&<><button onClick={()=>action(l.id,"APPROVED")} disabled={busy===l.id} className="btn-success text-xs py-1 px-2">{busy===l.id?"":""}</button><button onClick={()=>action(l.id,"REJECTED")} disabled={busy===l.id} className="btn-danger text-xs py-1 px-2">{busy===l.id?"":""}</button></>}{l.status==="APPROVED"&&<button onClick={()=>action(l.id,"DISBURSED")} disabled={busy===l.id} className="btn-primary text-xs py-1 px-2">{busy===l.id?"":"Disburse"}</button>}</div></td>
      </tr>)}</tbody>
    </table></div>}
  </Layout>);
}