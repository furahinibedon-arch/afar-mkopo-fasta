"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { getAnalytics } from "@/lib/api";
import {
  Building2, TrendingUp, TrendingDown, AlertCircle,
  FileText, Clock, CheckCircle, Activity, BarChart3,
  ArrowUpRight
} from "lucide-react";

function fmt(n: number) {
  if (n === 0) return "TZS 0";
  return new Intl.NumberFormat("en-TZ", {
    style: "currency", currency: "TZS", minimumFractionDigits: 0,
    notation: n >= 1_000_000 ? "compact" : "standard",
    compactDisplay: "short",
  }).format(n);
}

type KpiProps = {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
  valueColor?: string;
};

function KpiCard({ label, value, sub, icon, iconBg, borderColor, valueColor = "text-zinc-900" }: KpiProps) {
  return (
    <div className="kpi-card" style={{ borderLeftColor: borderColor }}>
      <div className={`kpi-icon ${iconBg}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="kpi-label">{label}</p>
        <p className={`kpi-value ${valueColor}`}>{value}</p>
        {sub && <p className="kpi-sub">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { t } = useLanguage();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { router.push("/"); return; }
    const role = JSON.parse(u).role;
    if (!["ADMIN", "DIRECTOR", "CEO"].includes(role)) {
      router.push(role === "LOAN_OFFICER" ? "/staff" : "/borrower");
      return;
    }
    getAnalytics().then(setData).catch((e: any) => setErr(e.message)).finally(() => setLoading(false));
  }, [router, refreshKey]);

  useEffect(() => {
    const h = () => setRefreshKey(k => k + 1);
    window.addEventListener("focus", h);
    return () => window.removeEventListener("focus", h);
  }, []);

  if (loading) return (
    <Layout portal="admin">
      <div className="flex items-center justify-center py-32">
        <div className="w-7 h-7 rounded-full border-[3px] border-sky-500 border-t-transparent animate-spin" />
      </div>
    </Layout>
  );

  if (err) return (
    <Layout portal="admin">
      <div className="alert-error"><AlertCircle className="w-4 h-4 shrink-0" />{err}</div>
    </Layout>
  );

  const disbursed     = Number(data?.totalDisbursed   || 0);
  const repaid        = Number(data?.totalRepaid       || 0);
  const balance       = disbursed - repaid;
  const companyBal    = Number(data?.companyBalance    || 0);
  const interest      = disbursed * 0.2;
  const loans: any[]  = data?.loans || [];
  const pending       = loans.filter((l: any) => l.status === "PENDING").length;
  const active        = loans.filter((l: any) => ["DISBURSED","APPROVED"].includes(l.status)).length;
  const overdue: any[]= data?.overdueRepayments || [];

  const badge = (s: string) => <span className={`badge-${s.toLowerCase()}`}>{s}</span>;

  return (
    <Layout portal="admin">

      {/*  Page header  */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Live financial overview</p>
        </div>
        <span className="text-xs text-zinc-400 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg">
          {new Date().toLocaleDateString("en-TZ", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
        </span>
      </div>

      {/*  Financial KPIs  */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
        <KpiCard label="Company Balance"   value={fmt(companyBal)} sub="Available capital"
          icon={<Building2 className="w-4 h-4 text-sky-600" />}     iconBg="bg-sky-100"     borderColor="#0284c7" valueColor="text-sky-700" />
        <KpiCard label={t.totalDisbursed}  value={fmt(disbursed)}  sub="Loans issued"
          icon={<TrendingUp className="w-4 h-4 text-violet-600" />} iconBg="bg-violet-100"  borderColor="#7c3aed" />
        <KpiCard label={t.totalRepaid}     value={fmt(repaid)}     sub="Collected"
          icon={<TrendingDown className="w-4 h-4 text-emerald-600" />} iconBg="bg-emerald-100" borderColor="#059669" valueColor="text-emerald-700" />
        <KpiCard label={t.outstandingBalance} value={fmt(balance)} sub="Still owed"
          icon={<Activity className="w-4 h-4 text-amber-600" />}   iconBg="bg-amber-100"   borderColor="#d97706" valueColor="text-amber-700" />
      </div>

      {/*  Loan-count KPIs  */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        <KpiCard label={t.totalLoans}      value={loans.length}    sub="All time"
          icon={<FileText className="w-4 h-4 text-zinc-500" />}    iconBg="bg-zinc-100"    borderColor="#a1a1aa" />
        <KpiCard label={t.pending}         value={pending}         sub="Need review"
          icon={<Clock className="w-4 h-4 text-amber-500" />}      iconBg="bg-amber-50"    borderColor="#f59e0b" valueColor="text-amber-600" />
        <KpiCard label={t.active}          value={active}          sub="Disbursed"
          icon={<CheckCircle className="w-4 h-4 text-emerald-600" />} iconBg="bg-emerald-50"  borderColor="#10b981" valueColor="text-emerald-700" />
        <KpiCard label={t.overduePayments} value={overdue.length}  sub={overdue.length > 0 ? "Urgent" : "All clear"}
          icon={<AlertCircle className="w-4 h-4 text-red-500" />}  iconBg="bg-red-50"      borderColor="#ef4444" valueColor={overdue.length > 0 ? "text-red-600" : "text-zinc-700"} />
      </div>

      {/*  Debtor Ledger  */}
      <div className="card mb-4 p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-semibold text-zinc-800">Debtor Ledger</span>
          </div>
          <a href="/admin/loans" className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-medium">
            View all <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              {["Borrower","Amount","Rate","Period","Total","Status","Date"].map(h => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>
              {loans.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-zinc-400 text-sm">No loans recorded yet.</td></tr>
              )}
              {loans.slice(0, 10).map((loan: any) => (
                <tr key={loan.id}>
                  <td className="font-medium text-zinc-900">{loan.borrower?.firstName} {loan.borrower?.lastName}</td>
                  <td className="font-semibold tabular-nums">Tsh {Number(loan.amount).toLocaleString()}</td>
                  <td className="text-zinc-500">{Number(loan.interestRate)}%</td>
                  <td className="text-zinc-500">{loan.repaymentPeriod}d</td>
                  <td className="font-semibold text-sky-700 tabular-nums">Tsh {Number(loan.totalAmount).toLocaleString()}</td>
                  <td>{badge(loan.status)}</td>
                  <td className="text-zinc-400 tabular-nums">{new Date(loan.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/*  P&L Summary  */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100">
          <TrendingUp className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-800">Profit &amp; Loss</span>
        </div>
        <div className="grid grid-cols-3 divide-x divide-zinc-100">
          <div className="px-4 py-4">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Expected Interest</p>
            <p className="text-lg font-bold text-emerald-700 tabular-nums">{fmt(interest)}</p>
            <p className="text-[10px] text-zinc-400 mt-1">20% flat rate</p>
          </div>
          <div className="px-4 py-4">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Overdue Exposure</p>
            <p className="text-lg font-bold text-red-600 tabular-nums">{overdue.length} <span className="text-sm font-normal text-zinc-400">payments</span></p>
            <p className="text-[10px] text-zinc-400 mt-1">Require action</p>
          </div>
          <div className="px-4 py-4">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Net Position</p>
            <p className="text-lg font-bold text-sky-700 tabular-nums">{fmt(repaid - disbursed + interest)}</p>
            <p className="text-[10px] text-zinc-400 mt-1">Repaid + interest  disbursed</p>
          </div>
        </div>
      </div>

    </Layout>
  );
}
