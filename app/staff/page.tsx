"use client";
import{useEffect,useState}from"react";
import{useRouter}from"next/navigation";
import Layout from"@/components/Layout";
import{useLanguage}from"@/context/LanguageContext";
import{getAllLoans,updateLoanStatus}from"@/lib/api";
export default function StaffPortal(){
  const{t}=useLanguage();
  const router=useRouter();
  const[loans,setLoans]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[err,setErr]=useState<string|null>(null);
  const[notes,setNotes]=useState<Record<string,string>>({});
  const[busy,setBusy]=useState<string|null>(null);
  useEffect(()=>{const u=localStorage.getItem("user");if(!u){router.push("/");return;}const role=JSON.parse(u).role;if(role==="BORROWER"){router.push("/borrower");return;}load();},[router]);
  const load=()=>{setLoading(true);getAllLoans().then(setLoans).catch((e:any)=>setErr(e.message)).finally(()=>setLoading(false));};
  const action=async(id:string,status:string)=>{setBusy(id);try{await updateLoanStatus(id,status,notes[id]);load();}catch(e:any){setErr(e.message);}finally{setBusy(null);}}; 
  const pending=loans.filter(l=>l.status==="PENDING");
  const reviewed=loans.filter(l=>l.status!=="PENDING");
  const badge=(s:string)=><span className={`badge-${s.toLowerCase()}`}>{s}</span>;
  return(<Layout portal="staff">
    <div className="mb-8"><h1 className="text-3xl font-black text-navy-800">Loan Queue</h1><p className="text-slate-500 mt-1">Review and process applications.</p></div>
    {err&&<div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"> {err}</div>}
    {loading?<div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"/></div>:<>
      <div className="grid grid-cols-3 gap-4 mb-8">{[{l:t.pending,v:pending.length,c:"border-amber-400"},{l:t.reviewed,v:reviewed.length,c:"border-emerald-400"},{l:t.total,v:loans.length,c:"border-blue-400"}].map(({l,v,c})=><div key={l} className={`card border-l-4 ${c}`}><p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{l}</p><p className="text-3xl font-black text-navy-800 mt-1">{v}</p></div>)}</div>
      <div className="card mb-6"><h2 className="text-lg font-black text-navy-800 mb-4">Pending Review ({pending.length})</h2>{pending.length===0?<p className="text-slate-400 text-center py-8">No pending applications.</p>:<div className="space-y-4">{pending.map((loan:any)=><LoanCard key={loan.id} loan={loan} badge={badge} busy={busy===loan.id} note={notes[loan.id]||""} onNote={(v)=>setNotes(n=>({...n,[loan.id]:v}))} onApprove={()=>action(loan.id,"APPROVED")} onReject={()=>action(loan.id,"REJECTED")}/>)}</div>}</div>
      <div className="card"><h2 className="text-lg font-black text-navy-800 mb-4">Reviewed ({reviewed.length})</h2>{reviewed.length===0?<p className="text-slate-400 text-center py-8">None yet.</p>:<div className="space-y-3">{reviewed.map((loan:any)=><div key={loan.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"><div><p className="font-semibold text-navy-800">{loan.borrower?.firstName} {loan.borrower?.lastName}</p><p className="text-xs text-slate-400">Tsh {Number(loan.amount).toLocaleString()}</p></div>{badge(loan.status)}</div>)}</div>}</div>
    </>}
  </Layout>);
}
function LoanCard({loan,badge,busy,note,onNote,onApprove,onReject}:any){
  return(<div className="card-hover border border-slate-200"><div className="flex flex-col sm:flex-row gap-4 sm:items-start sm:justify-between"><div className="flex-1"><div className="flex items-center gap-2 mb-2"><span className="font-black text-navy-800">{loan.borrower?.firstName} {loan.borrower?.lastName}</span><span className="badge-pending">PENDING</span></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-slate-600"><div><p className="label">Amount</p><p className="font-bold text-navy-800">Tsh {Number(loan.amount).toLocaleString()}</p></div><div><p className="label">Interest</p><p className="font-bold text-navy-800">{Number(loan.interestRate)}%</p></div><div><p className="label">Period</p><p className="font-bold text-navy-800">{loan.repaymentPeriod} days</p></div><div><p className="label">Applied</p><p className="font-bold text-navy-800">{new Date(loan.createdAt).toLocaleDateString()}</p></div></div>{loan.purpose&&<p className="mt-2 text-sm text-slate-500 italic">"{loan.purpose}"</p>}</div><div className="flex flex-col gap-2 min-w-[180px]"><textarea value={note} onChange={e=>onNote(e.target.value)} placeholder={t.notes} rows={2} className="input-field text-xs"/><div className="flex gap-2"><button onClick={onApprove} disabled={busy} className="btn-success flex-1 text-xs py-1.5">{busy?"":t.approve}</button><button onClick={onReject} disabled={busy} className="btn-danger flex-1 text-xs py-1.5">{busy?"":t.reject}</button></div></div></div></div>);
}