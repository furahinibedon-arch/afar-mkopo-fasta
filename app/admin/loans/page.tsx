"use client";
import{useEffect,useState}from"react";
import{useRouter}from"next/navigation";
import Layout from"@/components/Layout";
import{getAllLoans,updateLoanStatus}from"@/lib/api";
import{useLanguage}from"@/context/LanguageContext";
import{generateLoanApplicationPDF}from"@/lib/pdfGenerator";

const STATUSES=["ALL","PENDING","APPROVED","REJECTED","DISBURSED","REPAID","DEFAULTED"];

export default function AdminLoans(){
  const router=useRouter();
  const{t}=useLanguage();
  const[loans,setLoans]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[busy,setBusy]=useState<string|null>(null);
  const[viewing,setViewing]=useState<any|null>(null);
  const[filter,setFilter]=useState("ALL");
  const[notes,setNotes]=useState<Record<string,string>>({});

  useEffect(()=>{const u=localStorage.getItem("user");if(!u){router.push("/");return;}const role=JSON.parse(u).role;if(role!=="ADMIN"){router.push(role==="LOAN_OFFICER"?"/staff":"/borrower");return;}load();},[router]);
  const load=()=>{getAllLoans().then(setLoans).catch(console.error).finally(()=>setLoading(false));};
  const action=async(id:string,status:string)=>{setBusy(id);try{await updateLoanStatus(id,status,notes[id]);setViewing(null);load();}finally{setBusy(null);}};
  const handlePrint=(loan:any)=>{
    // Build the print data from profile or applicationData!
    const appData = loan.applicationData || {};
    const profile = loan.borrowerProfile || {};
    const borrower = loan.borrower || {};
    generateLoanApplicationPDF({
      firstName: borrower.firstName,
      lastName: borrower.lastName,
      phone: borrower.phone,
      nin: profile.nin,
      country: profile.country || "Tanzania",
      region: profile.region,
      district: profile.district,
      dateOfBirth: profile.dateOfBirth?.split('T')[0],
      gender: profile.gender || appData.gender,
      maritalStatus: profile.maritalStatus || appData.maritalStatus,
      address: profile.address || appData.address,
      houseNumber: profile.houseNumber || appData.houseNumber,
      spouseName: profile.spouseName || appData.spouseName,
      businessName: profile.businessName || appData.businessName,
      businessLocation: profile.businessLocation || appData.businessLocation,
      businessSince: profile.businessSince || appData.businessSince,
      loanAmount: Number(loan.amount),
      loanAmountWords: appData.loanAmountWords,
      dailyPayment: Number(loan.monthlyPayment),
      interestRate: Number(loan.interestRate),
      loanPurpose: loan.purpose,
      ...appData
    });
  };

  const badge=(s:string)=><span className={`badge-${s.toLowerCase()}`}>{s}</span>;

  const counts=STATUSES.reduce((a:any,s)=>{a[s]=s==="ALL"?loans.length:loans.filter(l=>l.status===s).length;return a;},{});
  const filtered=filter==="ALL"?loans:loans.filter(l=>l.status===filter);

  const Row=({label,value}:{label:string;value:any})=>(
    <div className="flex gap-2 py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-semibold text-slate-400 uppercase w-40 shrink-0">{label}</span>
      <span className="text-sm text-navy-800 font-medium">{value||<span className="text-slate-300 italic"></span>}</span>
    </div>
  );

  return(<Layout portal="admin">
    <div className="mb-6">
      <h1 className="text-3xl font-black text-navy-800">{t.loanManagement}</h1>
    </div>

    {/* Status filter tabs */}
    <div className="flex flex-wrap gap-2 mb-6">
      {STATUSES.map(s=>(
        <button key={s} onClick={()=>setFilter(s)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter===s?"bg-navy-800 text-white shadow":"bg-white text-slate-500 border border-slate-200 hover:border-slate-300"}`}>
          {s} <span className={`ml-1 ${filter===s?"opacity-70":"text-slate-400"}`}>({counts[s]||0})</span>
        </button>
      ))}
    </div>

    {loading?<div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"/></div>:
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-slate-200">
          {["Borrower","Phone","Amount","Purpose","Status","Applied","Actions"].map(h=><th key={h} className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}
        </tr></thead>
        <tbody>
          {filtered.length===0&&<tr><td colSpan={7} className="text-center py-16 text-slate-400">No loans with status: {filter}</td></tr>}
          {filtered.map((l:any)=>(
            <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-3 font-semibold text-navy-800">{l.borrower?.firstName} {l.borrower?.lastName}</td>
              <td className="py-3 px-3 text-slate-500">{l.borrower?.phone}</td>
              <td className="py-3 px-3 font-bold">Tsh {Number(l.amount).toLocaleString()}</td>
              <td className="py-3 px-3 text-slate-400 text-xs max-w-[120px] truncate">{l.purpose||""}</td>
              <td className="py-3 px-3">{badge(l.status)}</td>
              <td className="py-3 px-3 text-slate-400 text-xs">{new Date(l.createdAt).toLocaleDateString()}</td>
              <td className="py-3 px-3">
                <div className="flex gap-1">
                  <button onClick={()=>setViewing(l)} className="btn-secondary text-xs py-1 px-2"> View</button>
                  <button onClick={()=>handlePrint(l)} className="btn-secondary text-xs py-1 px-2"> Print</button>
                  {l.status==="PENDING"&&<><button onClick={()=>action(l.id,"APPROVED")} disabled={busy===l.id} className="btn-success text-xs py-1 px-2">{busy===l.id?"":""}</button><button onClick={()=>action(l.id,"REJECTED")} disabled={busy===l.id} className="btn-danger text-xs py-1 px-2">{busy===l.id?"":""}</button></>}
                  {l.status==="APPROVED"&&<button onClick={()=>action(l.id,"DISBURSED")} disabled={busy===l.id} className="btn-primary text-xs py-1 px-2">{busy===l.id?"":" Disburse"}</button>}
                  {l.status==="DISBURSED"&&<button onClick={()=>action(l.id,"REPAID")} disabled={busy===l.id} className="btn-secondary text-xs py-1 px-2">{busy===l.id?"":" Mark Repaid"}</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>}

    {/* Detail Modal - same as staff */}
    {viewing&&(
      <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-slide-up">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-navy-800">Loan Application Details</h2>
              <p className="text-slate-500 text-sm mt-0.5">{viewing.borrower?.firstName} {viewing.borrower?.lastName}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>handlePrint(viewing)} className="btn-secondary text-xs px-3 py-1.5"> Print</button>
              <button onClick={()=>setViewing(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"></button>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Loan summary */}
            <div className="bg-navy-800 rounded-2xl p-5 text-white">
              <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Loan Summary</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {[{l:"Amount",v:`Tsh ${Number(viewing.amount).toLocaleString()}`},{l:"Interest",v:`${Number(viewing.interestRate)}%`},{l:"Period",v:`${viewing.repaymentPeriod} days`},{l:"Total",v:`Tsh ${Number(viewing.totalAmount).toLocaleString()}`}].map(({l,v})=><div key={l}><p className="text-brand-400 font-black text-lg">{v}</p><p className="text-slate-400 text-xs mt-0.5">{l}</p></div>)}
              </div>
            </div>
            {/* Old loan warning */}
            {Object.keys(viewing.applicationData||{}).length===0&&(
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm"> This loan was submitted before the full form system. Only basic info available.</div>
            )}
            {/* Borrower */}
            <div>
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-wide mb-3">01. Borrower Information</h3>
              <div className="bg-slate-50 rounded-xl p-4">
                <Row label="Full Name" value={`${viewing.borrower?.firstName} ${viewing.borrower?.lastName}`} />
                <Row label="Email" value={viewing.borrower?.email} />
                <Row label="Phone" value={viewing.borrower?.phone} />
                <Row label="NIDA Number (NIN)" value={viewing.borrowerProfile?.nin} />
                <Row label="Date of Birth" value={viewing.borrowerProfile?.dateOfBirth?.split('T')[0] || viewing.applicationData?.dateOfBirth} />
                <Row label="Gender" value={viewing.borrowerProfile?.gender || viewing.applicationData?.gender} />
                <Row label="Marital Status" value={viewing.borrowerProfile?.maritalStatus || viewing.applicationData?.maritalStatus} />
                <Row label="Country" value={viewing.borrowerProfile?.country || "Tanzania"} />
                <Row label="Region" value={viewing.borrowerProfile?.region} />
                <Row label="District" value={viewing.borrowerProfile?.district} />
                <Row label="Address" value={viewing.borrowerProfile?.address || viewing.applicationData?.address} />
                <Row label="House No." value={viewing.borrowerProfile?.houseNumber || viewing.applicationData?.houseNumber} />
                <Row label="Spouse Name" value={viewing.borrowerProfile?.spouseName || viewing.applicationData?.spouseName} />
              </div>
            </div>
            {/* Business */}
            {(viewing.applicationData?.businessName||viewing.purpose)&&<div>
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-wide mb-3">02. Business Information</h3>
              <div className="bg-slate-50 rounded-xl p-4">
                <Row label="Business Name" value={viewing.borrowerProfile?.businessName || viewing.applicationData?.businessName} />
                <Row label="Location" value={viewing.borrowerProfile?.businessLocation || viewing.applicationData?.businessLocation} />
                <Row label="Since" value={viewing.borrowerProfile?.businessSince || viewing.applicationData?.businessSince} />
                <Row label="Loan Purpose" value={viewing.purpose||viewing.applicationData?.loanPurpose} />
              </div>
            </div>}
            {/* Guarantor 1 */}
            {viewing.applicationData?.guarantor1Name&&<div>
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-wide mb-3">06. First Guarantor</h3>
              <div className="bg-slate-50 rounded-xl p-4">
                <Row label="Name" value={viewing.applicationData?.guarantor1Name} />
                <Row label="Address" value={viewing.applicationData?.guarantor1Address} />
                <Row label="Phone" value={viewing.applicationData?.guarantor1Phone} />
                <Row label="Business" value={viewing.applicationData?.guarantor1Business} />
                <Row label="Relationship" value={viewing.applicationData?.guarantor1Relationship} />
                <Row label="Collateral" value={viewing.applicationData?.guarantor1Collateral} />
              </div>
            </div>}
            {/* Guarantor 2 */}
            {viewing.applicationData?.guarantor2Name&&<div>
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-wide mb-3">08. Second Guarantor</h3>
              <div className="bg-slate-50 rounded-xl p-4">
                <Row label="Name" value={viewing.applicationData?.guarantor2Name} />
                <Row label="Address" value={viewing.applicationData?.guarantor2Address} />
                <Row label="Phone" value={viewing.applicationData?.guarantor2Phone} />
                <Row label="Business" value={viewing.applicationData?.guarantor2Business} />
                <Row label="Relationship" value={viewing.applicationData?.guarantor2Relationship} />
                <Row label="Collateral" value={viewing.applicationData?.guarantor2Collateral} />
              </div>
            </div>}
            {/* Notes for pending */}
            {viewing.status==="PENDING"&&<div>
              <label className="label">Notes (optional)</label>
              <textarea value={notes[viewing.id]||""} onChange={e=>setNotes(n=>({...n,[viewing.id]:e.target.value}))} rows={3} className="input-field" placeholder="Add review notes..."/>
            </div>}
          </div>
          {/* Footer */}
          <div className="p-6 border-t border-slate-100">
            {viewing.status==="PENDING"?(
              <div className="flex gap-3">
                <button onClick={()=>action(viewing.id,"APPROVED")} disabled={busy===viewing.id} className="btn-success flex-1 py-3"> Approve Loan</button>
                <button onClick={()=>action(viewing.id,"REJECTED")} disabled={busy===viewing.id} className="btn-danger flex-1 py-3"> Reject Loan</button>
                <button onClick={()=>setViewing(null)} className="btn-secondary px-6">Cancel</button>
              </div>
            ):viewing.status==="APPROVED"?(
              <div className="flex gap-3">
                <button onClick={()=>action(viewing.id,"DISBURSED")} disabled={busy===viewing.id} className="btn-primary flex-1 py-3"> Disburse Loan</button>
                <button onClick={()=>setViewing(null)} className="btn-secondary px-6">Close</button>
              </div>
            ):viewing.status==="DISBURSED"?(
              <div className="flex gap-3">
                <button onClick={()=>action(viewing.id,"REPAID")} disabled={busy===viewing.id} className="btn-success flex-1 py-3"> Mark as Repaid</button>
                <button onClick={()=>action(viewing.id,"DEFAULTED")} disabled={busy===viewing.id} className="btn-danger flex-1 py-3"> Mark Defaulted</button>
                <button onClick={()=>setViewing(null)} className="btn-secondary px-6">Close</button>
              </div>
            ):(
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">{badge(viewing.status)}<span className="text-slate-500 text-sm">No further action needed</span></div>
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
