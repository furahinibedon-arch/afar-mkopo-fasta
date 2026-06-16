"use client";
import{useEffect,useState}from"react";
import{useRouter}from"next/navigation";
import Layout from"@/components/Layout";
import{getAllLoans,updateLoanStatus}from"@/lib/api";
import{useLanguage}from"@/context/LanguageContext";
import{generateLoanApplicationPDF}from"@/lib/pdfGenerator";
import DocumentManagement from '@/components/DocumentManagement';
import { Printer, FileText, X, CheckCircle, XCircle } from 'lucide-react';

export default function StaffPortal(){
  const router=useRouter();
  const{t}=useLanguage();
  const[loans,setLoans]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[err,setErr]=useState<string|null>(null);
  const[notes,setNotes]=useState<Record<string,string>>({});
  const[busy,setBusy]=useState<string|null>(null);
  const[viewing,setViewing]=useState<any|null>(null);
  const[showDocuments,setShowDocuments]=useState(false);

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
    finally{setBusy(null);}};
  const handlePrint=(loan:any)=>{
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

  const pending=loans.filter(l=>l.status==="PENDING");
  const reviewed=loans.filter(l=>l.status!=="PENDING");

  const badge=(s:string)=><span className={`badge-${s.toLowerCase()}`}>{s}</span>;

  const Row=({label,value}:{label:string;value:any})=>(
    <div className="flex gap-2 py-1.5 border-b border-dark-100 last:border-0">
      <span className="text-xs font-semibold text-dark-400 uppercase w-40 shrink-0">{label}</span>
      <span className="text-sm text-dark-800 font-medium">{value||<span className="text-dark-300 italic"></span>}</span>
    </div>
  );

  return(
    <Layout portal="staff">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-dark-800">{t.loanQueue}</h1>
        <p className="text-dark-500 mt-1">{t.reviewProcess}</p>
      </div>

      {err&&<div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"> {err}</div>}

      {loading?<div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"/></div>:<>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[{l:t.pendingReview,v:pending.length,c:"border-amber-400"},{l:t.reviewed,v:reviewed.length,c:"border-emerald-400"},{l:t.total,v:loans.length,c:"border-primary-400"}].map(({l,v,c})=>(
            <div key={l} className={`card border-l-4 ${c}`}><p className="text-xs font-semibold text-dark-500 uppercase tracking-wide">{l}</p><p className="text-3xl font-black text-dark-800 mt-1">{v}</p></div>
          ))}
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-black text-dark-800 mb-4">{t.pendingReview} ({pending.length})</h2>
          {pending.length===0?<p className="text-dark-400 text-center py-8">{t.noPending}</p>:
          <div className="space-y-3">
            {pending.map((loan:any)=>(
              <div key={loan.id} className="border border-dark-200 rounded-xl p-4 hover:border-primary-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-dark-800 text-lg">{loan.borrower?.firstName} {loan.borrower?.lastName}</span>
                      <span className="badge-pending">PENDING</span>
                    </div>
                    <div className="flex gap-4 text-sm text-dark-500">
                      <span> {loan.borrower?.phone}</span>
                      <span> Tsh {Number(loan.amount).toLocaleString()}</span>
                      <span> {new Date(loan.createdAt).toLocaleDateString()}</span>
                    </div>
                    {loan.purpose&&<p className="text-xs text-dark-400 mt-1 italic">"{loan.purpose}"</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>handlePrint(loan)} className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
                      <Printer className="w-4 h-4" /> Print
                    </button>
                    <button onClick={()=>setViewing(loan)} className="btn-primary text-sm py-2 px-4"> View & Decide</button>
                  </div>
                </div>
              </div>
            ))}
          </div>}
        </div>

        <div className="card">
          <h2 className="text-lg font-black text-dark-800 mb-4">{t.reviewed} ({reviewed.length})</h2>
          {reviewed.length===0?<p className="text-dark-400 text-center py-8">{t.noneYet}</p>:
          <div className="space-y-2">
            {reviewed.map((loan:any)=>(
              <div key={loan.id} className="flex items-center justify-between py-3 border-b border-dark-100 last:border-0">
                <div>
                  <p className="font-semibold text-dark-800">{loan.borrower?.firstName} {loan.borrower?.lastName}</p>
                  <p className="text-xs text-dark-400">Tsh {Number(loan.amount).toLocaleString()} &bull; {new Date(loan.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {badge(loan.status)}
                  <button onClick={()=>handlePrint(loan)} className="btn-secondary text-xs py-1 px-2 flex items-center gap-1">
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                  <button onClick={()=>setViewing(loan)} className="text-xs text-dark-400 hover:text-dark-800 underline">View</button>
                </div>
              </div>
            ))}
          </div>}
        </div>
      </>}

      {viewing&&(
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-dark-200">
              <div>
                <h2 className="text-xl font-black text-dark-800">Loan Application Details</h2>
                <p className="text-dark-500 text-sm mt-0.5">{viewing.borrower?.firstName} {viewing.borrower?.lastName}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>setShowDocuments(true)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Documents
                </button>
                <button onClick={()=>handlePrint(viewing)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button onClick={()=>setViewing(null)} className="w-8 h-8 rounded-full bg-dark-100 hover:bg-dark-200 flex items-center justify-center text-dark-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-dark-800 rounded-2xl p-5 text-white">
                <p className="text-xs font-semibold text-dark-300 mb-3 uppercase tracking-wide">Loan Summary</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  {[
                    {l:"Amount",v:`Tsh ${Number(viewing.amount).toLocaleString()}`},
                    {l:"Interest",v:`${Number(viewing.interestRate)}%`},
                    {l:"Period",v:`${viewing.repaymentPeriod} ${viewing.applicationData?.repaymentType === "DAILY" ? "days" : viewing.applicationData?.repaymentType === "WEEKLY" ? "weeks" : "month"}`},
                    {l:"Total",v:`Tsh ${Number(viewing.totalAmount).toLocaleString()}`},
                  ].map(({l,v})=><div key={l}><p className="text-brand-400 font-black text-lg">{v}</p><p className="text-dark-300 text-xs mt-0.5">{l}</p></div>)}
                </div>
              </div>

              {Object.keys(viewing.applicationData||{}).length===0&&(
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm">
                  This loan was submitted before the full form system was enabled. Only basic info is available below.
                </div>
              )}
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

              {(viewing.applicationData?.businessName||viewing.purpose)&&<div>
                <h3 className="text-sm font-black text-dark-500 uppercase tracking-wide mb-3">02. Business Information</h3>
                <div className="bg-dark-50 rounded-xl p-4">
                  <Row label="Business Name" value={viewing.borrowerProfile?.businessName || viewing.applicationData?.businessName} />
                  <Row label="Location" value={viewing.borrowerProfile?.businessLocation || viewing.applicationData?.businessLocation} />
                  <Row label="Since" value={viewing.borrowerProfile?.businessSince || viewing.applicationData?.businessSince} />
                  <Row label="Loan Purpose" value={viewing.purpose||viewing.applicationData?.loanPurpose} />
                </div>
              </div>}

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

              {viewing.status==="PENDING"&&<div>
                <label className="label">Notes / Maelezo (optional)</label>
                <textarea value={notes[viewing.id]||""} onChange={e=>setNotes(n=>({...n,[viewing.id]:e.target.value}))} rows={3} className="input-field" placeholder="Add review notes..."/>
              </div>}
            </div>

            <div className="p-6 border-t border-dark-200">
              {viewing.status==="PENDING"?(
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-dark-400 uppercase tracking-widest text-center">Select Decision / Chagua Uamuzi</p>
                  <div className="flex gap-3">
                    <button
                      onClick={()=>action(viewing.id,"APPROVED")}
                      disabled={busy===viewing.id}
                      className="btn-success flex-1 py-4 flex flex-col items-center gap-1.5"
                    >
                      <CheckCircle className="w-7 h-7" />
                      <span className="font-black text-sm">{busy===viewing.id?"Processing...":"APPROVE"}</span>
                      <span className="text-xs opacity-75 font-normal">Mkopo Umekubaliwa</span>
                    </button>
                    <button
                      onClick={()=>action(viewing.id,"REJECTED")}
                      disabled={busy===viewing.id}
                      className="btn-danger flex-1 py-4 flex flex-col items-center gap-1.5"
                    >
                      <XCircle className="w-7 h-7" />
                      <span className="font-black text-sm">{busy===viewing.id?"Processing...":"REJECT"}</span>
                      <span className="text-xs opacity-75 font-normal">Mkopo Umekataliwa</span>
                    </button>
                    <button onClick={()=>setViewing(null)} className="btn-secondary px-5 py-4 flex flex-col items-center gap-1.5">
                      <X className="w-5 h-5" />
                      <span className="text-xs">Cancel</span>
                    </button>
                  </div>
                </div>
              ):(
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">{badge(viewing.status)}<span className="text-dark-500 text-sm">Decision already made</span></div>
                  <button onClick={()=>setViewing(null)} className="btn-secondary">Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {(showDocuments && viewing) && (
        <DocumentManagement
          loanId={viewing.id}
          onClose={()=>setShowDocuments(false)}
        />
      )}
    </Layout>
  );
}
