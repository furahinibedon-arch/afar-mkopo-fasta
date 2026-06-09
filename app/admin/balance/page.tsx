"use client";
import{useEffect,useState}from"react";
import{useRouter}from"next/navigation";
import Layout from"@/components/Layout";
import{useLanguage}from"@/context/LanguageContext";
const BASE=process.env.NEXT_PUBLIC_API_URL||"";
function ah(){const t=typeof window!=="undefined"?localStorage.getItem("token"):null;return{"Content-Type":"application/json",...(t?{Authorization:`Bearer ${t}`}:{})};}
function fmt(n:number){return"Tsh "+n.toLocaleString();}
export default function CompanyBalance(){
  const{t}=useLanguage();
  const router=useRouter();
  const[entries,setEntries]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[busy,setBusy]=useState(false);
  const[form,setForm]=useState({type:"CREDIT",amount:"",description:""});
  const[msg,setMsg]=useState("");
  const[refreshKey,setRefreshKey]=useState(0);
  useEffect(()=>{const u=localStorage.getItem("user");if(!u){router.push("/");return;}if(JSON.parse(u).role==="BORROWER"){router.push("/borrower");return;}load();},[router, refreshKey]);

  useEffect(() => {
    const handleFocus = () => setRefreshKey(k => k + 1);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const load=()=>{setLoading(true);fetch(`${BASE}/api/admin/balance`,{headers:ah()}).then(r=>r.json()).then(d=>{if(Array.isArray(d))setEntries(d);}).catch(console.error).finally(()=>setLoading(false));};
  const submit=async(e:React.FormEvent)=>{e.preventDefault();if(!form.amount)return;setBusy(true);setMsg("");try{const r=await fetch(`${BASE}/api/admin/balance`,{method:"POST",headers:ah(),body:JSON.stringify({type:form.type,amount:parseFloat(form.amount),description:form.description})});const d=await r.json();if(!r.ok)throw new Error(d.error);setMsg("Saved!");setForm({type:"CREDIT",amount:"",description:""});load();}catch(ex:any){setMsg(ex.message);}finally{setBusy(false);}};
  const credits=entries.filter(e=>e.type==="CREDIT").reduce((s,e)=>s+Number(e.amount),0);
  const debits=entries.filter(e=>e.type==="DEBIT").reduce((s,e)=>s+Number(e.amount),0);
  const balance=credits-debits;
  return(<Layout portal="admin">
    <div className="mb-8"><h1 className="text-3xl font-black text-dark-800">Company Balance</h1><p className="text-dark-500 mt-1">Track money in and out of the business.</p></div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div className={`card border-l-4 ${balance>=0?"border-emerald-400":"border-red-400"}`}><p className="label">Current Balance</p><p className={`text-3xl font-black mt-1 ${balance>=0?"text-emerald-600":"text-red-600"}`}>{fmt(balance)}</p><p className="text-xs text-dark-400 mt-1">{balance>=0?" Positive":" Negative"}</p></div>
      <div className="card border-l-4 border-primary-400"><p className="label">Total In</p><p className="text-3xl font-black text-primary-600 mt-1">{fmt(credits)}</p></div>
      <div className="card border-l-4 border-rose-400"><p className="label">Total Out</p><p className="text-3xl font-black text-rose-600 mt-1">{fmt(debits)}</p></div>
    </div>
    <div className="card mb-8">
      <h2 className="text-lg font-black text-dark-800 mb-4">Add Entry</h2>
      {msg&&<div className="mb-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-xl text-sm">{msg}</div>}
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <div><label className="label">Type</label><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} className="input-field"><option value="CREDIT"> Money In</option><option value="DEBIT"> Money Out</option></select></div>
        <div><label className="label">Amount (Tsh)</label><input type="number" required min={1} value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} className="input-field" placeholder="e.g. 500000"/></div>
        <div><label className="label">Description</label><input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} className="input-field" placeholder="e.g. Loan disbursement"/></div>
        <button type="submit" disabled={busy} className="btn-primary">{busy?t.saving:t.saveEntry}</button>
      </form>
    </div>
    <div className="card overflow-x-auto">
      <h2 className="text-lg font-black text-dark-800 mb-4">Ledger ({entries.length} entries)</h2>
      {loading?<div className="flex justify-center py-10"><div className="w-6 h-6 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"/></div>:
      <table className="w-full text-sm">
        <thead><tr className="border-b border-dark-200">{["Date",t.type,"Amount",t.description,"Balance"].map(h=><th key={h} className="text-left py-3 px-3 text-xs font-semibold text-dark-500 uppercase">{h}</th>)}</tr></thead>
        <tbody>{entries.length===0&&<tr><td colSpan={5} className="text-center py-10 text-dark-400">No entries yet. Add one above.</td></tr>}
        {entries.map((e:any,i:number)=>{
          const run=entries.slice(0,i+1).reduce((s:number,x:any)=>x.type==="CREDIT"?s+Number(x.amount):s-Number(x.amount),0);
          return(<tr key={e.id} className="border-b border-dark-100 hover:bg-dark-50">
            <td className="py-3 px-3 text-dark-400 text-xs">{new Date(e.createdAt).toLocaleDateString()}</td>
            <td className="py-3 px-3"><span className={e.type==="CREDIT"?"badge-approved":"badge-rejected"}>{e.type==="CREDIT"?" IN":" OUT"}</span></td>
            <td className={`py-3 px-3 font-bold ${e.type==="CREDIT"?"text-emerald-600":"text-red-600"}`}>{e.type==="CREDIT"?"+":"-"}{fmt(Number(e.amount))}</td>
            <td className="py-3 px-3 text-dark-500">{e.description||""}</td>
            <td className={`py-3 px-3 font-bold ${run>=0?"text-dark-800":"text-red-600"}`}>{fmt(run)}</td>
          </tr>);
        })}</tbody>
      </table>}
    </div>
  </Layout>);
}
