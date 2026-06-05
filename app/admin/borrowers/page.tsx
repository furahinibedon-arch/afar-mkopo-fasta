"use client";
import{useEffect,useState}from"react";
import{useRouter}from"next/navigation";
import Layout from"@/components/Layout";
const BASE=process.env.NEXT_PUBLIC_API_URL||"";
function ah(){const t=typeof window!=="undefined"?localStorage.getItem("token"):null;return{"Content-Type":"application/json",...(t?{Authorization:`Bearer ${t}`}:{})};}
const ROLES=["BORROWER","LOAN_OFFICER","ADMIN"];
const EMPTY={id:"",email:"",firstName:"",lastName:"",phone:"",role:"BORROWER",password:"",isActive:true};
export default function AdminUsers(){
  const router=useRouter();
  const[users,setUsers]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[modal,setModal]=useState<"add"|"edit"|null>(null);
  const[form,setForm]=useState<any>({...EMPTY});
  const[busy,setBusy]=useState(false);
  const[msg,setMsg]=useState<{text:string;ok:boolean}|null>(null);
  const[confirm,setConfirm]=useState<string|null>(null);
  useEffect(()=>{const u=localStorage.getItem("user");if(!u){router.push("/");return;}if(JSON.parse(u).role!=="ADMIN"){router.push("/admin");return;}load();},[router]);
  const load=()=>{setLoading(true);fetch(`${BASE}/api/admin/users`,{headers:ah()}).then(r=>r.json()).then(d=>{if(Array.isArray(d))setUsers(d);}).catch(console.error).finally(()=>setLoading(false));};
  const toast=(text:string,ok=true)=>{setMsg({text,ok});setTimeout(()=>setMsg(null),3000);};
  const openAdd=()=>{setForm({...EMPTY});setModal("add");};
  const openEdit=(u:any)=>{setForm({...u,password:""});setModal("edit");};
  const closeModal=()=>{setModal(null);setForm({...EMPTY});};
  const save=async()=>{
    setBusy(true);
    const url=modal==="add"?`${BASE}/api/admin/users`:`${BASE}/api/admin/users/${form.id}`;
    const method=modal==="add"?"POST":"PATCH";
    const body:any={email:form.email,firstName:form.firstName,lastName:form.lastName,phone:form.phone,role:form.role,isActive:form.isActive};
    if(form.password)body.password=form.password;
    try{const r=await fetch(url,{method,headers:ah(),body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw new Error(d.error);toast(modal==="add"?"User created!":"User updated!");closeModal();load();}
    catch(e:any){toast(e.message,false);}finally{setBusy(false);}
  };
  const deleteUser=async(id:string)=>{
    setBusy(true);
    try{const r=await fetch(`${BASE}/api/admin/users/${id}`,{method:"DELETE",headers:ah()});const d=await r.json();if(!r.ok)throw new Error(d.error);toast("User deleted");setConfirm(null);load();}
    catch(e:any){toast(e.message,false);}finally{setBusy(false);}
  };
  const toggleRestrict=async(u:any)=>{
    try{const r=await fetch(`${BASE}/api/admin/users/${u.id}`,{method:"PATCH",headers:ah(),body:JSON.stringify({isActive:!u.isActive})});const d=await r.json();if(!r.ok)throw new Error(d.error);toast(u.isActive?"User restricted":"User activated");load();}
    catch(e:any){toast(e.message,false);}
  };
  return(<Layout portal="admin">
    <div className="mb-6 flex items-center justify-between">
      <div><h1 className="text-3xl font-black text-navy-800">User Management</h1><p className="text-slate-500 mt-1">Add, edit, restrict or delete users.</p></div>
      <button onClick={openAdd} className="btn-primary">+ Add User</button>
    </div>
    {msg&&<div className={`mb-4 px-4 py-2.5 rounded-xl text-sm font-semibold ${msg.ok?"bg-emerald-50 border border-emerald-200 text-emerald-700":"bg-red-50 border border-red-200 text-red-700"}`}>{msg.text}</div>}
    {loading?<div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"/></div>:
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-slate-200">{["Name","Email","Phone","Role","Status","Actions"].map(h=><th key={h} className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
        <tbody>
          {users.length===0&&<tr><td colSpan={6} className="text-center py-16 text-slate-400">No users yet.</td></tr>}
          {users.map((u:any)=>(
            <tr key={u.id} className={`border-b border-slate-100 hover:bg-slate-50 ${!u.isActive?"opacity-50":""}`}>
              <td className="py-3 px-3 font-semibold text-navy-800">{u.firstName} {u.lastName}</td>
              <td className="py-3 px-3 text-slate-500 text-xs">{u.email}</td>
              <td className="py-3 px-3 text-slate-500">{u.phone}</td>
              <td className="py-3 px-3"><span className={`badge-${u.role==="ADMIN"?"disbursed":u.role==="LOAN_OFFICER"?"approved":"pending"}`}>{u.role}</span></td>
              <td className="py-3 px-3"><span className={u.isActive?"badge-approved":"badge-rejected"}>{u.isActive?"Active":"Restricted"}</span></td>
              <td className="py-3 px-3"><div className="flex gap-1 flex-wrap">
                <button onClick={()=>openEdit(u)} className="btn-secondary text-xs py-1 px-2"> Edit</button>
                <button onClick={()=>toggleRestrict(u)} className={`text-xs py-1 px-2 font-semibold rounded-lg transition-colors ${u.isActive?"bg-amber-100 text-amber-700 hover:bg-amber-200":"bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}>{u.isActive?" Restrict":" Activate"}</button>
                <button onClick={()=>setConfirm(u.id)} className="btn-danger text-xs py-1 px-2"> Delete</button>
              </div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>}
    {/* Add/Edit Modal */}
    {modal&&<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
        <h2 className="text-xl font-black text-navy-800 mb-5">{modal==="add"?"Add New User":"Edit User"}</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">First Name</label><input value={form.firstName} onChange={e=>setForm((f:any)=>({...f,firstName:e.target.value}))} className="input-field"/></div>
            <div><label className="label">Last Name</label><input value={form.lastName} onChange={e=>setForm((f:any)=>({...f,lastName:e.target.value}))} className="input-field"/></div>
          </div>
          <div><label className="label">Email</label><input type="email" value={form.email} onChange={e=>setForm((f:any)=>({...f,email:e.target.value}))} className="input-field"/></div>
          <div><label className="label">Phone</label><input value={form.phone} onChange={e=>setForm((f:any)=>({...f,phone:e.target.value}))} className="input-field"/></div>
          <div><label className="label">Role</label><select value={form.role} onChange={e=>setForm((f:any)=>({...f,role:e.target.value}))} className="input-field">{ROLES.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
          <div><label className="label">{modal==="add"?"Password":"New Password (leave blank to keep)"}</label><input type="password" value={form.password} onChange={e=>setForm((f:any)=>({...f,password:e.target.value}))} className="input-field" placeholder={modal==="edit"?"unchanged":"required"}/></div>
          {modal==="edit"&&<div className="flex items-center gap-2"><input type="checkbox" id="active" checked={form.isActive} onChange={e=>setForm((f:any)=>({...f,isActive:e.target.checked}))}/><label htmlFor="active" className="text-sm font-semibold text-slate-600">Active (uncheck to restrict)</label></div>}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={save} disabled={busy} className="btn-primary flex-1">{busy?"Saving":modal==="add"?"Create User":"Save Changes"}</button>
          <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
        </div>
      </div>
    </div>}
    {/* Delete Confirm */}
    {confirm&&<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-slide-up">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><span className="text-2xl"></span></div>
        <h3 className="text-lg font-black text-navy-800 mb-2">Delete User?</h3>
        <p className="text-slate-500 text-sm mb-6">This will permanently delete the user and all their data.</p>
        <div className="flex gap-3">
          <button onClick={()=>deleteUser(confirm)} disabled={busy} className="btn-danger flex-1">{busy?"Deleting":"Yes, Delete"}</button>
          <button onClick={()=>setConfirm(null)} className="btn-secondary flex-1">Cancel</button>
        </div>
      </div>
    </div>}
  </Layout>);
}