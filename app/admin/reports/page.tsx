"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { getUsers } from "@/lib/api";
import { BarChart3, Users, UserCheck, Download, Search, Filter, FileText, Calendar, FileBarChart2, CheckCircle, XCircle, Clock } from "lucide-react";
import { generateLoansReportPDF } from "@/lib/pdfGenerator";
import { generateCompanyReportPDF, generateClientReportPDF, generateOfficerReportPDF } from "@/lib/reportFn";

const BASE = process.env.NEXT_PUBLIC_API_URL || "";
const CY = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CY - i);
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const QUARTERS = ["Q1 (Jan-Mar)","Q2 (Apr-Jun)","Q3 (Jul-Sep)","Q4 (Oct-Dec)"];

function fmt(n) {
  return new Intl.NumberFormat("en-TZ",{style:"currency",currency:"TZS",minimumFractionDigits:0,notation:n>=1_000_000?"compact":"standard",compactDisplay:"short"}).format(n);
}
function SummaryCard({label,value,sub,color}:{label:any;value:any;sub?:any;color:any}) {
  return <div className={"bg-white rounded-xl border-l-4 "+color+" shadow-sm p-4"}><p className="text-xs font-semibold text-dark-400 uppercase tracking-wide">{label}</p><p className="text-2xl font-black text-dark-800 mt-1">{value}</p>{sub&&<p className="text-xs text-dark-400 mt-0.5">{sub}</p>}</div>;
}
function Badge({status}:{status:string}) {
  const m:any = {PENDING:"badge-pending",APPROVED:"badge-approved",REJECTED:"badge-rejected",DISBURSED:"badge-disbursed",REPAID:"badge-repaid",DEFAULTED:"badge-rejected"};
  return <span className={m[status]||"badge-pending"}>{status}</span>;
}
function PeriodSelector({period,setPeriod,year,setYear,month,setMonth,quarter,setQuarter}:any) {
  return (
    <div className="flex flex-wrap gap-2 items-end">
      <div><label className="label mb-1">Period</label>
        <select value={period} onChange={e=>setPeriod(e.target.value)} className="input-field py-1.5 text-sm">
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select></div>
      <div><label className="label mb-1">Year</label>
        <select value={year} onChange={e=>setYear(e.target.value)} className="input-field py-1.5 text-sm">
          {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
        </select></div>
      {period==="monthly"&&<div><label className="label mb-1">Month</label>
        <select value={month} onChange={e=>setMonth(e.target.value)} className="input-field py-1.5 text-sm">
          {MONTHS.map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
        </select></div>}
      {period==="quarterly"&&<div><label className="label mb-1">Quarter</label>
        <select value={quarter} onChange={e=>setQuarter(e.target.value)} className="input-field py-1.5 text-sm">
          {QUARTERS.map((q,i)=><option key={i+1} value={i+1}>{q}</option>)}
        </select></div>}
    </div>
  );
}

export default function ReportsPage() {
  const router = useRouter();
  const [tab, setTab] = useState("loans");
  const [period, setPeriod] = useState("yearly");
  const [year, setYear] = useState(String(CY));
  const [month, setMonth] = useState(String(new Date().getMonth()+1));
  const [quarter, setQuarter] = useState("1");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");

  useEffect(()=>{
    const u=localStorage.getItem("user");
    if(!u){router.push("/");return;}
    const role=JSON.parse(u).role;
    if(!["ADMIN","CEO","DIRECTOR"].includes(role)){router.push("/admin");return;}
    getUsers().then(setUsers).catch(console.error);
  },[router]);

  const borrowers = users.filter(u=>u.role==="BORROWER");
  const officers  = users.filter(u=>["LOAN_OFFICER","ADMIN"].includes(u.role));

  function buildUrl(){
    const p=new URLSearchParams({type:tab,period,year});
    if(period==="monthly") p.set("month",month);
    if(period==="quarterly") p.set("quarter",quarter);
    if(tab!=="loans"&&selectedId) p.set("id",selectedId);
    return BASE+"/api/reports?"+p.toString();
  }

  async function run(){
    if(tab!=="loans"&&tab!=="company"&&!selectedId){alert("Please select a client or officer first.");return;}
    setLoading(true);setData(null);
    const token=localStorage.getItem("token");
    try{
      const r=await fetch(buildUrl(),{headers:{Authorization:"Bearer "+token}});
      const d=await r.json();
      if(!r.ok) throw new Error(d.error);
      setData(d);
    } catch(e:any){alert(e.message);}
    finally{setLoading(false);}
  }

  function periodLabel(){
    if(period==="monthly") return MONTHS[parseInt(month)-1]+" "+year;
    if(period==="quarterly") return QUARTERS[parseInt(quarter)-1]+" "+year;
    return "Year "+year;
  }

  function exportPDF(){
    if(!data) return;
    const token=localStorage.getItem("token");
    const period=periodLabel();
    const generatedAt=new Date().toLocaleString();
    if(tab==="company"){
      fetch(BASE+"/api/admin/balance",{headers:{Authorization:"Bearer "+token}})
        .then(r=>r.json())
        .then(logs=>{
          const arr=Array.isArray(logs)?logs:[];
          const bal=arr.filter((l:any)=>l.type==="CREDIT").reduce((s:number,l:any)=>s+Number(l.amount),0)
                   -arr.filter((l:any)=>l.type==="DEBIT").reduce((s:number,l:any)=>s+Number(l.amount),0);
          generateCompanyReportPDF({loans:data.loans||[],financialLogs:arr,period,generatedAt,companyBalance:bal});
        });
    } else if(tab==="client"){
      generateClientReportPDF({borrower:data.borrower,loans:data.loans||[],summary:data.summary,period,generatedAt});
    } else if(tab==="officer"){
      generateOfficerReportPDF({officer:data.officer,loans:data.loans||[],actions:data.actions||[],summary:data.summary,period,generatedAt});
    } else {
      generateLoansReportPDF({loans:filteredLoans,period,generatedAt});
    }
  }

  const filteredLoans=(data?.loans||[]).filter((l:any)=>{
    if(!search) return true;
    const q=search.toLowerCase();
    return (l.borrower?.firstName+" "+l.borrower?.lastName).toLowerCase().includes(q)||l.status.toLowerCase().includes(q)||String(l.amount).includes(q);
  });

  const tabs=[
    {id:"loans",   label:"Loans Report",   icon:BarChart3},
    {id:"client",  label:"Client Report",  icon:Users},
    {id:"officer", label:"Officer Report", icon:UserCheck},
    {id:"company", label:"Company Report", icon:FileBarChart2},
  ];

  return (
    <Layout portal="admin">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="page-title">Reports</h1><p className="page-subtitle">Generate detailed loan, client, officer and company reports</p></div>
        {data&&<button onClick={exportPDF} className="btn-primary flex items-center gap-2"><Download className="w-4 h-4"/>Download PDF</button>}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl mb-6 w-fit">
        {tabs.map(({id,label,icon:Icon})=>(
          <button key={id} onClick={()=>{setTab(id);setData(null);setSelectedId("");}}
            className={"flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all "+(tab===id?"bg-white text-zinc-800 shadow-sm":"text-zinc-500 hover:text-zinc-700")}>
            <Icon className="w-4 h-4"/>{label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <PeriodSelector period={period} setPeriod={setPeriod} year={year} setYear={setYear} month={month} setMonth={setMonth} quarter={quarter} setQuarter={setQuarter}/>
          {tab==="client"&&<div><label className="label mb-1">Select Client</label>
            <select value={selectedId} onChange={e=>setSelectedId(e.target.value)} className="input-field py-1.5 text-sm min-w-56">
              <option value="">-- Choose borrower --</option>
              {borrowers.map((b:any)=><option key={b.id} value={b.id}>{b.firstName} {b.lastName} ({b.phone})</option>)}
            </select></div>}
          {tab==="officer"&&<div><label className="label mb-1">Select Officer</label>
            <select value={selectedId} onChange={e=>setSelectedId(e.target.value)} className="input-field py-1.5 text-sm min-w-56">
              <option value="">-- Choose officer --</option>
              {officers.map((o:any)=><option key={o.id} value={o.id}>{o.firstName} {o.lastName} ({o.role.replace("_"," ")})</option>)}
            </select></div>}
          <button onClick={run} disabled={loading} className="btn-primary px-6 py-2 flex items-center gap-2">
            <Filter className="w-4 h-4"/>{loading?"Generating...":"Generate Report"}
          </button>
        </div>
      </div>

      {/* Results */}
      {data&&(
        <div className="space-y-6">
          <div className="flex items-center gap-3 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3">
            <Calendar className="w-5 h-5 text-sky-600 shrink-0"/>
            <div>
              <p className="text-sm font-bold text-sky-800">
                {tab==="loans"?"Loans Report":tab==="client"?"Client: "+data.borrower?.firstName+" "+data.borrower?.lastName:tab==="company"?"Company Financial Report":"Officer: "+data.officer?.firstName+" "+data.officer?.lastName}
              </p>
              <p className="text-xs text-sky-600">{periodLabel()}</p>
            </div>
          </div>

          {/* Loans tab */}
          {tab==="loans"&&<>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryCard label="Total Loans"  value={data.summary.total}                   color="border-sky-400"/>
              <SummaryCard label="Total Amount" value={fmt(data.summary.totalAmount)}         color="border-violet-400"/>
              <SummaryCard label="Disbursed"    value={fmt(data.summary.totalDisbursed)}      color="border-emerald-400"/>
              <SummaryCard label="Repaid"       value={fmt(data.summary.totalRepaid)}         color="border-amber-400"/>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {(Object.entries(data.summary.byStatus||{}) as [string,number][]).map(([s,c])=>(
                <div key={s} className="bg-white rounded-xl p-3 text-center shadow-sm border border-zinc-100">
                  <p className="text-xl font-black text-zinc-800">{c}</p><Badge status={s}/>
                </div>
              ))}
            </div>
          </>}

          {/* Client tab */}
          {tab==="client"&&data.borrower&&<>
            <div className="card p-4 flex flex-wrap gap-6">
              <div>
                <p className="text-xs text-zinc-400 uppercase font-semibold">Client</p>
                <p className="font-black text-zinc-800 text-lg">{data.borrower.firstName} {data.borrower.lastName}</p>
                <p className="text-sm text-zinc-500">{data.borrower.phone}  {data.borrower.email}</p>
              </div>
              {data.borrower.borrowerProfile&&<div>
                <p className="text-xs text-zinc-400 uppercase font-semibold">Profile</p>
                <p className="text-sm text-zinc-600">NIN: {data.borrower.borrowerProfile.nin||"-"}</p>
                <p className="text-sm text-zinc-600">{data.borrower.borrowerProfile.region||""} {data.borrower.borrowerProfile.district||""}</p>
                <p className="text-sm text-zinc-600">{data.borrower.borrowerProfile.businessName||""}</p>
              </div>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryCard label="Total Loans"   value={data.summary.total}               color="border-sky-400"/>
              <SummaryCard label="Total Borrowed" value={fmt(data.summary.totalBorrowed)} color="border-violet-400"/>
              <SummaryCard label="Total Repaid (Instalments)" value={fmt(data.summary.totalRepaid)}    color="border-emerald-400" sub="From actual payments recorded"/>
              <SummaryCard label="Balance Remaining"         value={fmt(data.summary.outstanding)}    color="border-red-400"     sub="After deducting instalments"/>
            </div>
          </>}

          {/* Company tab */}
          {tab==="company"&&<>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryCard label="Total Loans"   value={data.summary?.total||0}                       color="border-sky-400"/>
              <SummaryCard label="Disbursed"     value={fmt(data.summary?.totalDisbursed||0)}         color="border-violet-400"/>
              <SummaryCard label="Repaid"        value={fmt(data.summary?.totalRepaid||0)}            color="border-emerald-400"/>
              <SummaryCard label="Active"        value={data.summary?.byStatus?.DISBURSED||0}         color="border-amber-400"/>
            </div>
            <div className="card p-5 text-center">
              <FileBarChart2 className="w-10 h-10 text-sky-400 mx-auto mb-3"/>
              <p className="font-bold text-zinc-800 mb-1">Click <strong>Download PDF</strong> to get the full Company Financial Report</p>
              <p className="text-sm text-zinc-500">3-page PDF: Cover KPIs  Profit & Loss table  Full loan portfolio for {periodLabel()}</p>
            </div>
          </>}

          {/* Officer tab */}
          {tab==="officer"&&data.officer&&<>
            <div className="card p-4">
              <p className="text-xs text-zinc-400 uppercase font-semibold">Officer</p>
              <p className="font-black text-zinc-800 text-lg">{data.officer.firstName} {data.officer.lastName}</p>
              <p className="text-sm text-zinc-500">{data.officer.phone}  {data.officer.role.replace("_"," ")}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryCard label="Loans Handled" value={data.summary.totalLoans}       color="border-sky-400"/>
              <SummaryCard label="Total Value"   value={fmt(data.summary.totalValue)}  color="border-violet-400"/>
              <SummaryCard label="Approved"      value={data.summary.approved}         color="border-emerald-400" sub="decisions"/>
              <SummaryCard label="Rejected"      value={data.summary.rejected}         color="border-red-400"     sub="decisions"/>
            </div>
          </>}

          {/* Search bar */}
          {filteredLoans.length>0&&<div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-zinc-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, status, amount..." className="input-field py-1.5 text-sm max-w-xs"/>
          </div>}

          {/* Loans table */}
          {(tab==="loans"||tab==="client")&&<div className="card overflow-x-auto p-0">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100">
              <FileText className="w-4 h-4 text-zinc-400"/>
              <span className="font-semibold text-zinc-800 text-sm">{tab==="loans"?"All Loans ("+filteredLoans.length+")":"Loan History ("+filteredLoans.length+")"}</span>
            </div>
            <table className="data-table">
              <thead><tr>
                <th>#</th>
                {tab==="loans"&&<th>Client</th>}
                <th>Principal</th><th>Total Due</th><th>Paid</th><th>Remaining</th><th>Rate</th><th>Period</th><th>Status</th><th>Officer</th><th>Date</th>
              </tr></thead>
              <tbody>
                {filteredLoans.length===0&&<tr><td colSpan={10} className="text-center py-12 text-zinc-400">No loans found for this period.</td></tr>}
                {filteredLoans.map((l:any,i:number)=>(
                  <tr key={l.id}>
                    <td className="text-zinc-400 text-xs">{i+1}</td>
                    {tab==="loans"&&<td className="font-semibold text-zinc-800">{l.borrower?.firstName} {l.borrower?.lastName}<br/><span className="text-xs text-zinc-400 font-normal">{l.borrower?.phone}</span></td>}
                    <td className="font-semibold tabular-nums">Tsh {Number(l.amount).toLocaleString()}</td>
                    <td className="font-semibold tabular-nums">Tsh {Number(l.amount).toLocaleString()}</td>
                    <td className="text-sky-700 font-semibold tabular-nums">Tsh {Number(l.totalAmount).toLocaleString()}</td>
                    {(()=>{const paid=(l.repayments||[]).reduce((s:number,r:any)=>s+Number(r.amount),0);const rem=Math.max(0,Number(l.totalAmount)-paid);return(<><td className="text-emerald-600 font-semibold tabular-nums">Tsh {paid.toLocaleString()}</td><td className={`font-semibold tabular-nums ${rem>0?"text-amber-600":"text-zinc-400"}`}>Tsh {rem.toLocaleString()}</td></>);})()} 
                    <td className="text-zinc-500">{l.repaymentPeriod}d</td>
                    <td><Badge status={l.status}/></td>
                    <td className="text-zinc-500 text-xs">{l.staffActions?.[0]?.staff?l.staffActions[0].staff.firstName+" "+l.staffActions[0].staff.lastName:""}</td>
                    <td className="text-zinc-400 text-xs tabular-nums">{new Date(l.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}


          {/* Client instalment timeline */}
          {tab==="client"&&(data.loans||[]).filter((l:any)=>l.repayments&&l.repayments.length>0||(l.status==="DISBURSED"||l.status==="REPAID")).map((l:any)=>{
            const repayments=(l.repayments||[]).slice().sort((a:any,b:any)=>new Date(a.paidDate||a.createdAt).getTime()-new Date(b.paidDate||b.createdAt).getTime());
            const totalPaid=repayments.reduce((s:number,r:any)=>s+Number(r.amount),0);
            const remaining=Math.max(0,Number(l.totalAmount)-totalPaid);
            const pct=Number(l.totalAmount)>0?Math.min(100,Math.round(totalPaid/Number(l.totalAmount)*100)):0;
            const appData=l.applicationData||{};
            const repType=appData.repaymentType||"MONTHLY";
            return(
              <div key={l.id} className="card p-0 overflow-hidden">
                {/* Loan header */}
                <div className={`px-5 py-3 flex items-center justify-between border-b border-zinc-100 ${l.status==="REPAID"?"bg-emerald-50":l.status==="DISBURSED"?"bg-sky-50":"bg-zinc-50"}`}>
                  <div className="flex items-center gap-3">
                    <Badge status={l.status}/>
                    <div>
                      <p className="font-bold text-zinc-800 text-sm">Loan of Tsh {Number(l.amount).toLocaleString()} &mdash; Total Due: Tsh {Number(l.totalAmount).toLocaleString()}</p>
                      <p className="text-xs text-zinc-500">{repType} repayment &bull; Applied: {new Date(l.createdAt).toLocaleDateString()}{l.disbursedAt?` &bull; Disbursed: ${new Date(l.disbursedAt).toLocaleDateString()}`:""}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-400">Progress</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-24 h-2 bg-zinc-200 rounded-full overflow-hidden"><div className={`h-full rounded-full ${pct>=100?"bg-emerald-500":pct>50?"bg-sky-500":"bg-amber-500"}`} style={{width:pct+"%"}}/></div>
                      <span className="text-xs font-bold text-zinc-700">{pct}%</span>
                    </div>
                  </div>
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-3 divide-x divide-zinc-100 border-b border-zinc-100">
                  <div className="px-4 py-2 text-center"><p className="text-[10px] text-zinc-400 uppercase font-semibold">Payments Made</p><p className="font-bold text-emerald-600 text-sm">{repayments.length}</p></div>
                  <div className="px-4 py-2 text-center"><p className="text-[10px] text-zinc-400 uppercase font-semibold">Total Paid</p><p className="font-bold text-emerald-600 text-sm">Tsh {totalPaid.toLocaleString()}</p></div>
                  <div className="px-4 py-2 text-center"><p className="text-[10px] text-zinc-400 uppercase font-semibold">Remaining</p><p className={`font-bold text-sm ${remaining>0?"text-amber-600":"text-zinc-400"}`}>Tsh {remaining.toLocaleString()}</p></div>
                </div>
                {/* Instalment timeline */}
                {repayments.length>0?(
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead><tr><th>#</th><th>Date & Time Paid</th><th>Amount</th><th>Running Total</th><th>Status</th></tr></thead>
                      <tbody>
                        {repayments.map((r:any,i:number)=>{
                          const runTotal=repayments.slice(0,i+1).reduce((s:number,x:any)=>s+Number(x.amount),0);
                          return(
                            <tr key={r.id}>
                              <td className="text-zinc-400 text-xs">{i+1}</td>
                              <td className="text-zinc-600 text-xs font-medium">{new Date(r.paidDate||r.createdAt).toLocaleString("en-TZ",{dateStyle:"medium",timeStyle:"short"})}</td>
                              <td className="font-bold text-emerald-600">+Tsh {Number(r.amount).toLocaleString()}</td>
                              <td className="tabular-nums text-zinc-700 text-xs">Tsh {runTotal.toLocaleString()}<span className="text-zinc-400 ml-1">/ {Number(l.totalAmount).toLocaleString()}</span></td>
                              <td><span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold"><CheckCircle className="w-3.5 h-3.5"/>Paid</span></td>
                            </tr>
                          );
                        })}
                        {remaining>0&&l.status==="DISBURSED"&&(
                          <tr className="bg-amber-50/60">
                            <td className="text-zinc-300 text-xs">-</td>
                            <td className="text-zinc-400 text-xs italic">Balance outstanding</td>
                            <td className="font-bold text-amber-600">Tsh {remaining.toLocaleString()}</td>
                            <td className="text-zinc-400 text-xs">-</td>
                            <td><span className="inline-flex items-center gap-1 text-xs text-amber-600 font-semibold"><Clock className="w-3.5 h-3.5"/>Pending</span></td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ):(
                  <div className="px-5 py-4 text-sm text-zinc-400 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-zinc-300"/>
                    {l.status==="DISBURSED"?"No payments recorded yet — loan is active and awaiting first payment.":"No payment records for this loan."}
                  </div>
                )}
              </div>
            );
          })}
          {/* Officer loans table */}
          {tab==="officer"&&<div className="card overflow-x-auto p-0">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100">
              <UserCheck className="w-4 h-4 text-zinc-400"/>
              <span className="font-semibold text-zinc-800 text-sm">Handled Loans ({data.loans?.length||0})</span>
            </div>
            <table className="data-table">
              <thead><tr>
                <th>#</th><th>Client</th><th>Phone</th><th>Amount</th><th>Status</th><th>Decision</th><th>Date</th>
              </tr></thead>
              <tbody>
                {(data.loans||[]).length===0&&<tr><td colSpan={7} className="text-center py-12 text-zinc-400">No loans handled in this period.</td></tr>}
                {(data.loans||[]).map((l:any,i:number)=>{
                  const action=data.actions?.find((a:any)=>a.loanId===l.id);
                  return (
                    <tr key={l.id}>
                      <td className="text-zinc-400 text-xs">{i+1}</td>
                      <td className="font-semibold text-zinc-800">{l.borrower?.firstName} {l.borrower?.lastName}</td>
                      <td className="text-zinc-500 text-xs">{l.borrower?.phone}</td>
                      <td className="font-semibold tabular-nums">Tsh {Number(l.amount).toLocaleString()}</td>
                      <td><Badge status={l.status}/></td>
                      <td>{action?<Badge status={action.action}/>:""}</td>
                      <td className="text-zinc-400 text-xs tabular-nums">{action?new Date(action.createdAt).toLocaleDateString():""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>}
        </div>
      )}

      {!data&&!loading&&<div className="card text-center py-16">
        <BarChart3 className="w-12 h-12 text-zinc-200 mx-auto mb-4"/>
        <p className="text-zinc-500 font-semibold">Select filters above and click Generate Report</p>
        <p className="text-zinc-400 text-sm mt-1">Monthly, Quarterly and Yearly  Loans, Client, Officer and Company reports</p>
      </div>}
    </Layout>
  );
}
