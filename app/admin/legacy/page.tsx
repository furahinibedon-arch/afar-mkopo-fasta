"use client";
import{useEffect,useState}from"react";
import{useRouter}from"next/navigation";
import Layout from"@/components/Layout";
import{getUsers}from"@/lib/api";
import{History,CheckCircle,AlertCircle,Info}from"lucide-react";

const BASE=process.env.NEXT_PUBLIC_API_URL||"";
function ah(){const t=typeof window!=="undefined"?localStorage.getItem("token"):null;return{"Content-Type":"application/json",...(t?{Authorization:`Bearer ${t}`}:{})}}

export default function LegacyLoanPage(){
  const router=useRouter();
  const[users,setUsers]=useState<any[]>([]);
  const[busy,setBusy]=useState(false);
  const[result,setResult]=useState<any>(null);
  const[err,setErr]=useState("");
  const[form,setForm]=useState({borrowerId:"",outstandingAmount:"",description:"",repaymentType:"MONTHLY",originalDate:""});

  useEffect(()=>{
    const u=localStorage.getItem("user");
    if(!u){router.push("/");return;}
    const role=JSON.parse(u).role;
    if(!["ADMIN","CEO","DIRECTOR"].includes(role)){router.push("/admin");return;}
    getUsers().then(setUsers).catch(console.error);
  },[router]);

  const borrowers=users.filter(u=>u.role==="BORROWER");

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();
    if(!form.borrowerId||!form.outstandingAmount){setErr("Borrower and outstanding amount are required.");return;}
    setBusy(true);setErr("");setResult(null);
    try{
      const r=await fetch(`${BASE}/api/admin/legacy-loan`,{method:"POST",headers:ah(),body:JSON.stringify({...form,outstandingAmount:parseFloat(form.outstandingAmount)})});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error);
      setResult(d);
      setForm({borrowerId:"",outstandingAmount:"",description:"",repaymentType:"MONTHLY",originalDate:""});
    }catch(ex:any){setErr(ex.message);}
    finally{setBusy(false);}
  };

  return(
    <Layout portal="admin">
      <div className="mb-6">
        <h1 className="page-title flex items-center gap-2"><History className="w-6 h-6"/>Import Legacy Loan</h1>
        <p className="page-subtitle">Add clients who borrowed money before the system existed.</p>
      </div>

      {/* Info box */}
      <div className="alert-info mb-6">
        <Info className="w-5 h-5 shrink-0 mt-0.5"/>
        <div>
          <p className="font-semibold">How this works</p>
          <ul className="mt-1 space-y-1 text-sm">
            <li>Enter the client and how much they still owe you <strong>today</strong> (include any interest already agreed upon).</li>
            <li>The system will create a DISBURSED loan for that exact amount.</li>
            <li>It will <strong>NOT</strong> change your company balance (the money was already given out before the system).</li>
            <li>You can then record their payments normally going forward.</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card">
          <h2 className="text-base font-bold text-zinc-800 mb-4">Client Details</h2>
          {err&&<div className="alert-error mb-4"><AlertCircle className="w-4 h-4 shrink-0"/>{err}</div>}
          {result&&(
            <div className="alert-success mb-4">
              <CheckCircle className="w-4 h-4 shrink-0"/>
              <div>
                <p className="font-semibold">Legacy loan imported successfully!</p>
                <p className="text-sm">{result.borrower?.firstName} {result.borrower?.lastName} — Tsh {Number(result.loan?.totalAmount).toLocaleString()} outstanding</p>
                <p className="text-xs mt-1">You can now go to Loans and record their payments.</p>
              </div>
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Client *</label>
              <select required value={form.borrowerId} onChange={e=>setForm(f=>({...f,borrowerId:e.target.value}))} className="input-field">
                <option value="">-- Select borrower --</option>
                {borrowers.map((b:any)=><option key={b.id} value={b.id}>{b.firstName} {b.lastName} ({b.phone})</option>)}
              </select>
              <p className="text-xs text-zinc-400 mt-1">Client must have an account. If not, create one first under Users.</p>
            </div>
            <div>
              <label className="label">Outstanding Balance (Tsh) *</label>
              <input required type="number" min={1} value={form.outstandingAmount} onChange={e=>setForm(f=>({...f,outstandingAmount:e.target.value}))} className="input-field" placeholder="e.g. 350000"/>
              <p className="text-xs text-zinc-400 mt-1">How much do they still owe you TODAY including any interest.</p>
            </div>
            <div>
              <label className="label">Repayment Type</label>
              <select value={form.repaymentType} onChange={e=>setForm(f=>({...f,repaymentType:e.target.value}))} className="input-field">
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
            <div>
              <label className="label">Original Loan Date (optional)</label>
              <input type="date" value={form.originalDate} onChange={e=>setForm(f=>({...f,originalDate:e.target.value}))} className="input-field"/>
              <p className="text-xs text-zinc-400 mt-1">Approximate date they received the money.</p>
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} className="input-field" rows={2} placeholder="e.g. Mkopo wa zamani — alianza kulipa Januari 2024"/>
            </div>
            <button type="submit" disabled={busy} className="btn-primary w-full py-3">
              {busy?"Importing...":"Import Legacy Loan"}
            </button>
          </form>
        </div>

        {/* Example */}
        <div className="card bg-zinc-50">
          <h2 className="text-base font-bold text-zinc-800 mb-4">Mfano (Example)</h2>
          <div className="space-y-3 text-sm text-zinc-600">
            <div className="bg-white rounded-xl p-4 border border-zinc-200">
              <p className="font-semibold text-zinc-800 mb-2">Hali:</p>
              <p>Bonasi alikopa Tsh 500,000 mwaka 2024.</p>
              <p>Amelipa tayari: Tsh 150,000</p>
              <p>Bado anakudai: <strong className="text-red-600">Tsh 350,000</strong></p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-zinc-200">
              <p className="font-semibold text-zinc-800 mb-2">Unachoweka:</p>
              <p>Client: <strong>Bonasi</strong></p>
              <p>Outstanding Balance: <strong>Tsh 350,000</strong></p>
              <p>Repayment: <strong>Monthly</strong></p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <p className="font-semibold text-emerald-800 mb-1">Matokeo:</p>
              <p className="text-emerald-700">Mfumo utaunda mkopo wa Tsh 350,000 kwa Bonasi ukiwa DISBURSED. Balance ya kampuni haitabadilika. Unaweza kupokea malipo yake sasa hivi.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}