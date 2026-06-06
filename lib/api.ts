const BASE=process.env.NEXT_PUBLIC_API_URL||"";

export type AppUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "ADMIN" | "LOAN_OFFICER" | "BORROWER";
  isActive: boolean;
  createdAt: string;
};

function ah():Record<string,string>{
  const t=typeof window!=="undefined"?localStorage.getItem("token"):null;
  return{"Content-Type":"application/json",...(t?{Authorization:`Bearer ${t}`}:{})};
}

async function ok(r:Response){
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error||d.message||`Error ${r.status}`);
  return d;
}

export async function loginUser(d:{email:string;password:string}){
  return fetch(`${BASE}/api/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)}).then(ok);
}

export async function registerUser(d:{email:string;password:string;firstName:string;lastName:string;phone:string}){
  return fetch(`${BASE}/api/auth/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)}).then(ok);
}

export const getMe=()=>fetch(`${BASE}/api/me`,{headers:ah()}).then(ok);
export const submitLoan=(d:Record<string,unknown>)=>fetch(`${BASE}/api/loans`,{method:"POST",headers:ah(),body:JSON.stringify(d)}).then(ok);
export const getMyLoans=()=>fetch(`${BASE}/api/loans`,{headers:ah()}).then(ok);
export const getAllLoans=()=>fetch(`${BASE}/api/loans/all`,{headers:ah()}).then(ok);
export const updateLoanStatus=(id:string,status:string,notes?:string)=>fetch(`${BASE}/api/loans/${id}/status`,{method:"PATCH",headers:ah(),body:JSON.stringify({status,notes})}).then(ok);
export const getAnalytics=()=>fetch(`${BASE}/api/dashboard/analytics`,{headers:ah()}).then(ok);
export const getUsers=():Promise<AppUser[]>=>fetch(`${BASE}/api/users`,{headers:ah()}).then(ok);
export const updateUserRole=(id:string,role:AppUser["role"]):Promise<AppUser>=>fetch(`${BASE}/api/users/${id}/role`,{method:"PATCH",headers:ah(),body:JSON.stringify({role})}).then(ok);
