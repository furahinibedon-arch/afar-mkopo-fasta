"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { getUsers, getBorrowerDocuments, uploadBorrowerDocument, AppUser, BorrowerDocument } from "@/lib/api";
import { Upload, FileText, Users, UserCheck, Trash2, AlertTriangle } from "lucide-react";

const ROLES = ["BORROWER", "LOAN_OFFICER", "ADMIN", "DIRECTOR", "CEO"];
const EMPTY = { id: "", email: "", firstName: "", lastName: "", phone: "", role: "BORROWER", password: "", isActive: true };
const BASE = process.env.NEXT_PUBLIC_API_URL || "";
function ah(){const t=typeof window!=="undefined"?localStorage.getItem("token"):null;return{"Content-Type":"application/json",...(t?{Authorization:`Bearer ${t}`}:{})}}

function UserTable({ list, showDocs, currentUserRole, t, onEdit, onDocs, onRestrict, onDelete, onPurge }: any) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-zinc-200">{["Name","Email","Phone","Role","Status","Actions"].map(h=><th key={h} className="text-left py-3 px-3 text-xs font-semibold text-zinc-500 uppercase">{h}</th>)}</tr></thead>
        <tbody>
          {list.length===0&&<tr><td colSpan={6} className="text-center py-12 text-zinc-400">None found.</td></tr>}
          {list.map((u:any)=>(
            <tr key={u.id} className={`border-b border-zinc-100 hover:bg-zinc-50 ${!u.isActive?"opacity-50":""}`}>
              <td className="py-3 px-3 font-semibold text-zinc-800">{u.firstName} {u.lastName}</td>
              <td className="py-3 px-3 text-zinc-500 text-xs">{u.email}</td>
              <td className="py-3 px-3 text-zinc-500">{u.phone}</td>
              <td className="py-3 px-3"><span className="badge">{u.role.replace("_"," ")}</span></td>
              <td className="py-3 px-3"><span className={u.isActive?"badge-approved":"badge-rejected"}>{u.isActive?"Active":"Restricted"}</span></td>
              <td className="py-3 px-3">
                <div className="flex gap-1 flex-wrap">
                  {(currentUserRole!=="CEO"&&currentUserRole!=="DIRECTOR")&&<button onClick={()=>onEdit(u)} className="btn-secondary text-xs py-1 px-2">Edit</button>}
                  {showDocs&&<button onClick={()=>onDocs(u)} className="btn-secondary text-xs py-1 px-2">Docs</button>}
                  {(currentUserRole!=="CEO"&&currentUserRole!=="DIRECTOR")&&<button onClick={()=>onRestrict(u)} className={`text-xs py-1 px-2 font-semibold rounded-lg transition-all ${u.isActive?"bg-amber-100 text-amber-700 hover:bg-amber-200":"bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}>{u.isActive?"Restrict":"Activate"}</button>}
                  {(currentUserRole!=="CEO"&&currentUserRole!=="DIRECTOR")&&<button onClick={()=>onDelete(u.id)} className="btn-danger text-xs py-1 px-2">Delete</button>}
                  {u.role==="BORROWER"&&<button onClick={()=>onPurge(u)} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg font-semibold"><Trash2 className="w-3 h-3"/> Purge Loans</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminUsers() {
  const { t } = useLanguage();
  const router = useRouter();
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | "documents" | null>(null);
  const [form, setForm] = useState<any>({ ...EMPTY });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [purgeTarget, setPurgeTarget] = useState<AppUser | null>(null);
  const [purgeBusy, setPurgeBusy] = useState(false);
  const [purgeResult, setPurgeResult] = useState<string>("");
  const [selectedBorrower, setSelectedBorrower] = useState<AppUser | null>(null);
  const [documents, setDocuments] = useState<BorrowerDocument[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setCurrentUserRole(JSON.parse(u).role);
  }, []);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { router.push("/"); return; }
    const userRole = JSON.parse(u).role;
    if (!["ADMIN", "CEO", "DIRECTOR"].includes(userRole)) { router.push("/admin"); return; }
    load();
  }, [router, refreshKey]);

  useEffect(() => {
    const handleFocus = () => setRefreshKey(k => k + 1);
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const toast = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3000); };
  const load = async () => { setLoading(true); try { setUsers(await getUsers()); } catch(e){} finally { setLoading(false); } };
  const openAdd = () => { setForm({ ...EMPTY }); setModal("add"); };
  const openEdit = (u: any) => { setForm({ ...u, password: "" }); setModal("edit"); };
  const closeModal = () => { setModal(null); setForm({ ...EMPTY }); setSelectedBorrower(null); };

  const loadDocuments = async (borrower: AppUser) => {
    setSelectedBorrower(borrower); setModal("documents"); setDocuments([]);
    try { setDocuments(await getBorrowerDocuments(borrower.id)); } catch(e) {}
  };

  const handleUploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBorrower) return;
    setUploadingDoc(true);
    try { const doc = await uploadBorrowerDocument(selectedBorrower.id, file); setDocuments(p=>[doc,...p]); toast("Uploaded!"); }
    catch(e) { toast("Failed to upload", false); } finally { setUploadingDoc(false); }
  };

  const save = async () => {
    setBusy(true);
    const url = modal === "add" ? `${BASE}/api/admin/users` : `${BASE}/api/users/${form.id}`;
    const body: any = { email: form.email, firstName: form.firstName, lastName: form.lastName, phone: form.phone, role: form.role, isActive: form.isActive };
    if (form.password) body.password = form.password;
    try {
      const r = await fetch(url, { method: modal==="add"?"POST":"PATCH", headers: ah(), body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      if (modal==="edit") {
        const stored = localStorage.getItem("user");
        if (stored) { const me = JSON.parse(stored); if (me.id===form.id) { localStorage.setItem("user", JSON.stringify({...me,...d})); setCurrentUserRole(d.role); } }
      }
      toast(modal==="add"?"User created!":"User updated!"); closeModal(); load();
    } catch(e:any) { toast(e.message, false); } finally { setBusy(false); }
  };

  const deleteUser = async (id: string) => {
    setBusy(true);
    try { const r = await fetch(`${BASE}/api/users/${id}`, {method:"DELETE",headers:ah()}); const d = await r.json(); if (!r.ok) throw new Error(d.error); toast("Deleted"); setConfirm(null); load(); }
    catch(e:any) { toast(e.message, false); } finally { setBusy(false); }
  };

  const toggleRestrict = async (u: any) => {
    try { const r = await fetch(`${BASE}/api/users/${u.id}`, {method:"PATCH",headers:ah(),body:JSON.stringify({isActive:!u.isActive})}); const d = await r.json(); if (!r.ok) throw new Error(d.error); toast(u.isActive?"Restricted":"Activated"); load(); }
    catch(e:any) { toast(e.message, false); }
  };

  const purgeBorrower = async (user: AppUser) => {
    setPurgeBusy(true); setPurgeResult("");
    try {
      const r = await fetch(`${BASE}/api/admin/purge-borrower?id=${user.id}`, {method:"DELETE",headers:ah()});
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setPurgeResult("Done: " + d.message);
      load();
    } catch(e:any) { setPurgeResult("Error: " + e.message); }
    finally { setPurgeBusy(false); }
  };

  const staffUsers = users.filter((u:any) => ["LOAN_OFFICER","ADMIN","DIRECTOR","CEO"].includes(u.role));
  const borrowerUsers = users.filter((u:any) => u.role === "BORROWER");

  return (
    <Layout portal="admin">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-3xl font-black text-zinc-800">User Management</h1><p className="text-zinc-500 mt-1">Add, edit, restrict or delete users.</p></div>
        {(currentUserRole!=="CEO"&&currentUserRole!=="DIRECTOR")&&<button onClick={openAdd} className="btn-primary">+ Add User</button>}
      </div>
      {msg&&<div className={`mb-4 px-4 py-2.5 rounded-xl text-sm font-semibold ${msg.ok?"bg-emerald-50 border border-emerald-200 text-emerald-700":"bg-red-50 border border-red-200 text-red-700"}`}>{msg.text}</div>}

      {loading ? <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"/></div> : (
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><UserCheck className="w-4 h-4 text-blue-600"/></div>
              <h2 className="text-lg font-black text-zinc-800">Staff Members <span className="text-zinc-400 font-normal text-sm">({staffUsers.length})</span></h2>
            </div>
            <UserTable list={staffUsers} showDocs={false} currentUserRole={currentUserRole} t={t} onEdit={openEdit} onDocs={loadDocuments} onRestrict={toggleRestrict} onDelete={setConfirm} onPurge={(u:AppUser)=>{setPurgeTarget(u);setPurgeResult("");}}/>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center"><Users className="w-4 h-4 text-emerald-600"/></div>
              <h2 className="text-lg font-black text-zinc-800">Borrowers <span className="text-zinc-400 font-normal text-sm">({borrowerUsers.length})</span></h2>
            </div>
            <UserTable list={borrowerUsers} showDocs={true} currentUserRole={currentUserRole} t={t} onEdit={openEdit} onDocs={loadDocuments} onRestrict={toggleRestrict} onDelete={setConfirm} onPurge={(u:AppUser)=>{setPurgeTarget(u);setPurgeResult("");}}/>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal&&modal!=="documents"&&<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <h2 className="text-xl font-black text-zinc-800 mb-5">{modal==="add"?"Add New User":"Edit User"}</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">First Name</label><input value={form.firstName} onChange={e=>setForm((f:any)=>({...f,firstName:e.target.value}))} className="input-field"/></div>
              <div><label className="label">Last Name</label><input value={form.lastName} onChange={e=>setForm((f:any)=>({...f,lastName:e.target.value}))} className="input-field"/></div>
            </div>
            <div><label className="label">Email</label><input type="email" value={form.email} onChange={e=>setForm((f:any)=>({...f,email:e.target.value}))} className="input-field"/></div>
            <div><label className="label">Phone</label><input value={form.phone} onChange={e=>setForm((f:any)=>({...f,phone:e.target.value}))} className="input-field"/></div>
            <div><label className="label">Role</label><select value={form.role} onChange={e=>setForm((f:any)=>({...f,role:e.target.value}))} className="input-field">{ROLES.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
            <div><label className="label">{modal==="add"?"Password":"New Password (leave blank to keep)"}</label><input type="password" value={form.password} onChange={e=>setForm((f:any)=>({...f,password:e.target.value}))} className="input-field" placeholder={modal==="edit"?"unchanged":"required"}/></div>
            {modal==="edit"&&<div className="flex items-center gap-2"><input type="checkbox" id="active" checked={form.isActive} onChange={e=>setForm((f:any)=>({...f,isActive:e.target.checked}))}/><label htmlFor="active" className="text-sm font-semibold text-zinc-600">Active</label></div>}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={save} disabled={busy} className="btn-primary flex-1">{busy?"Saving...":modal==="add"?"Create User":"Save Changes"}</button>
            <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </div>}

      {/* Documents Modal */}
      {modal==="documents"&&selectedBorrower&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-zinc-800">Documents — {selectedBorrower.firstName} {selectedBorrower.lastName}</h2>
              <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-600 text-2xl">&times;</button>
            </div>
            <label className="block w-full text-center py-4 border-2 border-dashed border-zinc-300 rounded-xl cursor-pointer hover:border-sky-400 text-sm font-semibold text-sky-600 mb-4">
              {uploadingDoc?"Uploading...":<><Upload className="w-5 h-5 mx-auto mb-1"/>Upload Document</>}
              <input type="file" className="hidden" onChange={handleUploadDoc} disabled={uploadingDoc}/>
            </label>
            {documents.length===0?<p className="text-center text-zinc-400 py-8">No documents yet</p>:(
              <div className="space-y-2">
                {documents.map(doc=>(
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-200 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-zinc-600"/></div>
                      <div><p className="font-semibold text-zinc-800 text-sm">{doc.fileName}</p><p className="text-xs text-zinc-500">{new Date(doc.createdAt).toLocaleDateString()}</p></div>
                    </div>
                    <a href={doc.fileUrl} target="_blank" className="btn-secondary text-xs" rel="noreferrer">Download</a>
                  </div>
                ))}
              </div>
            )}
            <button onClick={closeModal} className="btn-secondary w-full mt-6">Close</button>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirm&&<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-7 h-7 text-red-600"/></div>
          <h3 className="text-lg font-black text-zinc-800 mb-2">Delete User?</h3>
          <p className="text-zinc-500 text-sm mb-6">This will permanently delete the user and all their data.</p>
          <div className="flex gap-3">
            <button onClick={()=>deleteUser(confirm)} disabled={busy} className="btn-danger flex-1">{busy?"Deleting...":"Yes, Delete"}</button>
            <button onClick={()=>setConfirm(null)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </div>}

      {/* Purge Loan History Modal */}
      {purgeTarget&&(
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0"><AlertTriangle className="w-6 h-6 text-orange-600"/></div>
              <div>
                <h3 className="text-lg font-black text-zinc-900">Purge Loan History</h3>
                <p className="text-sm text-zinc-500 mt-0.5">{purgeTarget.firstName} {purgeTarget.lastName}</p>
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 text-sm text-orange-800">
              <p className="font-semibold mb-1">This will permanently:</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Delete ALL loans for this borrower</li>
                <li>Delete all repayment records</li>
                <li>Reverse all disbursement &amp; repayment entries from company balance</li>
              </ul>
              <p className="mt-2 font-semibold">User account is NOT deleted.</p>
            </div>
            {purgeResult&&(
              <div className={`mb-4 px-3 py-2 rounded-xl text-sm font-medium ${purgeResult.startsWith("Done")?"bg-emerald-50 text-emerald-800 border border-emerald-200":"bg-red-50 text-red-800 border border-red-200"}`}>
                {purgeResult}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={()=>purgeBorrower(purgeTarget)} disabled={purgeBusy} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4"/>
                {purgeBusy?"Purging...":"Yes, Purge All Loans"}
              </button>
              <button onClick={()=>{setPurgeTarget(null);setPurgeResult("");}} disabled={purgeBusy} className="flex-1 btn-secondary py-2.5">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}