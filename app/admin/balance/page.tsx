"use client";
import{useEffect,useState}from"react";
import{useRouter}from"next/navigation";
import Layout from"@/components/Layout";
import{useLanguage}from"@/context/LanguageContext";
import{ TrendingUp, TrendingDown, Wallet, Landmark, BarChart3, PiggyBank, Trash2, AlertTriangle } from "lucide-react";

const BASE=process.env.NEXT_PUBLIC_API_URL||"";
function ah(){const t=typeof window!=="undefined"?localStorage.getItem("token"):null;return{"Content-Type":"application/json",...(t?{Authorization:`Bearer ${t}`}:{})}}
function fmt(n:number){return"Tsh "+Math.abs(n).toLocaleString();}

export default function CompanyBalance(){
  const{t}=useLanguage();
  const router=useRouter();
  const[entries,setEntries]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[busy,setBusy]=useState(false);
  const[form,setForm]=useState({type:"CAPITAL",amount:"",description:""});
  const[msg,setMsg]=useState("");
  const[refreshKey,setRefreshKey]=useState(0);
  const[confirmClear,setConfirmClear]=useState(false);
  const[clearing,setClearing]=useState(false);

  useEffect(()=>{
    const u=localStorage.getItem("user");
    if(!u){router.push("/");return;}
    const role=JSON.parse(u).role;
    if(role==="BORROWER"){router.push("/borrower");return;}
    load();
  },[router,refreshKey]);

  useEffect(()=>{
    const h=()=>setRefreshKey(k=>k+1);
    window.addEventListener("focus",h);
    return(
    <Layout portal="admin">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title">Company Balance</h1>
          <p className="page-subtitle">Full financial breakdown — capital, repayments, interest and disbursements.</p>
        </div>
        <button onClick={()=>setConfirmClear(true)} className="btn-danger flex items-center gap-2 shrink-0">
          <Trash2 className="w-4 h-4"/> Clear All
        </button>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 mb-3">
        <div className="kpi-card col-span-2 xl:col-span-1" style={{borderLeftColor: balance>=0?"#10b981":"#ef4444"}}>
          <div className="kpi-icon bg-emerald-100"><Wallet className="w-5 h-5 text-emerald-600"/></div>
          <div>
            <p className="kpi-label">Current Balance</p>
            <p className={`kpi-value ${balance>=0?"text-emerald-700":"text-red-600"}`}>{balance>=0?"+":"-"}{fmt(balance)}</p>
            <p className="kpi-sub">{balance>=0?"Positive":"Negative"}</p>
          </div>
        </div>
        <div className="kpi-card" style={{borderLeftColor:"#0284c7"}}>
          <div className="kpi-icon bg-sky-100"><Landmark className="w-5 h-5 text-sky-600"/></div>
          <div>
            <p className="kpi-label">Capital Invested</p>
            <p className="kpi-value text-sky-700">+{fmt(capital)}</p>
            <p className="kpi-sub">Funds entered as capital</p>
          </div>
        </div>
        <div className="kpi-card" style={{borderLeftColor:"#7c3aed"}}>
          <div className="kpi-icon bg-violet-100"><TrendingDown className="w-5 h-5 text-violet-600"/></div>
          <div>
            <p className="kpi-label">Total Disbursed</p>
            <p className="kpi-value text-violet-700">-{fmt(disbursedOut)}</p>
            <p className="kpi-sub">Loans given out</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
        <div className="kpi-card" style={{borderLeftColor:"#059669"}}>
          <div className="kpi-icon bg-emerald-100"><TrendingUp className="w-5 h-5 text-emerald-600"/></div>
          <div>
            <p className="kpi-label">Customer Repayments</p>
            <p className="kpi-value text-emerald-700">+{fmt(repaidIn)}</p>
            <p className="kpi-sub">Cash received from borrowers</p>
          </div>
        </div>
        <div className="kpi-card" style={{borderLeftColor:"#d97706"}}>
          <div className="kpi-icon bg-amber-100"><BarChart3 className="w-5 h-5 text-amber-600"/></div>
          <div>
            <p className="kpi-label">Interest Earned</p>
            <p className="kpi-value text-amber-700">+{fmt(interestEarned)}</p>
            <p className="kpi-sub">Repaid minus principal</p>
          </div>
        </div>
        <div className="kpi-card" style={{borderLeftColor:"#dc2626"}}>
          <div className="kpi-icon bg-red-100"><PiggyBank className="w-5 h-5 text-red-600"/></div>
          <div>
            <p className="kpi-label">Other Expenses</p>
            <p className="kpi-value text-red-600">-{fmt(otherOut)}</p>
            <p className="kpi-sub">Non-loan outflows</p>
          </div>
        </div>
      </div>

      {/* Add Entry Form */}
      <div className="card mb-6">
        <h2 className="text-base font-bold text-zinc-800 mb-4">Add Entry</h2>
        {msg&&<div className={`mb-3 px-3 py-2 rounded-xl text-sm ${msg==="Saved!"?"alert-success":"alert-error"}`}>{msg}</div>}
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="label">Entry Type</label>
            <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} className="input-field">
              <option value="CAPITAL">💰 Capital (Money Invested)</option>
              <option value="REPAYMENT_IN">📥 Repayment Received</option>
              <option value="DEBIT">📤 Expense / Money Out</option>
            </select>
          </div>
          <div>
            <label className="label">Amount (Tsh)</label>
            <input type="number" required min={1} value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} className="input-field" placeholder="e.g. 500000"/>
          </div>
          <div>
            <label className="label">Description</label>
            <input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} className="input-field" placeholder="e.g. Initial capital from director"/>
          </div>
          <button type="submit" disabled={busy} className="btn-primary">{busy?"Saving...":"Save Entry"}</button>
        </form>
      </div>

      {/* Ledger Table */}
      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-zinc-800">Full Ledger ({entries.length} entries)</h2>
          {entries.length > 0 && (
            <button onClick={()=>setConfirmClear(true)} className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5"/> Clear Ledger
            </button>
          )}
        </div>
        {loading
          ? <div className="flex justify-center py-10"><div className="w-6 h-6 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"/></div>
          : <table className="data-table">
              <thead><tr>
                {["Date & Time","Category","Amount","Description","Running Balance"].map(h=>(
                  <th key={h}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {entries.length===0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-zinc-400">No entries yet.</td></tr>
                )}
                {entries.map((e:any,i:number)=>{
                  const run=entries.slice(0,i+1).reduce((s:number,x:any)=>x.type==="CREDIT"?s+Number(x.amount):s-Number(x.amount),0);
                  return(
                    <tr key={e.id}>
                      <td className="text-zinc-400 text-xs">{new Date(e.createdAt).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${e.type==="CREDIT"?"bg-emerald-50 text-emerald-700 border border-emerald-200":"bg-red-50 text-red-700 border border-red-200"}`}>
                          {entryLabel(e)}
                        </span>
                      </td>
                      <td className={`font-bold ${e.type==="CREDIT"?"text-emerald-600":"text-red-600"}`}>
                        {e.type==="CREDIT"?"+":"-"}{fmt(Number(e.amount))}
                      </td>
                      <td className="text-zinc-500 text-xs max-w-[200px] truncate">{e.description||""}</td>
                      <td className={`font-bold tabular-nums ${run>=0?"text-zinc-800":"text-red-600"}`}>{run>=0?"+":"-"}{fmt(run)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        }
      </div>

      {/* Confirm Clear Modal */}
      {confirmClear && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600"/>
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">Clear All Balance Records?</h3>
                <p className="text-sm text-zinc-500 mt-1">This will permanently delete all {entries.length} financial log entries. This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={clearAll} disabled={clearing} className="btn-danger flex-1 py-2.5">
                {clearing ? "Clearing..." : "Yes, Clear All"}
              </button>
              <button onClick={()=>setConfirmClear(false)} disabled={clearing} className="btn-secondary flex-1 py-2.5">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
