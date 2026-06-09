const BASE=process.env.NEXT_PUBLIC_API_URL||"";

export type AppUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string | null;
  role: "ADMIN" | "LOAN_OFFICER" | "BORROWER" | "DIRECTOR";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  borrowerProfile?: {
    id: string;
    dateOfBirth?: string;
    gender?: string;
    maritalStatus?: string;
    nin?: string;
    country?: string;
    region?: string;
    district?: string;
    address?: string;
    houseNumber?: string;
    spouseName?: string;
    businessName?: string;
    businessLocation?: string;
    businessSince?: string;
  } | null;
  receivedDocuments?: BorrowerDocument[];
};

export type BorrowerDocument = {
  id: string;
  borrowerId: string;
  loanId?: string;
  uploadedById: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  version: number;
  description?: string;
  isActive: boolean;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
};

function ah():Record<string,string>{
  const t=typeof window!=="undefined"?localStorage.getItem("token"):null;
  return{...(t?{Authorization:`Bearer ${t}`}:{})}; // Don't set Content-Type for FormData!
}

async function ok(r:Response){
  console.log("Response status:", r.status, r.statusText);
  const d=await r.json().catch((e)=>{
    console.error("Error parsing response:", e);
    return {};
  });
  console.log("Response data:", d);
  if(!r.ok)throw new Error(d.error||d.message||`Error ${r.status}`);
  return d;
}

export async function loginUser(d:{email:string;password:string}){
  console.log("Calling loginUser with:", { email: d.email, password: "[REDACTED]" });
  console.log("BASE URL:", BASE);
  const url = `${BASE}/api/auth/login`;
  console.log("Request URL:", url);
  return fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)}).then(ok);
}

export async function registerUser(d:{email:string;password:string;firstName:string;lastName:string;phone:string}){
  return fetch(`${BASE}/api/auth/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)}).then(ok);
}

export const getMe=()=>fetch(`${BASE}/api/me`,{headers:ah()}).then(ok);
export const submitLoan=(d:Record<string,unknown>)=>fetch(`${BASE}/api/loans`,{method:"POST",headers:{...ah(),"Content-Type":"application/json"},body:JSON.stringify(d)}).then(ok);
export const getMyLoans=()=>fetch(`${BASE}/api/loans`,{headers:ah()}).then(ok);
export const getAllLoans=()=>fetch(`${BASE}/api/loans/all`,{headers:ah()}).then(ok);
export const updateLoanStatus=(id:string,status:string,notes?:string)=>fetch(`${BASE}/api/loans/${id}/status`,{method:"PATCH",headers:{...ah(),"Content-Type":"application/json"},body:JSON.stringify({status,notes})}).then(ok);
export const updateLoan=(id:string, data: { amount?: number; interestRate?: number; repaymentPeriod?: number })=>fetch(`${BASE}/api/loans/${id}`,{method:"PATCH",headers:{...ah(),"Content-Type":"application/json"},body:JSON.stringify(data)}).then(ok);
export const deleteLoan=(id:string)=>fetch(`${BASE}/api/loans/${id}`,{method:"DELETE",headers:ah()}).then(ok);
export const getAnalytics=()=>fetch(`${BASE}/api/dashboard/analytics`,{headers:ah()}).then(ok);
export const getUsers=():Promise<AppUser[]>=>fetch(`${BASE}/api/users`,{headers:ah()}).then(ok);
export const updateUserRole=(id:string,role:AppUser["role"]):Promise<AppUser>=>fetch(`${BASE}/api/users/${id}/role`,{method:"PATCH",headers:{...ah(),"Content-Type":"application/json"},body:JSON.stringify({role})}).then(ok);
export const uploadProfilePicture=async(file:File):Promise<{user:AppUser}>=>{
  const formData = new FormData();
  formData.append('file', file);
  return fetch(`${BASE}/api/users/profile-picture`,{method:"POST",headers:ah(),body:formData}).then(ok);
};
export const getBorrowerDocuments=(borrowerId:string):Promise<BorrowerDocument[]>=>fetch(`${BASE}/api/borrowers/${borrowerId}/documents`,{headers:ah()}).then(ok);
export const uploadBorrowerDocument=async(borrowerId:string, file:File):Promise<BorrowerDocument>=>{
  const formData = new FormData();
  formData.append('file', file);
  return fetch(`${BASE}/api/borrowers/${borrowerId}/documents`,{method:"POST",headers:ah(),body:formData}).then(ok);
};

// Loan Document Management
export const getLoanDocuments=(loanId:string, search?: string, fileType?: string):Promise<BorrowerDocument[]>=>{
  let url = `${BASE}/api/loans/${loanId}/documents`;
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (fileType) params.append('type', fileType);
  if (params.toString()) url += `?${params.toString()}`;
  return fetch(url,{headers:ah()}).then(ok);
};

export const uploadLoanDocument=async(loanId:string, file:File, description?: string):Promise<BorrowerDocument>=>{
  const formData = new FormData();
  formData.append('file', file);
  if (description) formData.append('description', description);
  return fetch(`${BASE}/api/loans/${loanId}/documents`,{method:"POST",headers:ah(),body:formData}).then(ok);
};

export const updateLoanDocument=async(loanId:string, documentId:string, description:string):Promise<BorrowerDocument>=>{
  return fetch(`${BASE}/api/loans/${loanId}/documents/${documentId}`,{method:"PATCH",headers:{...ah(),"Content-Type":"application/json"},body:JSON.stringify({description})}).then(ok);
};

export const deleteLoanDocument=async(loanId:string, documentId:string):Promise<{success: boolean}>=>{
  return fetch(`${BASE}/api/loans/${loanId}/documents/${documentId}`,{method:"DELETE",headers:ah()}).then(ok);
};
