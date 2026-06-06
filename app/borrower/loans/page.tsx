"use client";
import{useEffect,useState}from"react";
import{useRouter}from"next/navigation";
import Layout from"@/components/Layout";
import{useLanguage}from"@/context/LanguageContext";
import{getMyLoans}from"@/lib/api";
export default function MyLoans(){
  const router=useRouter(),{t}=useLanguage();
  const[loans,setLoans]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[err,setErr]=useState<string|null>(null);
  useEffect(()=>{if(!localStorage.getItem("token")){router.push("/");return;}getMyLoans().then(setLoans).catch((e:any)=>setErr(e.message)).finally(()=>setLoading(false));},[router]);
  const badge=(s:string)=><span className={`badge-${s.toLowerCase()}`}>{s}</span>;
  return(<Layout portal="borrower">
    <div className="mb-8"><h1 className="text-3xl font-black text-navy-800">{t.myLoans}</h1></div>
    {loading&&<div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"/></div>}
    {err&&<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4"> {err}</div>}
    {!loading&&!err&&loans.length===0&&<div className="card text-center py-16"><p className="text-slate-400 text-lg mb-4">{t.noLoansYet}</p><a href="/borrower" className="btn-primary">{t.applyNow}</a></div>}
    <div className="space-y-4">
      {loans.map((loan:any)=>{
        const appData=loan.applicationData||{};
        const isRejected=loan.status==="REJECTED";
        const isApproved=loan.status==="APPROVED"||loan.status==="DISBURSED";
        return(
          <div key={loan.id} className={`card-hover border-l-4 ${isRejected?"border-red-400":isApproved?"border-emerald-400":"border-amber-400"}`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {badge(loan.status)}
                  <span className="text-xs text-slate-400">{t.appliedOn} {new Date(loan.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-2xl font-black text-navy-800">Tsh {Number(loan.amount).toLocaleString()}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 text-sm text-slate-500">
                  <div><p className="label text-xs">Interest</p><p className="font-bold text-navy-800">{Number(loan.interestRate)}%</p></div>
                  <div><p className="label text-xs">Period</p><p className="font-bold text-navy-800">{loan.repaymentPeriod} {loan.repaymentPeriod===30?"days":loan.repaymentPeriod===4?"weeks":"month"}</p></div>
                  <div><p className="label text-xs">Total</p><p className="font-bold text-brand-600">Tsh {Number(loan.totalAmount).toLocaleString()}</p></div>
                  {appData.repaymentType&&<div><p className="label text-xs">Repayment</p><p className="font-bold text-navy-800">{appData.repaymentType}</p></div>}
                  {appData.collateral&&<div className="col-span-2"><p className="label text-xs">Collateral</p><p className="font-medium text-navy-800 text-xs">{appData.collateral}</p></div>}
                  {loan.purpose&&<div className="col-span-2 sm:col-span-3"><p className="label text-xs">Purpose</p><p className="text-navy-800 text-xs">{loan.purpose}</p></div>}
                </div>
                {/* Show rejection reason prominently */}
                {isRejected&&appData.rejectionReason&&(
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1"> Reason for Rejection</p>
                    <p className="text-red-700 text-sm">{appData.rejectionReason}</p>
                  </div>
                )}
                {isRejected&&!appData.rejectionReason&&(
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-600 text-sm">Your application was rejected. Please contact us for more details.</p>
                  </div>
                )}
                {isApproved&&(
                  <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                    <p className="text-emerald-700 text-sm font-semibold"> {loan.status==="DISBURSED"?"Your loan has been disbursed. Please make your repayments on time.":"Your loan is approved. Awaiting disbursement."}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </Layout>);
}