"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { getUsers } from "@/lib/api";
import { BarChart3, Users, UserCheck, Download, Search, Filter, FileText, Calendar, FileBarChart2 } from "lucide-react";
import { generateLoansReportPDF } from "@/lib/pdfGenerator";
import { generateCompanyReportPDF } from "@/lib/reportFn";

const BASE = process.env.NEXT_PUBLIC_API_URL || "";
const CY = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CY - i);
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const QUARTERS = ["Q1 (Jan-Mar)","Q2 (Apr-Jun)","Q3 (Jul-Sep)","Q4 (Oct-Dec)"];
function fmt(n) { return new Intl.NumberFormat("en-TZ",{style:"currency",currency:"TZS",minimumFractionDigits:0,notation:n>=1_000_000?"compact":"standard",compactDisplay:"short"}).format(n); }
function SummaryCard({label,value,sub,color}:{label:any;value:any;sub?:any;color:any}) {
  return (<div className={"bg-white rounded-xl border-l-4 "+color+" shadow-sm p-4"}><p className="text-xs font-semibold text-dark-400 uppercase tracking-wide">{label}</p><p className="text-2xl font-black text-dark-800 mt-1">{value}</p>{sub&&<p className="text-xs text-dark-400 mt-0.5">{sub}</p>}</div>);
}
function Badge({status}) {
  const m = {PENDING:"badge-pending",APPROVED:"badge-approved",REJECTED:"badge-rejected",DISBURSED:"badge-disbursed",REPAID:"badge-repaid",DEFAULTED:"badge-rejected"};
  return <span className={m[status]||"badge-pending"}>{status}</span>;
}
function PeriodSelector({period,setPeriod,year,setYear,month,setMonth,quarter,setQuarter}) {
  return (
    <div className="flex flex-wrap gap-2 items-end">
      <div><label className="label mb-1">Period</label>
        <select value={period} onChange={e=>setPeriod(e.target.value)} className="input-field py-1.5 text-sm">
          <option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option>
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
  const [tab,setTab] = useState("loans");
  const [period,setPeriod] = useState("yearly");
  const [year,setYear] = useState(String(CY));
  const [month,setMonth] = useState(String(new Date().getMonth()+1));
  const [quarter,setQuarter] = useState("1");
  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(false);
  const [users,setUsers] = useState([]);
  const [selectedId,setSelectedId] = useState("");
  const [search,setSearch] = useState("");
  useEffect(()=>{
    const u=localStorage.getItem("user");
    if(!u){router.push("/");return;}
    const role=JSON.parse(u).role;
    if(!["ADMIN","CEO","DIRECTOR"].includes(role)){router.push("/admin");return;}
    getUsers().then(setUsers).catch(console.error);
  },[router]);
  const borrowers=users.filter(u=>u.role==="BORROWER");
  const officers=users.filter(u=>["LOAN_OFFICER","ADMIN"].includes(u.role));
  function buildUrl(){
    const p=new URLSearchParams({type:tab,period,year});
    if(period==="monthly") p.set("month",month);
    if(period==="quarterly") p.set("quarter",quarter);
    if(tab!=="loans"&&selectedId) p.set("id",selectedId);
    return BASE+"/api/reports?"+p.toString();
  }
  async function run(){
    if(tab!=="loans"&&!selectedId){alert("Please select a client or officer first.");return;}
    setLoading(true);setData(null);
    const token=localStorage.getItem("token");
    try{const r=await fetch(buildUrl(),{headers:{Authorization:"Bearer "+token}});const d=await r.json();if(!r.ok)throw new Error(d.error);setData(d);}
    catch(e){alert(e.message);}finally{setLoading(false);}
  }
  function periodLabel(){
    if(period==="monthly") return MONTHS[parseInt(month)-1]+" "+year;
    if(period==="quarterly") return QUARTERS[parseInt(quarter)-1]+" "+year;
    return "Year "+year;
  }
  const filteredLoans=(data?.loans||[]).filter(l=>{
    if(!search)return true;
    const q=search.toLowerCase();
    return (l.borrower?.firstName+" "+l.borrower?.lastName).toLowerCase().includes(q)||l.status.toLowerCase().includes(q)||String(l.amount).includes(q);
  });
  const tabs=[{id:"loans",label:"Loans Report",icon:BarChart3},{id:"client",label:"Client Report",icon:Users},{id:"officer",label:"Officer Report",icon:UserCheck},{id:"company",label:"Company Report",icon:FileBarChart2}];
  return (
    <Layout portal="admin">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div><h1 className="text-3xl font-black text-dark-800">Reports</h1><p className="text-dark-500 mt-1">Generate detailed loan, client and officer reports</p></div>
        {data&&<button onClick={()=>exportPDF()} className="btn-primary flex items-center gap-2"><Download className="w-4 h-4"/>Download PDF</button>}
      </div>
      <div className="flex gap-1 bg-dark-100 p-1 rounded-xl mb-6 print:hidden w-fit">
        {tabs.map(({id,label,icon:Icon})=>(
          <button key={id} onClick={()=>{setTab(id);setData(null);setSelectedId("");}}
            className={"flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all "+(tab===id?"bg-white text-dark-800 shadow-sm":"text-dark-500 hover:text-dark-700")}>
            <Icon className="w-4 h-4"/>{label}
          </button>
        ))}
      </div>
      <div className="card mb-6 print:hidden">
        <div className="flex flex-wrap gap-4 items-end">
          <PeriodSelector period={period} setPeriod={setPeriod} year={year} setYear={setYear} month={month} setMonth={setMonth} quarter={quarter} setQuarter={setQuarter}/>
          {tab==="client"&&<div><label className="label mb-1">Select Client</label>
            <select value={selectedId} onChange={e=>setSelectedId(e.target.value)} className="input-field py-1.5 text-sm min-w-56">
              <option value="">-- Choose borrower --</option>
              {borrowers.map(b=><option key={b.id} value={b.id}>{b.firstName} {b.lastName} ({b.phone})</option>)}
            </select></div>}
          {tab==="officer"&&<div><label className="label mb-1">Select Officer</label>
            <select value={selectedId} onChange={e=>setSelectedId(e.target.value)} className="input-field py-1.5 text-sm min-w-56">
              <option value="">-- Choose officer --</option>
              {officers.map(o=><option key={o.id} value={o.id}>{o.firstName} {o.lastName} ({o.role.replace("_"," ")})</option>)}
            </select></div>}
          <button onClick={run} disabled={loading} className="btn-primary px-6 py-2 flex items-center gap-2">
            <Filter className="w-4 h-4"/>{loading?"Generating...":"Generate Report"}
          </button>
        </div>
      </div>
      {data&&(
        <div className="space-y-6">
          <div className="hidden print:block mb-6">
            <h1 className="text-2xl font-black text-dark-800">AFAR MKOPO FASTA</h1>
            <p className="text-dark-500">{tab==="loans"?"Loans Report":tab==="client"?"Client Report - "+data.borrower?.firstName+" "+data.borrower?.lastName:"Officer Report - "+data.officer?.firstName+" "+data.officer?.lastName}  {periodLabel()}</p>
            <p className="text-xs text-dark-400 mt-1">Generated: {new Date().toLocaleString()}</p><hr className="mt-3"/>
          </div>
          <div className="flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 print:hidden">
            <Calendar className="w-5 h-5 text-primary-600 shrink-0"/>
            <div>
              <p className="text-sm font-black text-primary-800">{tab==="loans"?"Loans Report":tab==="client"?"Client: "+data.borrower?.firstName+" "+data.borrower?.lastName:"Officer: "+data.officer?.firstName+" "+data.officer?.lastName}</p>
              <p className="text-xs text-primary-600">{periodLabel()}</p>
            </div>
          </div>
          {tab==="loans"&&<>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryCard label="Total Loans" value={data.summary.total} color="border-primary-400"/>
              <SummaryCard label="Total Amount" value={fmt(data.summary.totalAmount)} color="border-violet-400"/>
              <SummaryCard label="Disbursed" value={fmt(data.summary.totalDisbursed)} color="border-emerald-400"/>
              <SummaryCard label="Repaid" value={fmt(data.summary.totalRepaid)} color="border-sky-400"/>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {(Object.entries(data.summary.byStatus||{}) as [string,number][]).map(([s,c])=>(
                <div key={s} className="bg-white rounded-xl p-3 text-center shadow-sm border border-dark-100">
                  <p className="text-xl font-black text-dark-800">{c}</p><Badge status={s}/>
                </div>
              ))}
            </div>
          </>}
          {tab==="client"&&data.borrower&&<>
            <div className="card p-4 flex flex-wrap gap-6">
              <div><p className="text-xs text-dark-400 uppercase font-semibold">Client</p>
                <p className="font-black text-dark-800 text-lg">{data.borrower.firstName} {data.borrower.lastName}</p>
                <p className="text-sm text-dark-500">{data.borrower.phone}  {data.borrower.email}</p>
              </div>
              {data.borrower.borrowerProfile&&<div><p className="text-xs text-dark-400 uppercase font-semibold">Profile</p>
                <p className="text-sm text-dark-600">NIN: {data.borrower.borrowerProfile.nin||""}</p>
                <p className="text-sm text-dark-600">{data.borrower.borrowerProfile.region||""} {data.borrower.borrowerProfile.district||""}</p>
                <p className="text-sm text-dark-600">{data.borrower.borrowerProfile.businessName||""}</p>
              </div>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryCard label="Total Loans" value={data.summary.total} color="border-primary-400"/>
              <SummaryCard label="Total Borrowed" value={fmt(data.summary.totalBorrowed)} color="border-violet-400"/>
              <SummaryCard label="Total Repaid" value={fmt(data.summary.totalRepaid)} color="border-emerald-400"/>
              <SummaryCard label="Outstanding" value={fmt(data.summary.outstanding)} color="border-red-400"/>
            </div>
          </>}

          {tab==="company"&&<>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryCard label="Total Loans" value={data.summary?.total||0} color="border-primary-400"/>
              <SummaryCard label="Total Disbursed" value={fmt(data.summary?.totalDisbursed||0)} color="border-violet-400"/>
              <SummaryCard label="Total Repaid" value={fmt(data.summary?.totalRepaid||0)} color="border-emerald-400"/>
              <SummaryCard label="Active" value={data.summary?.byStatus?.DISBURSED||0} color="border-sky-400"/>
            </div>
            <div className="card p-4 text-center text-dark-500">
              <p className="font-semibold">Click <strong>Download PDF</strong> above to get the full Company Financial Report</p>
              <p className="text-sm mt-1">Includes: P&amp;L summary, capital vs disbursements, interest earned, full loan portfolio</p>
            </div>
          </>}
          {tab==="officer"&&data.officer&&<>
            <div className="card p-4">
              <p className="text-xs text-dark-400 uppercase font-semibold">Officer</p>
              <p className="font-black text-dark-800 text-lg">{data.officer.firstName} {data.officer.lastName}</p>
              <p className="text-sm text-dark-500">{data.officer.phone}  {data.officer.role.replace("_"," ")}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryCard label="Loans Handled" value={data.summary.totalLoans} color="border-primary-400"/>
              <SummaryCard label="Total Value" value={fmt(data.summary.totalValue)} color="border-violet-400"/>
              <SummaryCard label="Approved" value={data.summary.approved} sub="decisions" color="border-emerald-400"/>
              <SummaryCard label="Rejected" value={data.summary.rejected} sub="decisions" color="border-red-400"/>
            </div>
          </>}
          {filteredLoans.length>0&&<div className="flex items-center gap-2 print:hidden">
            <Search className="w-4 h-4 text-dark-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, status, amount..." className="input-field py-1.5 text-sm max-w-xs"/>
          </div>}
          {(tab==="loans"||tab==="client")&&<div className="card overflow-x-auto p-0">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-dark-100">
              <FileText className="w-4 h-4 text-dark-400"/>
              <span className="font-semibold text-dark-800 text-sm">{tab==="loans"?"All Loans ("+filteredLoans.length+")":"Loan History ("+filteredLoans.length+")"}</span>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-dark-100 bg-dark-50">
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500 uppercase">#</th>
                {tab==="loans"&&<th className="text-left py-2 px-3 text-xs font-semibold text-dark-500 uppercase">Client</th>}
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500 uppercase">Amount</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500 uppercase">Total</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500 uppercase">Rate</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500 uppercase">Period</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500 uppercase">Status</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500 uppercase">Officer</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500 uppercase">Date</th>
              </tr></thead>
              <tbody>
                {filteredLoans.length===0&&<tr><td colSpan={9} className="text-center py-12 text-dark-400">No loans found for this period.</td></tr>}
                {filteredLoans.map((l,i)=>(
                  <tr key={l.id} className="border-b border-dark-50 hover:bg-dark-50">
                    <td className="py-2 px-3 text-dark-400 text-xs">{i+1}</td>
                    {tab==="loans"&&<td className="py-2 px-3 font-semibold text-dark-800">{l.borrower?.firstName} {l.borrower?.lastName}<br/><span className="text-xs text-dark-400 font-normal">{l.borrower?.phone}</span></td>}
                    <td className="py-2 px-3 font-semibold tabular-nums">Tsh {Number(l.amount).toLocaleString()}</td>
                    <td className="py-2 px-3 text-sky-700 font-semibold tabular-nums">Tsh {Number(l.totalAmount).toLocaleString()}</td>
                    <td className="py-2 px-3 text-dark-500">{Number(l.interestRate)}%</td>
                    <td className="py-2 px-3 text-dark-500">{l.repaymentPeriod}d</td>
                    <td className="py-2 px-3"><Badge status={l.status}/></td>
                    <td className="py-2 px-3 text-dark-500 text-xs">{l.staffActions?.[0]?.staff?l.staffActions[0].staff.firstName+" "+l.staffActions[0].staff.lastName:""}</td>
                    <td className="py-2 px-3 text-dark-400 text-xs tabular-nums">{new Date(l.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
          {tab==="officer"&&<div className="card overflow-x-auto p-0">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-dark-100">
              <UserCheck className="w-4 h-4 text-dark-400"/>
              <span className="font-semibold text-dark-800 text-sm">Handled Loans ({data.loans?.length||0})</span>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-dark-100 bg-dark-50">
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500 uppercase">#</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500 uppercase">Client</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500 uppercase">Phone</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500 uppercase">Amount</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500 uppercase">Status</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500 uppercase">Decision</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500 uppercase">Date</th>
              </tr></thead>
              <tbody>
                {(data.loans||[]).length===0&&<tr><td colSpan={7} className="text-center py-12 text-dark-400">No loans handled in this period.</td></tr>}
                {(data.loans||[]).map((l,i)=>{
                  const action=data.actions?.find(a=>a.loanId===l.id);
                  return (
                    <tr key={l.id} className="border-b border-dark-50 hover:bg-dark-50">
                      <td className="py-2 px-3 text-dark-400 text-xs">{i+1}</td>
                      <td className="py-2 px-3 font-semibold text-dark-800">{l.borrower?.firstName} {l.borrower?.lastName}</td>
                      <td className="py-2 px-3 text-dark-500 text-xs">{l.borrower?.phone}</td>
                      <td className="py-2 px-3 font-semibold tabular-nums">Tsh {Number(l.amount).toLocaleString()}</td>
                      <td className="py-2 px-3"><Badge status={l.status}/></td>
                      <td className="py-2 px-3">{action?<Badge status={action.action}/>:""}</td>
                      <td className="py-2 px-3 text-dark-400 text-xs tabular-nums">{action?new Date(action.createdAt).toLocaleDateString():""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>}
        </div>
      )}
      {!data&&!loading&&<div className="card text-center py-16">
        <BarChart3 className="w-12 h-12 text-dark-200 mx-auto mb-4"/>
        <p className="text-dark-500 font-semibold">Select filters above and click Generate Report</p>
        <p className="text-dark-400 text-sm mt-1">Monthly, Quarterly and Yearly reports available</p>
      </div>}
    </Layout>
  );
}
