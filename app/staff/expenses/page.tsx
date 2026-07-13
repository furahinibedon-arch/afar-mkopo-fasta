"use client";
import{useEffect,useState}from"react";
import{useRouter}from"next/navigation";
import Layout from"@/components/Layout";
import{Receipt,PlusCircle,CheckCircle,AlertCircle}from"lucide-react";

const BASE=process.env.NEXT_PUBLIC_API_URL||"";
const CATEGORIES=["Transport","Stationery","Communication","Meals","Office Supplies","Field Work","Other"];
function ah(){const t=typeof window!=="undefined"?localStorage.getItem("token"):null;return{"Content-Type":"application/json",...(t?{Authorization:`Bearer ${t}`}:{})}}
function fmt(n:number){return"Tsh "+Number(n).toLocaleString();}

export default function StaffExpenses(){
  const router=useRouter();
  const[expenses,setExpenses]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[busy,setBusy]=useState(false);
  const[msg,setMsg]=useState<{type:"success"|"error";text:string}|null>(null);
  const[form,setForm]=useState({amount:"",category:"Transport",description:""});

  useEffect(()=>{
    const u=localStorage.getItem("user");
    if(!u){router.push("/");return;}
    const role=JSON.parse(u).role;
    if(role==="BORROWER"){router.push("/borrower");return;}
    load();
  },[router]);

  const load=()=>{
    setLoading(true);
    fetch(`${BASE}/api/staff/expenses`,{headers:ah()})
      .then(r=>r.ok?r.json():[]).then(d=>{if(Array.isArray(d))setExpenses(d);})
      .catch(()=>{}).finally(()=>setLoading(false));
  };

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();
    if(!form.amount||!form.description.trim()){setMsg({type:"error",text:"Amount and description are required."});return;}
    setBusy(true);setMsg(null);
    try{
      const r=await fetch(`${BASE}/api/staff/expenses`,{method:"POST",headers:ah(),body:JSON.stringify({amount:parseFloat(form.amount),category:form.category,description:form.description.trim()})});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||"Failed");
      setMsg({type:"success",text:"Expense submitted successfully. It has been logged to company balance."});
      setForm({amount:"",category:"Transport",description:""});
      load();
    }catch(ex:any){setMsg({type:"error",text:ex.message});}
    finally{setBusy(false);}
  };

  const myExpenses=expenses.filter(e=>String(e.reference||"").startsWith("STAFF_EXPENSE_"));
  const totalSpent=myExpenses.reduce((s:number,e:any)=>s+Number(e.amount),0);

  return(
    <Layout portal="staff">
      <div className="mb-6">
        <h1 className="page-title flex items-center gap-2"><Receipt className="w-6 h-6"/>Staff Expenses</h1>
        <p className="page-subtitle">Log any work-related expense. It will be deducted from company balance automatically.</p>
      </div>

      {/* Submit form */}
      <div className="card mb-6">
        <h2 className="text-base font-bold text-zinc-800 mb-4 flex items-center gap-2"><PlusCircle className="w-4 h-4 text-sky-600"/>Submit New Expense</h2>
        {msg&&(
          <div className={`mb-4 flex items-start gap-2 px-4 py-3 rounded-xl text-sm ${msg.type==="success"?"alert-success":"alert-error"}`}>
            {msg.type==="success"?<CheckCircle className="w-4 h-4 shrink-0 mt-0.5"/>:<AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/>}
            {msg.text}
          </div>
        )}
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="label">Category</label>
            <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="input-field">
              {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Amount (Tsh)</label>
            <input type="number" required min={1} value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} className="input-field" placeholder="e.g. 5000"/>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="label">Description</label>
            <input required value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} className="input-field" placeholder="e.g. Fuel to visit client in Mbeya"/>
          </div>
          <button type="submit" disabled={busy} className="btn-primary py-2.5">
            {busy?"Submitting...":"Submit Expense"}
          </button>
        </form>
      </div>

      {/* Summary */}
      {myExpenses.length>0&&(
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="kpi-card" style={{borderLeftColor:"#dc2626"}}>
            <div className="kpi-icon bg-red-100"><Receipt className="w-5 h-5 text-red-600"/></div>
            <div><p className="kpi-label">Total Expenses Logged</p><p className="kpi-value text-red-600">{fmt(totalSpent)}</p><p className="kpi-sub">{myExpenses.length} entries</p></div>
          </div>
          <div className="kpi-card" style={{borderLeftColor:"#0284c7"}}>
            <div className="kpi-icon bg-sky-100"><CheckCircle className="w-5 h-5 text-sky-600"/></div>
            <div><p className="kpi-label">All Entries Approved</p><p className="kpi-value text-sky-700">Auto-logged</p><p className="kpi-sub">Reflected in company balance</p></div>
          </div>
        </div>
      )}

      {/* History */}
      <div className="card overflow-x-auto">
        <h2 className="text-base font-bold text-zinc-800 mb-4">Expense History ({myExpenses.length})</h2>
        {loading?<div className="flex justify-center py-10"><div className="w-6 h-6 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"/></div>:
        myExpenses.length===0?<p className="text-zinc-400 text-center py-10">No expenses logged yet.</p>:
        <table className="data-table">
          <thead><tr>
            <th>Date</th><th>Category</th><th>Description</th><th>Amount</th>
          </tr></thead>
          <tbody>
            {myExpenses.map((e:any)=>{
              const desc=String(e.description||"");
              const catMatch=desc.match(/^\[([^\]]+)\]/);
              const cat=catMatch?catMatch[1]:"General";
              const cleanDesc=desc.replace(/^\[[^\]]+\]\s*/,"").replace(/\s*—\s*by\s+.+$/,"");
              return(
                <tr key={e.id}>
                  <td className="text-zinc-400 text-xs">{new Date(e.createdAt).toLocaleString()}</td>
                  <td><span className="badge bg-red-50 text-red-700 border border-red-200">{cat}</span></td>
                  <td className="text-zinc-600 text-sm">{cleanDesc}</td>
                  <td className="font-bold text-red-600">-{fmt(Number(e.amount))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>}
      </div>
    </Layout>
  );
}