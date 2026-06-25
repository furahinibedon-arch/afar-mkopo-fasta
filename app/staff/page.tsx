"use client";
import{useEffect,useState}from"react";
import { useInactivityTimeout } from "@/lib/useInactivityTimeout";
import{useRouter}from"next/navigation";
import Layout from"@/components/Layout";
import{getAllLoans,updateLoanStatus,getLoanRepayments,recordRepayment}from"@/lib/api";
import{useLanguage}from"@/context/LanguageContext";
import{generateLoanApplicationPDF}from"@/lib/pdfGenerator";
import DocumentManagement from "@/components/DocumentManagement";
import { Printer, FileText, X, CheckCircle, XCircle, CreditCard, PlusCircle } from "lucide-react";

export default function StaffPortal(){
  const router=useRouter();
  useInactivityTimeout();
  const{t}=useLanguage();
  const[loans,setLoans]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[err,setErr]=useState<string|null>(null);
  const[notes,setNotes]=useState<Record<string,string>>({});
  const[busy,setBusy]=useState<string|null>(null);
  const[viewing,setViewing]=useState<any|null>(null);
  const[showDocuments,setShowDocuments]=useState(false);
  // Installment repayment state
  const[repayModal,setRepayModal]=useState<any|null>(null);
  const[repayments,setRepayments]=useState<any[]>([]);
  const[repayAmount,setRepayAmount]=useState("");
  const[repayDate,setRepayDate]=useState(new Date().toISOString().split("T")[0]);
  const[repayNotes,setRepayNotes]=useState("");
  const[repayBusy,setRepayBusy]=useState(false);

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

  const openRepayModal=async(loan:any)=>{
    setRepayModal(loan);
    setRepayAmount("");
    setRepayNotes("");
    setRepayDate(new Date().toISOString().split("T")[0]);
    try{ const r=await getLoanRepayments(loan.id); setRepayments(r); } catch(_){ setRepayments([]); }
  };

  const submitRepayment=async()=>{
    if(!repayModal||!repayAmount) return;
    setRepayBusy(true);
    try{
      await recordRepayment(repayModal.id,Number(repayAmount),repayDate,repayNotes);
      const r=await getLoanRepayments(repayModal.id);
      setRepayments(r);
      setRepayAmount(""); setRepayNotes("");
      load();
    }catch(e:any){ alert(e.message||"Failed"); }
    finally{ setRepayBusy(false); }
  };

  const handlePrint=(loan:any)=>{
    const appData=loan.applicationData||{};
    const profile=loan.borrowerProfile||{};
    const borrower=loan.borrower||{};
    generateLoanApplicationPDF({
      firstName:borrower.firstName, lastName:borrower.lastName,
      phone:borrower.phone, nin:profile.nin,
      country:profile.country||"Tanzania", region:profile.region, district:profile.district,
      dateOfBirth:profile.dateOfBirth?.split("T")[0],
      gender:profile.gender||appData.gender, maritalStatus:profile.maritalStatus||appData.maritalStatus,
      address:profile.address||appData.address, houseNumber:profile.houseNumber||appData.houseNumber,
      spouseName:profile.spouseName||appData.spouseName,
      businessName:profile.businessName||appData.businessName,
      businessLocation:profile.businessLocation||appData.businessLocation,
      businessSince:profile.businessSince||appData.businessSince,
      loanAmount:Number(loan.amount), loanAmountWords:appData.loanAmountWords,
      dailyPayment:Number(loan.monthlyPayment), interestRate:Number(loan.interestRate),
      loanPurpose:loan.purpose, profilePictureUrl:borrower.profilePictureUrl, ...appData
    });
  };

  const disbursed=loans.filter(l=>l.status==="DISBURSED");
  const pending=loans.filter(l=>l.status==="PENDING");
  const reviewed=loans.filter(l=>l.status!=="PENDING");
  const badge=(s:string)=><span className={`badge-${s.toLowerCase()}`}>{s}</span>;

  const Row=({label,value}:{label:string;value:any})=>(
    <div className="flex gap-2 py-1.5 border-b border-zinc-100 last:border-0">
      <span className="text-xs font-semibold text-zinc-400 uppercase w-40 shrink-0">{label}</span>
      <span className="text-sm text-zinc-800 font-medium">{value||""}</span>
    </div>
  );

  return(
    <Layout portal="staff">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">{t.loanQueue}</h1>
          <p className="page-subtitle">{t.reviewProcess}</p>
        </div>
        <a href="/staff/apply" className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4"/> New Application
        </a>
      </div>

      {err&&<div className="alert-error mb-4">{err}</div>}

      {loading?<div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"/></div>:<>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            {l:"Pending Review",v:pending.length,c:"border-amber-400",vc:"text-amber-600"},
            {l:"Active (Disbursed)",v:disbursed.length,c:"border-sky-400",vc:"text-sky-700"},
            {l:"Reviewed",v:reviewed.length,c:"border-emerald-400",vc:"text-emerald-700"},
            {l:"Total",v:loans.length,c:"border-zinc-300",vc:"text-zinc-800"},
          ].map(({l,v,c,vc})=>(
            <div key={l} className={`card border-l-4 ${c}`}>
              <p className="kpi-label">{l}</p>
              <p className={`kpi-value ${vc}`}>{v}</p>
            </div>
          ))}
        </div>

        {/* Active loans - record payments */}
        {disbursed.length>0&&(
        <div className="card mb-6">
          <h2 className="text-sm font-bold text-zinc-800 mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-sky-600"/> Active Loans  Record Payment
          </h2>
          <div className="space-y-2">
            {disbursed.map((loan:any)=>(
              <div key={loan.id} className="flex items-center justify-between py-2.5 px-3 bg-sky-50 border border-sky-100 rounded-xl">
                <div>
                  <p className="font-semibold text-zinc-900 text-sm">{loan.borrower?.firstName} {loan.borrower?.lastName}</p>
                  <p className="text-xs text-zinc-500">
                    Tsh {Number(loan.amount).toLocaleString()} principal &bull; Total: Tsh {Number(loan.totalAmount).toLocaleString()}
                    &bull; {loan.applicationData?.repaymentType||"MONTHLY"} repayment
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>setViewing(loan)} className="btn-secondary text-xs py-1.5 px-3">View</button>
                  <button onClick={()=>openRepayModal(loan)} className="btn-success text-xs py-1.5 px-3 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5"/> Record Payment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Pending queue */}
        <div className="card mb-6">
          <h2 className="text-base font-bold text-zinc-800 mb-4">{t.pendingReview} ({pending.length})</h2>
          {pending.length===0?<p className="text-zinc-400 text-center py-8">{t.noPending}</p>:
          <div className="space-y-3">
            {pending.map((loan:any)=>(
              <div key={loan.id} className="border border-zinc-200 rounded-xl p-4 hover:border-sky-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-zinc-900">{loan.borrower?.firstName} {loan.borrower?.lastName}</span>
                      <span className="badge-pending">PENDING</span>
                    </div>
                    <div className="flex gap-3 text-xs text-zinc-500">
                      <span>{loan.borrower?.phone}</span>
                      <span>Tsh {Number(loan.amount).toLocaleString()}</span>
                      <span>{new Date(loan.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>handlePrint(loan)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                      <Printer className="w-3.5 h-3.5"/> Print
                    </button>
                    <button onClick={()=>setViewing(loan)} className="btn-primary text-xs py-1.5 px-3">View & Decide</button>
                  </div>
                </div>
              </div>
            ))}
          </div>}
        </div>

        {/* Reviewed */}
        <div className="card">
          <h2 className="text-base font-bold text-zinc-800 mb-4">{t.reviewed} ({reviewed.filter(l=>l.status!=="DISBURSED").length})</h2>
          {reviewed.filter(l=>l.status!=="DISBURSED").length===0?<p className="text-zinc-400 text-center py-8">{t.noneYet}</p>:
          <div className="space-y-1">
            {reviewed.filter((l:any)=>l.status!=="DISBURSED").map((loan:any)=>(
              <div key={loan.id} className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
                <div>
                  <p className="font-semibold text-zinc-800 text-sm">{loan.borrower?.firstName} {loan.borrower?.lastName}</p>
                  <p className="text-xs text-zinc-400">Tsh {Number(loan.amount).toLocaleString()} &bull; {new Date(loan.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {badge(loan.status)}
                  <button onClick={()=>handlePrint(loan)} className="btn-secondary text-xs py-1 px-2 flex items-center gap-1">
                    <Printer className="w-3.5 h-3.5"/> Print
                  </button>
                  <button onClick={()=>setViewing(loan)} className="text-xs text-zinc-400 hover:text-zinc-800 underline">View</button>
                </div>
              </div>
            ))}
          </div>}
        </div>
      </>}

      {/*  LOAN DETAIL MODAL  */}
      {viewing&&(
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-zinc-200">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Loan Details</h2>
                <p className="text-zinc-500 text-sm">{viewing.borrower?.firstName} {viewing.borrower?.lastName}</p>
              </div>
              <div className="flex gap-2">
                {viewing.status==="DISBURSED"&&(
                  <button onClick={()=>{setViewing(null);openRepayModal(viewing);}} className="btn-success text-xs px-3 py-1.5 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5"/> Record Payment
                  </button>
                )}
                <button onClick={()=>setShowDocuments(true)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5"/> Docs
                </button>
                <button onClick={()=>handlePrint(viewing)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                  <Printer className="w-3.5 h-3.5"/> Print
                </button>
                <button onClick={()=>setViewing(null)} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                  <X className="w-4 h-4"/>
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-zinc-800 rounded-xl p-4 text-white grid grid-cols-4 gap-3 text-center">
                {[
                  {l:"Principal",v:`Tsh ${Number(viewing.amount).toLocaleString()}`},
                  {l:"Interest",v:`${Number(viewing.interestRate)}%`},
                  {l:"Period",v:`${viewing.repaymentPeriod}d`},
                  {l:"Total Due",v:`Tsh ${Number(viewing.totalAmount).toLocaleString()}`},
                ].map(({l,v})=><div key={l}><p className="text-orange-400 font-bold text-base">{v}</p><p className="text-zinc-400 text-xs mt-0.5">{l}</p></div>)}
              </div>
              <div>
                <h3 className="section-header">Borrower</h3>
                <div className="bg-zinc-50 rounded-xl p-3">
                  <Row label="Name" value={`${viewing.borrower?.firstName} ${viewing.borrower?.lastName}`}/>
                  <Row label="Phone" value={viewing.borrower?.phone}/>
                  <Row label="NIN" value={viewing.borrowerProfile?.nin}/>
                  <Row label="Region" value={viewing.borrowerProfile?.region}/>
                  <Row label="Address" value={viewing.borrowerProfile?.address}/>
                  <Row label="Business" value={viewing.borrowerProfile?.businessName}/>
                </div>
              </div>
              {viewing.status==="PENDING"&&(
                <div>
                  <label className="label">Notes (optional)</label>
                  <textarea value={notes[viewing.id]||""} onChange={e=>setNotes(n=>({...n,[viewing.id]:e.target.value}))} rows={2} className="input-field" placeholder="Review notes..."/>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-zinc-200">
              {viewing.status==="PENDING"?(
                <div className="flex gap-3">
                  <button onClick={()=>action(viewing.id,"APPROVED")} disabled={busy===viewing.id} className="btn-success flex-1 py-3 flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5"/> {busy===viewing.id?"Processing...":"Approve"}
                  </button>
                  <button onClick={()=>action(viewing.id,"REJECTED")} disabled={busy===viewing.id} className="btn-danger flex-1 py-3 flex items-center justify-center gap-2">
                    <XCircle className="w-5 h-5"/> {busy===viewing.id?"...":"Reject"}
                  </button>
                  <button onClick={()=>setViewing(null)} className="btn-secondary px-5">Cancel</button>
                </div>
              ):(
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">{badge(viewing.status)}<span className="text-zinc-500 text-sm">No further action</span></div>
                  <button onClick={()=>setViewing(null)} className="btn-secondary">Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/*  INSTALLMENT PAYMENT MODAL  */}
      {repayModal&&(
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-8 animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-zinc-200">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Record Payment</h2>
                <p className="text-zinc-500 text-sm">{repayModal.borrower?.firstName} {repayModal.borrower?.lastName}</p>
              </div>
              <button onClick={()=>setRepayModal(null)} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                <X className="w-4 h-4"/>
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Debt summary */}
              {(()=>{
                const totalPaid=repayments.reduce((s:number,r:any)=>s+Number(r.amount),0);
                const remaining=Math.max(0,Number(repayModal.totalAmount)-totalPaid);
                return(
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Total Debt</p>
                      <p className="text-sm font-bold text-zinc-800 mt-0.5">Tsh {Number(repayModal.totalAmount).toLocaleString()}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Paid So Far</p>
                      <p className="text-sm font-bold text-emerald-700 mt-0.5">Tsh {totalPaid.toLocaleString()}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">Remaining</p>
                      <p className="text-sm font-bold text-amber-700 mt-0.5">Tsh {remaining.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })()}
              {/* Payment history */}
              {repayments.length>0&&(
                <div className="bg-zinc-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Payment History</p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {repayments.map((r:any)=>(
                      <div key={r.id} className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500 text-xs">{new Date(r.paidDate||r.createdAt).toLocaleString()}</span>
                        <span className="font-semibold text-emerald-600">+Tsh {Number(r.amount).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Entry form */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Amount (Tsh)</label>
                    <input type="number" value={repayAmount} onChange={e=>setRepayAmount(e.target.value)} className="input-field" placeholder="e.g. 50000" min={1}/>
                  </div>
                  <div>
                    <label className="label">Date Paid</label>
                    <input type="date" value={repayDate} onChange={e=>setRepayDate(e.target.value)} className="input-field"/>
                  </div>
                </div>
                <div>
                  <label className="label">Notes (optional)</label>
                  <input value={repayNotes} onChange={e=>setRepayNotes(e.target.value)} className="input-field" placeholder="e.g. M-Pesa ref, cash..."/>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-zinc-200 flex gap-3">
              <button onClick={submitRepayment} disabled={repayBusy||!repayAmount} className="btn-primary flex-1 py-2.5">
                {repayBusy?"Saving...":"Record Payment"}
              </button>
              <button onClick={()=>setRepayModal(null)} className="btn-secondary px-6">Close</button>
            </div>
          </div>
        </div>
      )}

      {(showDocuments&&viewing)&&(
        <DocumentManagement loanId={viewing.id} onClose={()=>setShowDocuments(false)}/>
      )}
    </Layout>
  );
}