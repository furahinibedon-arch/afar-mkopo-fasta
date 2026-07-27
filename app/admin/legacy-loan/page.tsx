"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { getUsers } from "@/lib/api";
import { History, CheckCircle, AlertCircle, Search } from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_API_URL || "";
function ah() {
  const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

export default function LegacyLoanPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [form, setForm] = useState({ outstandingAmount: "", disbursedAt: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [imported, setImported] = useState<any[]>([]);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { router.push("/"); return; }
    const role = JSON.parse(u).role;
    if (!["ADMIN", "CEO", "DIRECTOR"].includes(role)) { router.push("/admin"); return; }
    getUsers().then(all => setUsers(all.filter((u: any) => u.role === "BORROWER"))).catch(console.error);
  }, [router]);

  const filtered = users.filter(u =>
    !search ||
    `${u.firstName} ${u.lastName} ${u.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) { setResult({ type: "error", msg: "Chagua mteja kwanza" }); return; }
    if (!form.outstandingAmount || Number(form.outstandingAmount) <= 0) {
      setResult({ type: "error", msg: "Weka kiasi sahihi (lazima iwe zaidi ya 0)" });
      return;
    }
    setBusy(true); setResult(null);
    try {
      const r = await fetch(`${BASE}/api/loans/legacy`, {
        method: "POST",
        headers: ah(),
        body: JSON.stringify({
          borrowerId: selectedUser.id,
          outstandingAmount: Number(form.outstandingAmount),
          disbursedAt: form.disbursedAt || undefined,
          notes: form.notes,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setResult({ type: "success", msg: `Imefanikiwa! Mkopo wa ${selectedUser.firstName} ${selectedUser.lastName} (Tsh ${Number(form.outstandingAmount).toLocaleString()}) umeingizwa. Sasa unaweza kupokea malipo yake.` });
      setImported(prev => [...prev, { name: `${selectedUser.firstName} ${selectedUser.lastName}`, amount: Number(form.outstandingAmount), loanId: d.loan?.id }]);
      setSelectedUser(null);
      setForm({ outstandingAmount: "", disbursedAt: "", notes: "" });
      setSearch("");
    } catch (ex: any) {
      setResult({ type: "error", msg: ex.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout portal="admin">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl mb-6 px-6 py-5" style={{ background: "linear-gradient(135deg,#0f172a 0%,#0c2a50 60%,#0369a1 100%)" }}>
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0">
            <History className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Ingiza Mkopo wa Zamani</h1>
            <p className="text-sky-300/80 text-sm mt-0.5">Kwa wateja waliokuwa wakikopa kabla ya mfumo kuanza</p>
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="alert-info mb-6">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-1">Jinsi inavyofanya kazi:</p>
          <ul className="space-y-0.5 text-sky-700">
            <li>Weka kiasi anachokudai mteja <strong>leo hii</strong> (salio lake bado — faida imeshaingia)</li>
            <li>Mfumo utaingiza mkopo kama DISBURSED bila kukata balance ya kampuni</li>
            <li>Baada ya kuingiza, unaweza kupokea malipo yake kwa kawaida</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Select borrower */}
        <div className="card">
          <h2 className="text-base font-bold text-zinc-800 mb-4">1. Chagua Mteja</h2>
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
              placeholder="Tafuta kwa jina au simu..."
            />
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-zinc-400 text-sm text-center py-4">
                {search ? "Hakuna mteja aliyepatikana" : "Hakuna wateja wa BORROWER bado"}
              </p>
            )}
            {filtered.map((u: any) => (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between ${
                  selectedUser?.id === u.id
                    ? "bg-sky-50 border-2 border-sky-400"
                    : "border border-zinc-200 hover:border-sky-300"
                }`}
              >
                <div>
                  <p className="font-semibold text-zinc-800 text-sm">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-zinc-400">{u.phone}</p>
                </div>
                {selectedUser?.id === u.id && <CheckCircle className="w-5 h-5 text-sky-500 shrink-0" />}
              </button>
            ))}
          </div>
          {users.length === 0 && (
            <div className="mt-3 pt-3 border-t border-zinc-100">
              <p className="text-xs text-zinc-400">Kama mteja hayupo kwenye orodha, nenda kwanza kwenye</p>
              <a href="/admin/borrowers" className="text-sky-600 text-xs font-semibold hover:underline">Admin → Users → Unda akaunti mpya</a>
            </div>
          )}
        </div>

        {/* Right: Form */}
        <div className="card">
          <h2 className="text-base font-bold text-zinc-800 mb-4">2. Weka Maelezo ya Mkopo</h2>

          {selectedUser ? (
            <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-sky-500 shrink-0" />
              <div>
                <p className="font-bold text-sky-800 text-sm">{selectedUser.firstName} {selectedUser.lastName}</p>
                <p className="text-xs text-sky-500">{selectedUser.phone}</p>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 mb-4 text-sm text-zinc-400">
              Chagua mteja upande wa kushoto kwanza
            </div>
          )}

          {result && (
            <div className={`mb-4 flex items-start gap-2 px-4 py-3 rounded-xl text-sm ${result.type === "success" ? "alert-success" : "alert-error"}`}>
              {result.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              {result.msg}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Kiasi Anachokudai Leo (Tsh) *</label>
              <input
                type="number"
                required
                min={1}
                value={form.outstandingAmount}
                onChange={e => setForm(f => ({ ...f, outstandingAmount: e.target.value }))}
                className="input-field"
                placeholder="mfano: 400000"
              />
              <p className="text-xs text-zinc-400 mt-1">Weka salio lake lote — faida imeshaingia ndani ya kiasi hiki</p>
            </div>
            <div>
              <label className="label">Tarehe Alipokopa (optional)</label>
              <input
                type="date"
                value={form.disbursedAt}
                onChange={e => setForm(f => ({ ...f, disbursedAt: e.target.value }))}
                className="input-field"
              />
              <p className="text-xs text-zinc-400 mt-1">Tarehe alipopewa mkopo wa kwanza</p>
            </div>
            <div>
              <label className="label">Maelezo (optional)</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="input-field"
                placeholder="mfano: Mkopo wa zamani, alibaki na salio la Tsh 400,000 tangu Januari 2024"
              />
            </div>
            <button
              type="submit"
              disabled={busy || !selectedUser}
              className="btn-primary w-full py-3"
            >
              {busy ? "Inaingiza..." : "Ingiza Mkopo wa Zamani"}
            </button>
          </form>
        </div>
      </div>

      {/* Imported this session */}
      {imported.length > 0 && (
        <div className="card mt-6">
          <h2 className="text-base font-bold text-zinc-800 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Mikopo Iliyoingizwa Leo ({imported.length})
          </h2>
          <table className="data-table">
            <thead><tr><th>#</th><th>Mteja</th><th>Kiasi</th><th>Hatua Inayofuata</th></tr></thead>
            <tbody>
              {imported.map((row, i) => (
                <tr key={i}>
                  <td className="text-zinc-400 text-xs">{i + 1}</td>
                  <td className="font-semibold text-zinc-800">{row.name}</td>
                  <td className="font-bold text-emerald-600">Tsh {row.amount.toLocaleString()}</td>
                  <td>
                    <a href="/admin/loans" className="text-sky-600 text-xs hover:underline font-semibold">
                      Nenda Loans → Pata malipo yake
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}