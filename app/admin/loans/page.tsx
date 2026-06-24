"use client";
import{useEffect,useState}from"react";
import{useRouter}from"next/navigation";
import Layout from"@/components/Layout";
import{getAllLoans,updateLoanStatus,updateLoan,deleteLoan,deleteAllLoans,getLoanRepayments,recordRepayment}from"@/lib/api";
import{useLanguage}from"@/context/LanguageContext";
import{generateLoanApplicationPDF}from"@/lib/pdfGenerator";
import DocumentManagement from '@/components/DocumentManagement';
import { Printer, FileText, X, Trash2, AlertTriangle, CreditCard, CheckCircle } from "lucide-react";

const STATUSES=["ALL","PENDING","APPROVED","REJECTED","DISBURSED","REPAID","DEFAULTED"];

export default function AdminLoans(){
  const router=useRouter();
  const{t}=useLanguage();
  const[loans,setLoans]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[busy,setBusy]=useState<string|null>(null);
  const[viewing,setViewing]=useState<any|null>(null);
  const[showDocuments,setShowDocuments]=useState(false);
  const[confirmDel,setConfirmDel]=useState("");
  const[deleting,setDeleting]=useState(false);
  const[filter,setFilter]=useState("ALL");
  const[notes,setNotes]=useState<Record<string,string>>({});
  const[refreshKey,setRefreshKey]=useState(0);
  // State for adjustments
  const[adjustmentType,setAdjustmentType]=useState<"fixed"|"percentage">("fixed");
  const[adjustmentValue,setAdjustmentValue]=useState<string>("");
  const[adjustmentDirection,setAdjustmentDirection]=useState<"increase"|"decrease">("increase");
  const[repayModal,setRepayModal]=useState<any|null>(null);
  const[repayAmount,setRepayAmount]=useState("");
  const[repayDate,setRepayDate]=useState(new Date().toISOString().split('T')[0]);
  const[repayNotes,setRepayNotes]=useState("");
  const[repayments,setRepayments]=useState<any[]>([]);
  const[repayBusy,setRepayBusy]=useState(false);
  const[adjustedAmount,setAdjustedAmount]=useState<number>(0);

  useEffect(()=>{const u=localStorage.getItem("user");if(!u){router.push("/");return;}const role=JSON.parse(u).role;if(!["ADMIN", "DIRECTOR", "CEO"].includes(role)){router.push(role==="LOAN_OFFICER"?"/staff":"/borrower");return;}load();},[router, refreshKey]);

  useEffect(() => {
    const handleFocus = () => setRefreshKey(k => k + 1);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const load=()=>{getAllLoans().then(setLoans).catch(console.error).finally(()=>setLoading(false));};
  const action=async(id:string,status:string)=>{setBusy(id);try{await updateLoanStatus(id,status,notes[id]);setViewing(null);load();}catch(e:any){alert(e.message||"Failed to update loan status");}finally{setBusy(null);}};
  // Effect to calculate adjusted amount in real-time
  useEffect(()=>{
    if(viewing){
      const baseAmount = Number(viewing.requestedAmount||viewing.amount);
      const value = Number(adjustmentValue) || 0;
      let newAmount = baseAmount;
      if(adjustmentType === "fixed"){
        newAmount = adjustmentDirection === "increase" ? baseAmount + value : baseAmount - value;
      } else {
        const factor = adjustmentDirection === "increase" ? 1 + (value/100) : 1 - (value/100);
        newAmount = baseAmount * factor;
      }
      setAdjustedAmount(Math.max(0, Math.round(newAmount)));
    }
  }, [viewing, adjustmentType, adjustmentValue, adjustmentDirection]);
  // Reset adjustment state when viewing a new loan
  useEffect(()=>{
    if(viewing){
      setAdjustmentType("fixed");
      setAdjustmentValue("");
      setAdjustmentDirection("increase");
      setAdjustedAmount(Number(viewing.amount));
    }
  }, [viewing?.id]);
  // Apply the adjustment
  const applyAdjustment=async()=>{
    if(!viewing) return;
    setBusy(viewing.id);
    try{
      const interestRate = Number(viewing.interestRate);
      const repaymentPeriod = Number(viewing.repaymentPeriod);
      const totalAmount = adjustedAmount * (1 + interestRate / 100);
      const monthlyPayment = totalAmount / repaymentPeriod;
      const updatedLoan=await updateLoan(viewing.id,{amount:adjustedAmount});
      setLoans(loans.map(l=>l.id===updatedLoan.id?updatedLoan:l));
      setViewing(updatedLoan);
      setAdjustmentValue("");
    }catch(e:any){
      alert(e.message||"Failed to apply adjustment");
    }finally{setBusy(null);}
  };
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
      profilePictureUrl: borrower.profilePictureUrl,
      ...appData
    });
  };

  const handleDeleteOne=async(id)=>{
      setDeleting(true);
      try{await deleteLoan(id);setViewing(null);load();}
      catch(e){alert(e.message||"Failed to delete");}
      finally{setDeleting(false);setConfirmDel("");}
    };
    const handleDeleteAll=async()=>{
      setDeleting(true);
      try{await deleteAllLoans();load();}
      catch(e){alert(e.message||"Failed to clear history");}
      finally{setDeleting(false);setConfirmDel("");}
    };
    const badge=(s:string)=><span className={`badge-${s.toLowerCase()}`}>{s}</span>;

  const counts=STATUSES.reduce((a:any,s)=>{a[s]=s==="ALL"?loans.length:loans.filter(l=>l.status===s).length;return a;},{});
  const filtered=filter==="ALL"?loans:loans.filter(l=>l.status===filter);

  const Row=({label,value}:{label:string;value:any})=>(
    <div className="flex gap-2 py-1.5 border-b border-dark-200 last:border-0">
      <span className="text-xs font-semibold text-dark-400 uppercase w-40 shrink-0">{label}</span>
      <span className="text-sm text-dark-800 font-medium">{value||<span className="text-dark-300 italic"></span>}</span>
    </div>
  );

  return(<Layout portal="admin">
    <div className="mb-6">
      <h1 className="text-3xl font-black text-dark-800">{t.loanManagement}</h1>
    </div>

    {/* Status filter tabs */}
    <div className="flex flex-wrap gap-2 mb-6">
      {STATUSES.map(s=>(
        <button key={s} onClick={()=>setFilter(s)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter===s?"bg-primary-600 text-white shadow":"bg-white text-dark-500 border border-dark-200 hover:border-dark-300"}`}>
          {s} <span className={`ml-1 ${filter===s?"opacity-70":"text-dark-400"}`}>({counts[s]||0})</span>
        </button>
      ))}
    </div>

    {loading?<div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"/></div>:
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-dark-200">
          {["Borrower","Phone","Amount","Purpose","Status","Applied","Actions"].map(h=><th key={h} className="text-left py-3 px-3 text-xs font-semibold text-dark-500 uppercase">{h}</th>)}
        </tr></thead>
        <tbody>
          {filtered.length===0&&<tr><td colSpan={7} className="text-center py-16 text-dark-400">No loans with status: {filter}</td></tr>}
          {filtered.map((l:any)=>(
            <tr key={l.id} className="border-b border-dark-100 hover:bg-dark-50">
              <td className="py-3 px-3 font-semibold text-dark-800">{l.borrower?.firstName} {l.borrower?.lastName}</td>
              <td className="py-3 px-3 text-dark-500">{l.borrower?.phone}</td>
              <td className="py-3 px-3 font-bold">Tsh {Number(l.amount).toLocaleString()}</td>
              <td className="py-3 px-3 text-dark-400 text-xs max-w-[120px] truncate">{l.purpose||""}</td>
              <td className="py-3 px-3">{badge(l.status)}</td>
              <td className="py-3 px-3 text-dark-400 text-xs">{new Date(l.createdAt).toLocaleDateString()}</td>
              <td className="py-3 px-3">
                <div className="flex gap-1">
                  <button onClick={()=>setViewing(l)} className="btn-secondary text-xs py-1 px-2"> View</button>
                  <button onClick={()=>setShowDocuments(true)} className="btn-secondary text-xs py-1 px-2"> Docs</button>
                  <button onClick={()=>handlePrint(l)} className="btn-secondary text-xs py-1 px-2"> Print</button>
                  <button onClick={(e)=>{e.stopPropagation();setConfirmDel(l.id);}} title="Delete" className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all"><Trash2 className="w-3.5 h-3.5"/></button>
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
          <div className="flex items-center justify-between p-6 border-b border-dark-200">
            <div>
              <h2 className="text-xl font-black text-dark-800">Loan Application Details</h2>
              <p className="text-dark-500 text-sm mt-0.5">{viewing.borrower?.firstName} {viewing.borrower?.lastName}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>setShowDocuments(true)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"> <FileText className="w-3.5 h-3.5" /> Documents</button>
              <button onClick={()=>handlePrint(viewing)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"> <Printer className="w-3.5 h-3.5" /> Print</button>
              <button onClick={()=>setViewing(null)} className="w-8 h-8 rounded-full bg-dark-100 hover:bg-dark-200 flex items-center justify-center text-dark-500 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Loan summary */}
            <div className="bg-dark-800 rounded-2xl p-5 text-white">
              <p className="text-xs font-semibold text-dark-300 mb-3 uppercase tracking-wide">Loan Summary</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {[
                  {l:"Requested",v:`Tsh ${Number(viewing.requestedAmount||viewing.amount).toLocaleString()}`},
                  {l:"Adjusted",v:`Tsh ${adjustedAmount.toLocaleString()}`},
                  {l:"Interest",v:`${Number(viewing.interestRate)}%`},
                  {l:"Total",v:`Tsh ${(adjustedAmount * (1 + Number(viewing.interestRate)/100)).toLocaleString()}`}
                ].map(({l,v})=><div key={l}><p className="text-brand-400 font-black text-lg">{v}</p><p className="text-dark-300 text-xs mt-0.5">{l}</p></div>)}
              </div>
            </div>
            {/* Adjustment controls (only for pending loans) */}
            {viewing.status==="PENDING"&&(
              <div className="bg-dark-50 rounded-2xl p-5">
                <p className="text-xs font-black text-dark-500 uppercase tracking-wide mb-4">Adjust Loan Amount</p>
                {/* Adjustment type toggle */}
                <div className="flex gap-2 mb-4">
                  <button onClick={()=>setAdjustmentType("fixed")} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${adjustmentType==="fixed"?"bg-primary-600 text-white":"bg-white text-dark-600 border border-dark-200"}`}>Fixed Amount</button>
                  <button onClick={()=>setAdjustmentType("percentage")} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${adjustmentType==="percentage"?"bg-primary-600 text-white":"bg-white text-dark-600 border border-dark-200"}`}>Percentage</button>
                </div>
                {/* Adjustment direction toggle */}
                <div className="flex gap-2 mb-4">
                  <button onClick={()=>setAdjustmentDirection("increase")} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${adjustmentDirection==="increase"?"bg-emerald-600 text-white":"bg-white text-dark-600 border border-dark-200"}`}>Increase</button>
                  <button onClick={()=>setAdjustmentDirection("decrease")} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${adjustmentDirection==="decrease"?"bg-red-600 text-white":"bg-white text-dark-600 border border-dark-200"}`}>Decrease</button>
                </div>
                {/* Adjustment value input */}
                <div className="flex gap-3 mb-4">
                  <input
                    type="number"
                    value={adjustmentValue}
                    onChange={(e)=>setAdjustmentValue(e.target.value)}
                    placeholder={adjustmentType==="percentage"?"Percentage (e.g., 10)":"Amount (e.g., 50000)"}
                    className="input-field flex-1"
                  />
                  <button
                    onClick={applyAdjustment}
                    disabled={busy===viewing.id || !adjustmentValue}
                    className="btn-primary px-6"
                  >Apply Adjustment</button>
                </div>
                {/* Show adjusted amount */}
                <p className="text-sm text-dark-500">
                  New Amount: <span className="font-black text-dark-800">Tsh {adjustedAmount.toLocaleString()}</span>
                </p>
              </div>
            )}
            {/* Old loan warning */}
            {Object.keys(viewing.applicationData||{}).length===0&&(
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm"> This loan was submitted before the full form system. Only basic info available.</div>
            )}
            {/* Borrower */}
            <div>
              <h3 className="text-sm font-black text-dark-500 uppercase tracking-wide mb-3">01. Borrower Information</h3>
              <div className="bg-dark-50 rounded-xl p-4">
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
              <h3 className="text-sm font-black text-dark-500 uppercase tracking-wide mb-3">02. Business Information</h3>
              <div className="bg-dark-50 rounded-xl p-4">
                <Row label="Business Name" value={viewing.borrowerProfile?.businessName || viewing.applicationData?.businessName} />
                <Row label="Location" value={viewing.borrowerProfile?.businessLocation || viewing.applicationData?.businessLocation} />
                <Row label="Since" value={viewing.borrowerProfile?.businessSince || viewing.applicationData?.businessSince} />
                <Row label="Loan Purpose" value={viewing.purpose||viewing.applicationData?.loanPurpose} />
              </div>
            </div>}
            {/* Guarantor 1 */}
            {viewing.applicationData?.guarantor1Name&&<div>
              <h3 className="text-sm font-black text-dark-500 uppercase tracking-wide mb-3">06. First Guarantor</h3>
              <div className="bg-dark-50 rounded-xl p-4">
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
              <h3 className="text-sm font-black text-dark-500 uppercase tracking-wide mb-3">08. Second Guarantor</h3>
              <div className="bg-dark-50 rounded-xl p-4">
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
          <div className="p-6 border-t border-dark-200">
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
            ):
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">{badge(viewing.status)}<span className="text-dark-500 text-sm">No further action needed</span></div>
                <button onClick={()=>setViewing(null)} className="btn-secondary">Close</button>
              </div>
            }
          </div>
        </div>
      </div>
    )}

    {/* Documents Modal */}
    {(showDocuments && viewing) && (
      <DocumentManagement
        loanId={viewing.id}
        onClose={()=>setShowDocuments(false)}
      />
    )}
    {/* Delete confirmation modal */}
    {confirmDel&&(
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600"/>
            </div>
            <div>
              <h3 className="text-lg font-black text-dark-800">{confirmDel==="all"?"Clear All Loan History":"Delete This Loan"}</h3>
              <p className="text-sm text-dark-500 mt-0.5">{confirmDel==="all"?"This will permanently delete ALL "+loans.length+" loan records. This cannot be undone.":"This loan record will be permanently deleted. This cannot be undone."}</p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={()=>confirmDel==="all"?handleDeleteAll():handleDeleteOne(confirmDel)} disabled={deleting} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50">{deleting?"Deleting...":confirmDel==="all"?"Yes, Delete All":"Yes, Delete"}</button>
            <button onClick={()=>setConfirmDel("")} disabled={deleting} className="flex-1 btn-secondary py-2.5">Cancel</button>
          </div>
        </div>
      </div>
    )}
    {/* INSTALLMENT REPAYMENT MODAL */}
    {repayModal && (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8 animate-slide-up">
          <div className="flex items-center justify-between p-5 border-b border-zinc-200">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">Record Repayment</h2>
              <p className="text-zinc-500 text-sm">{repayModal.borrower?.firstName} {repayModal.borrower?.lastName} &mdash; Tsh {Number(repayModal.totalAmount).toLocaleString()} total</p>
            </div>
            <button onClick={() => setRepayModal(null)} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center"><X className="w-4 h-4"/></button>
          </div>
          <div className="p-5 space-y-4">
            {/* Summary */}
            {(() => {
              const totalPaid = repayments.reduce((s: number, r: any) => s + Number(r.amount), 0);
              const remaining = Math.max(0, Number(repayModal.totalAmount) - totalPaid);
              return (
                <div className="grid grid-cols-3 gap-3 mb-2">
                  <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-center">
                    <p className="text-[10px] font-semibold text-sky-600 uppercase tracking-wider">Total Due</p>
                    <p className="text-sm font-bold text-sky-800 mt-0.5">Tsh {Number(repayModal.totalAmount).toLocaleString()}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Paid</p>
                    <p className="text-sm font-bold text-emerald-800 mt-0.5">Tsh {totalPaid.toLocaleString()}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                    <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Remaining</p>
                    <p className="text-sm font-bold text-amber-800 mt-0.5">Tsh {remaining.toLocaleString()}</p>
                  </div>
                </div>
              );
            })()}
            {/* Repayment history */}
            {repayments.length > 0 && (
              <div className="bg-zinc-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Payment History</p>
                <div className="space-y-1.5">
                  {repayments.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500"/><span className="text-zinc-600">{new Date(r.paidDate || r.createdAt).toLocaleDateString()}</span></span>
                      <span className="font-semibold text-emerald-700">+Tsh {Number(r.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* New payment form */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Amount (Tsh)</label>
                  <input type="number" value={repayAmount} onChange={e => setRepayAmount(e.target.value)} className="input-field" placeholder="e.g. 50000" min={1}/>
                </div>
                <div>
                  <label className="label">Date Paid</label>
                  <input type="date" value={repayDate} onChange={e => setRepayDate(e.target.value)} className="input-field"/>
                </div>
              </div>
              <div>
                <label className="label">Notes (optional)</label>
                <input value={repayNotes} onChange={e => setRepayNotes(e.target.value)} className="input-field" placeholder="e.g. M-Pesa ref 12345"/>
              </div>
            </div>
          </div>
          <div className="p-5 border-t border-zinc-200 flex gap-3">
            <button onClick={submitRepayment} disabled={repayBusy || !repayAmount} className="btn-primary flex-1 py-2.5">
              {repayBusy ? "Saving..." : "Record Payment"}
            </button>
            <button onClick={() => setRepayModal(null)} className="btn-secondary px-6">Close</button>
          </div>
        </div>
      </div>
    )}

  </Layout>
  );
}




