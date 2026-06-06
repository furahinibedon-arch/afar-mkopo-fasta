"use client";
import{useEffect,useState}from"react";
import{useRouter}from"next/navigation";
import Layout from"@/components/Layout";
import{getAllLoans,updateLoanStatus}from"@/lib/api";
import{useLanguage}from"@/context/LanguageContext";

export default function StaffPortal(){
  const router=useRouter();
  const{t}=useLanguage();
  const[loans,setLoans]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[err,setErr]=useState<string|null>(null);
  const[notes,setNotes]=useState<Record<string,string>>({});
  const[busy,setBusy]=useState<string|null>(null);
  const[viewing,setViewing]=useState<any|null>(null);

  useEffect(()=>{
    const u=localStorage.getItem("user");
    if(!u){router.push("/");return;}
    const role=JSON.parse(u).role;
    if(role==="BORROWER"){router.push("/borrower");return;}
    load();
  },[router]);

  const load=()=>{setLoading(true);getAllLoans().then(setLoans).catch((e:any)=>setErr(e.message)).finally(()=>setLoading(false));};

  const action=async(id:string,status:string)=>{
    setBusy(id);
    try{await updateLoanStatus(id,status,notes[id]);setViewing(null);load();}
    catch(e:any){setErr(e.message);}
    finally{setBusy(null);}
  };

  const pending=loans.filter(l=>l.status==="PENDING");
  const reviewed=loans.filter(l=>l.status!=="PENDING");

  const badge=(s:string)=><span className={`badge-${s.toLowerCase()}`}>{s}</span>;

  const Row=({label,value}:{label:string;value:any})=>value?(
    <div className="flex gap-2 py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-semibold text-slate-400 uppercase w-40 shrink-0">{label}</span>
      <span className="text-sm text-navy-800 font-medium">{value}</span>
    </div>
  ):null;

  return(
    <Layout portal="staff">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-navy-800">{t.loanQueue}</h1>
        <p className="text-slate-500 mt-1">{t.reviewProcess}</p>
      </div>

      {err&&<div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"> {err}</div>}

      {loading?<div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"/></div>:<>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[{l:t.pendingReview,v:pending.length,c:"border-amber-400"},{l:t.reviewed,v:reviewed.length,c:"border-emerald-400"},{l:t.total,v:loans.length,c:"border-blue-400"}].map(({l,v,c})=>(
            <div key={l} className={`card border-l-4 ${c}`}><p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{l}</p><p className="text-3xl font-black text-navy-800 mt-1">{v}</p></div>
          ))}
        </div>

        {/* Pending */}
        <div className="card mb-6">
          <h2 className="text-lg font-black text-navy-800 mb-4">{t.pendingReview} ({pending.length})</h2>
          {pending.length===0?<p className="text-slate-400 text-center py-8">{t.noPending}</p>:
          <div className="space-y-3">
            {pending.map((loan:any)=>(
              <div key={loan.id} className="border border-slate-200 rounded-xl p-4 hover:border-brand-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-navy-800 text-lg">{loan.borrower?.firstName} {loan.borrower?.lastName}</span>
                      <span className="badge-pending">PENDING</span>
                    </div>
                    <div className="flex gap-4 text-sm text-slate-500">
                      <span> {loan.borrower?.phone}</span>
                      <span> Tsh {Number(loan.amount).toLocaleString()}</span>
                      <span> {new Date(loan.createdAt).toLocaleDateString()}</span>
                    </div>
                    {loan.purpose&&<p className="text-xs text-slate-400 mt-1 italic">"{loan.purpose}"</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>setViewing(loan)} className="btn-primary text-sm py-2 px-4">
                       View & Decide
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>}
        </div>

        {/* Reviewed */}
        <div className="card">
          <h2 className="text-lg font-black text-navy-800 mb-4">{t.reviewed} ({reviewed.length})</h2>
          {reviewed.length===0?<p className="text-slate-400 text-center py-8">{t.noneYet}</p>:
          <div className="space-y-2">
            {reviewed.map((loan:any)=>(
              <div key={loan.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div>
                  <p className="font-semibold text-navy-800">{loan.borrower?.firstName} {loan.borrower?.lastName}</p>
                  <p className="text-xs text-slate-400">Tsh {Number(loan.amount).toLocaleString()} &bull; {new Date(loan.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {badge(loan.status)}
                  <button onClick={()=>setViewing(loan)} className="text-xs text-slate-400 hover:text-navy-800 underline">View</button>
                </div>
              </div>
            ))}
          </div>}
        </div>
      </>}

      {/* Detail Modal */}
      {viewing&&(
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-navy-800">Loan Application Details</h2>
                <p className="text-slate-500 text-sm mt-0.5">{viewing.borrower?.firstName} {viewing.borrower?.lastName}</p>
              </div>
              <button onClick={()=>setViewing(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"></button>
            </div>

            <div className="p-6 space-y-6">
              {/* Loan summary card */}
              <div className="bg-navy-800 rounded-2xl p-5 text-white">
                <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Loan Summary</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  {[
                    {l:"Amount",v:`Tsh ${Number(viewing.amount).toLocaleString()}`},
                    {l:"Interest",v:`${Number(viewing.interestRate)}%`},
                    {l:"Period",v:`${viewing.repaymentPeriod} days`},
                    {l:"Total",v:`Tsh ${Number(viewing.totalAmount).toLocaleString()}`},
                  ].map(({l,v})=><div key={l}><p className="text-brand-400 font-black text-lg">{v}</p><p className="text-slate-400 text-xs mt-0.5">{l}</p></div>)}
                </div>
              </div>

              {/* Borrower details */}
              <div>
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-wide mb-3">01. Borrower Information</h3>
                <div className="bg-slate-50 rounded-xl p-4">
                  <Row label="Full Name" value={`${viewing.borrower?.firstName} ${viewing.borrower?.lastName}`}/>
                  <Row label="Email" value={viewing.borrower?.email}/>
                  <Row label="Phone" value={viewing.borrower?.phone}/>
                  <Row label="Date of Birth" value={viewing.applicationData?.dateOfBirth}/>
                  <Row label="Gender" value={viewing.applicationData?.gender}/>
                  <Row label="Marital Status" value={viewing.applicationData?.maritalStatus}/>
                  <Row label="Address / Mtaa" value={viewing.applicationData?.address}/>
                  <Row label="House No." value={viewing.applicationData?.houseNumber}/>
                  <Row label="Spouse Name" value={viewing.applicationData?.spouseName}/>
                </div>
              </div>

              {/* Business details */}
              {(viewing.applicationData?.businessName||viewing.purpose)&&<div>
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-wide mb-3">02. Business Information</h3>
                <div className="bg-slate-50 rounded-xl p-4">
                  <Row label="Business Name" value={viewing.applicationData?.businessName}/>
                  <Row label="Location" value={viewing.applicationData?.businessLocation}/>
                  <Row label="Since" value={viewing.applicationData?.businessSince}/>
                  <Row label="Loan Purpose" value={viewing.purpose||viewing.applicationData?.loanPurpose}/>
                </div>
              </div>}

              {/* Guarantor 1 */}
              {viewing.applicationData?.guarantor1Name&&<div>
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-wide mb-3">06. First Guarantor</h3>
                <div className="bg-slate-50 rounded-xl p-4">
                  <Row label="Name" value={viewing.applicationData?.guarantor1Name}/>
                  <Row label="Address" value={viewing.applicationData?.guarantor1Address}/>
                  <Row label="Phone" value={viewing.applicationData?.guarantor1Phone}/>
                  <Row label="Business" value={viewing.applicationData?.guarantor1Business}/>
                  <Row label="Relationship" value={viewing.applicationData?.guarantor1Relationship}/>
                  <Row label="Collateral" value={viewing.applicationData?.guarantor1Collateral}/>
                </div>
              </div>}

              {/* Guarantor 2 */}
              {viewing.applicationData?.guarantor2Name&&<div>
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-wide mb-3">08. Second Guarantor</h3>
                <div className="bg-slate-50 rounded-xl p-4">
                  <Row label="Name" value={viewing.applicationData?.guarantor2Name}/>
                  <Row label="Address" value={viewing.applicationData?.guarantor2Address}/>
                  <Row label="Phone" value={viewing.applicationData?.guarantor2Phone}/>
                  <Row label="Business" value={viewing.applicationData?.guarantor2Business}/>
                  <Row label="Relationship" value={viewing.applicationData?.guarantor2Relationship}/>
                  <Row label="Collateral" value={viewing.applicationData?.guarantor2Collateral}/>
                </div>
              </div>}

              {/* Notes */}
              {viewing.status==="PENDING"&&<div>
                <label className="label">Notes / Maelezo (optional)</label>
                <textarea value={notes[viewing.id]||""} onChange={e=>setNotes(n=>({...n,[viewing.id]:e.target.value}))} rows={3} className="input-field" placeholder="Add review notes..."/>
              </div>}
            </div>

            {/* Footer actions */}
            <div className="p-6 border-t border-slate-100">
              {viewing.status==="PENDING"?(
                <div className="flex gap-3">
                  <button onClick={()=>action(viewing.id,"APPROVED")} disabled={busy===viewing.id} className="btn-success flex-1 py-3 text-base">
                    {busy===viewing.id?"Processing":" Approve Loan"}
                  </button>
                  <button onClick={()=>action(viewing.id,"REJECTED")} disabled={busy===viewing.id} className="btn-danger flex-1 py-3 text-base">
                    {busy===viewing.id?"Processing":" Reject Loan"}
                  </button>
                  <button onClick={()=>setViewing(null)} className="btn-secondary px-6">Cancel</button>
                </div>
              ):(
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">{badge(viewing.status)}<span className="text-slate-500 text-sm">Decision already made</span></div>
                  <button onClick={()=>setViewing(null)} className="btn-secondary">Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}