"use client";
import{useEffect,useState}from"react";
import{useRouter}from"next/navigation";
import Layout from"@/components/Layout";
import{getAllLoans}from"@/lib/api";
export default function AdminBorrowers(){
  const router=useRouter();
  const[users,setUsers]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[err,setErr]=useState<string|null>(null);
  useEffect(()=>{
    const u=localStorage.getItem("user");
    if(!u){router.push("/");return;}
    if(JSON.parse(u).role==="BORROWER"){router.push("/borrower");return;}
    getAllLoans().then((loans:any[])=>{
      const map=new Map();
      loans.forEach((l:any)=>{
        if(l.borrower&&!map.has(l.borrower.email)){
          map.set(l.borrower.email,{...l.borrower,loanCount:loans.filter((x:any)=>x.borrower?.email===l.borrower.email).length,hasActive:loans.some((x:any)=>x.borrower?.email===l.borrower.email&&["DISBURSED","APPROVED"].includes(x.status))});
        }
      });
      setUsers(Array.from(map.values()));
    }).catch((e:any)=>setErr(e.message)).finally(()=>setLoading(false));
  },[router]);
  return(
    <Layout portal="admin">
      <div className="mb-8"><h1 className="text-3xl font-black text-navy-800">Borrowers</h1><p className="text-slate-500 mt-1">All borrowers and their loan activity.</p></div>
      {loading&&<div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"/></div>}
      {err&&<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">Error: {err}</div>}
      {!loading&&!err&&(
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200">{["Name","Email","Phone","Loans","Active"].map(h=><th key={h} className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>
              {users.length===0&&<tr><td colSpan={5} className="text-center py-16 text-slate-400">No borrowers yet.</td></tr>}
              {users.map((u:any)=>(
                <tr key={u.email} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-navy-800">{u.firstName} {u.lastName}</td>
                  <td className="py-3 px-3 text-slate-500">{u.email}</td>
                  <td className="py-3 px-3 text-slate-500">{u.phone}</td>
                  <td className="py-3 px-3 font-bold text-center text-navy-800">{u.loanCount}</td>
                  <td className="py-3 px-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.hasActive?"bg-emerald-100 text-emerald-700":"bg-slate-100 text-slate-500"}`}>{u.hasActive?"Yes":"No"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}