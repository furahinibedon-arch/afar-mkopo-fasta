"use client";
import{useEffect,useState}from"react";
import{useRouter}from"next/navigation";
import Layout from"@/components/Layout";
import{useLanguage}from"@/context/LanguageContext";
import{getAnalytics}from"@/lib/api";
function fmt(n:number){return new Intl.NumberFormat('en-TZ',{style:'currency',currency:'TZS',minimumFractionDigits:0}).format(n);}
export default function AdminDashboard(){
  const{t}=useLanguage();
  const router=useRouter();
  const[data,setData]=useState<any>(null);
  const[loading,setLoading]=useState(true);
  const[err,setErr]=useState<string|null>(null);
  const[refreshKey,setRefreshKey]=useState(0);

  useEffect(()=>{
    const u=localStorage.getItem("user");
    if(!u){router.push("/");return;}
    const role=JSON.parse(u).role;
    if(!["ADMIN", "DIRECTOR", "CEO"].includes(role)){router.push(role==="LOAN_OFFICER"?"/staff":"/borrower");return;}
    getAnalytics().then(setData).catch((e:any)=>setErr(e.message)).finally(()=>setLoading(false));
  },[router, refreshKey]);

  useEffect(() => {
    const handleFocus = () => setRefreshKey(k => k + 1);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const badge=(s:string)=><span className={`badge-${s.toLowerCase()}`}>{s}</span>;
  if(loading)return<Layout portal="admin"><div className="flex items-center justify-center py-32"><div className="w-10 h-10 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"/></div></Layout>;
  if(err)return<Layout portal="admin"><div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl"> {err}</div></Layout>;
  const disbursed=Number(data?.totalDisbursed||0),repaid=Number(data?.totalRepaid||0),balance=disbursed-repaid;
  const companyBalance=Number(data?.companyBalance||0);
  const interest=disbursed*0.2,loans:any[]=data?.loans||[];
  const pending=loans.filter((l:any)=>l.status==="PENDING").length;
  const active=loans.filter((l:any)=>["DISBURSED","APPROVED"].includes(l.status)).length;
  const overdue:any[]=data?.overdueRepayments||[];
  return(<Layout portal="admin">
    <div className="mb-8"><h1 className="text-3xl font-black text-dark-800">Management Dashboard</h1><p className="text-dark-500 mt-1">Financial overview & analytics.</p></div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[
        {l:"Company Balance",v:fmt(companyBalance),c:"text-primary-600",bg:"bg-primary-50"},
        {l:t.totalDisbursed,v:fmt(disbursed),c:"text-dark-800",bg:"bg-dark-50"},
        {l:t.totalRepaid,v:fmt(repaid),c:"text-emerald-600",bg:"bg-emerald-50"},
        {l:t.outstandingBalance,v:fmt(balance),c:"text-brand-600",bg:"bg-brand-50"},
      ].map(({l,v,c,bg})=>(
        <div key={l} className="card group">
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform`}></div>
          <p className="label">{l}</p>
          <p className={`text-2xl font-black ${c}`}>{v}</p>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[{l:t.totalLoans,v:loans.length,c:"text-dark-800"},{l:t.pending,v:pending,c:"text-amber-600"},{l:t.active,v:active,c:"text-emerald-600"},{l:t.overduePayments,v:overdue.length,c:"text-red-600"}].map(({l,v,c})=>(
        <div key={l} className="card text-center"><p className="label">{l}</p><p className={`text-4xl font-black mt-1 ${c}`}>{v}</p></div>
      ))}
    </div>
    <div className="card mb-6 overflow-hidden">
      <h2 className="text-xl font-black text-dark-800 mb-4">Individual Debtor Ledger</h2>
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead><tr className="border-b border-dark-200">{["Borrower","Amount","Rate","Period","Total","Status","Applied"].map(h=><th key={h} className="text-left py-3 px-2 text-xs font-semibold text-dark-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
        <tbody>{loans.map((loan:any)=>(
          <tr key={loan.id} className="border-b border-dark-100 hover:bg-dark-50 transition-colors">
            <td className="py-3 px-2 font-semibold text-dark-800">{loan.borrower?.firstName} {loan.borrower?.lastName}</td>
            <td className="py-3 px-2 font-bold">Tsh {Number(loan.amount).toLocaleString()}</td>
            <td className="py-3 px-2">{Number(loan.interestRate)}%</td>
            <td className="py-3 px-2">{loan.repaymentPeriod}d</td>
            <td className="py-3 px-2 font-bold text-brand-600">Tsh {Number(loan.totalAmount).toLocaleString()}</td>
            <td className="py-3 px-2">{badge(loan.status)}</td>
            <td className="py-3 px-2 text-dark-400">{new Date(loan.createdAt).toLocaleDateString()}</td>
          </tr>
        ))}</tbody>
      </table></div>
    </div>
    <div className="card"><h2 className="text-xl font-black text-dark-800 mb-4">Profit & Loss Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-2xl p-5"><p className="label text-emerald-700">Expected Interest</p><p className="text-2xl font-black text-emerald-800 mt-1">{fmt(interest)}</p></div>
        <div className="bg-red-50 rounded-2xl p-5"><p className="label text-red-700">Overdue Exposure</p><p className="text-2xl font-black text-red-800 mt-1">{overdue.length} repayments</p></div>
        <div className="bg-primary-50 rounded-2xl p-5"><p className="label text-primary-700">Net Position</p><p className="text-2xl font-black text-primary-800 mt-1">{fmt(repaid-disbursed+interest)}</p></div>
      </div>
    </div>
  </Layout>);
}
