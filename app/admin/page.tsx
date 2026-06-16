"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { getAnalytics } from "@/lib/api";
import {
  Building2, TrendingUp, TrendingDown, AlertCircle,
  FileText, Clock, CheckCircle, Activity, BarChart3
} from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-TZ", {
    style: "currency", currency: "TZS", minimumFractionDigits: 0,
  }).format(n);
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
    const handleFocus = () => setRefreshKey(k => k + 1);
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  if (loading) return (
    <Layout portal="admin">
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
      </div>
    </Layout>
  );

  if (err) return (
    <Layout portal="admin">
      <div className="alert-error"><AlertCircle className="w-4 h-4 shrink-0" />{err}</div>
    </Layout>
  );

  const disbursed = Number(data?.totalDisbursed || 0);
  const repaid    = Number(data?.totalRepaid    || 0);
  const balance   = disbursed - repaid;
  const companyBalance = Number(data?.companyBalance || 0);
  const interest  = disbursed * 0.2;
  const loans: any[] = data?.loans || [];
  const pending   = loans.filter((l: any) => l.status === "PENDING").length;
  const active    = loans.filter((l: any) => ["DISBURSED", "APPROVED"].includes(l.status)).length;
  const overdue: any[] = data?.overdueRepayments || [];

  const badge = (s: string) => <span className={`badge-${s.toLowerCase()}`}>{s}</span>;

  return (
    <Layout portal="admin">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Financial overview &amp; live analytics</p>
      </div>

      {/*  KPI Row 1  Financials  */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">

        <div className="kpi-card">
          <div className="kpi-icon bg-sky-100">
            <Building2 className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <p className="kpi-label">Company Balance</p>
            <p className="kpi-value">{fmt(companyBalance)}</p>
            <p className="kpi-sub">Available capital</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-violet-100">
            <TrendingUp className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="kpi-label">{t.totalDisbursed}</p>
            <p className="kpi-value">{fmt(disbursed)}</p>
            <p className="kpi-sub">Lifetime loans out</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-emerald-100">
            <TrendingDown className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="kpi-label">{t.totalRepaid}</p>
            <p className="kpi-value">{fmt(repaid)}</p>
            <p className="kpi-sub">Collected to date</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-amber-100">
            <Activity className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="kpi-label">{t.outstandingBalance}</p>
            <p className="kpi-value">{fmt(balance)}</p>
            <p className="kpi-sub">Still outstanding</p>
          </div>
        </div>
      </div>

      {/*  KPI Row 2  Loan Counts  */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        <div className="kpi-card">
          <div className="kpi-icon bg-zinc-100">
            <FileText className="w-5 h-5 text-zinc-500" />
          </div>
          <div>
            <p className="kpi-label">{t.totalLoans}</p>
            <p className="kpi-value text-zinc-900">{loans.length}</p>
            <p className="kpi-sub">All time</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-amber-100">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="kpi-label">{t.pending}</p>
            <p className="kpi-value text-amber-600">{pending}</p>
            <p className="kpi-sub">Awaiting review</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-emerald-100">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="kpi-label">{t.active}</p>
            <p className="kpi-value text-emerald-600">{active}</p>
            <p className="kpi-sub">Active &amp; disbursed</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-red-100">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="kpi-label">{t.overduePayments}</p>
            <p className="kpi-value text-red-600">{overdue.length}</p>
            <p className="kpi-sub">Need attention</p>
          </div>
        </div>
      </div>

      {/*  Debtor Ledger  */}
      <div className="card mb-5 overflow-hidden p-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-800">Individual Debtor Ledger</h2>
          </div>
          <span className="text-xs text-zinc-400">{loans.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                {["Borrower", "Amount", "Rate", "Period", "Total", "Status", "Applied"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loans.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-zinc-400">No loans yet.</td></tr>
              )}
              {loans.map((loan: any) => (
                <tr key={loan.id}>
                  <td className="font-medium text-zinc-900">{loan.borrower?.firstName} {loan.borrower?.lastName}</td>
                  <td className="font-semibold">Tsh {Number(loan.amount).toLocaleString()}</td>
                  <td className="text-zinc-500">{Number(loan.interestRate)}%</td>
                  <td className="text-zinc-500">{loan.repaymentPeriod}d</td>
                  <td className="font-semibold text-sky-700">Tsh {Number(loan.totalAmount).toLocaleString()}</td>
                  <td>{badge(loan.status)}</td>
                  <td className="text-zinc-400">{new Date(loan.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/*  P&L Overview  */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-zinc-100">
          <TrendingUp className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-800">Profit &amp; Loss Overview</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Expected Interest</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700 tracking-tight">{fmt(interest)}</p>
            <p className="text-xs text-zinc-400 mt-1">At 20% flat rate</p>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Overdue Exposure</span>
            </div>
            <p className="text-2xl font-bold text-red-700 tracking-tight">{overdue.length} <span className="text-base font-normal text-zinc-400">repayments</span></p>
            <p className="text-xs text-zinc-400 mt-1">Require immediate action</p>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-sky-500" />
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Net Position</span>
            </div>
            <p className="text-2xl font-bold text-sky-700 tracking-tight">{fmt(repaid - disbursed + interest)}</p>
            <p className="text-xs text-zinc-400 mt-1">Repaid + interest  disbursed</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
