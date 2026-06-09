
"use client";
import{useEffect, useState}from"react";
import{useForm}from"react-hook-form";
import{z}from"zod";
import{zodResolver}from"@hookform/resolvers/zod";
import{useRouter}from"next/navigation";
import{loginUser, registerUser, uploadProfilePicture}from"@/lib/api";
import{useLanguage}from"@/context/LanguageContext";

const LS=z.object({
  email:z.string().email("Valid email required"),
  password:z.string().min(6,"Min 6 characters"),
});
const RS=z.object({
  firstName:z.string().min(2,"Required"),
  lastName:z.string().min(2,"Required"),
  email:z.string().email("Valid email required"),
  phone:z.string().min(10,"Valid phone required"),
  password:z.string().min(6,"Min 6 characters"),
});
type LD=z.infer<typeof LS>;
type RD=z.infer<typeof RS>;

export default function HomePage(){
  const[tab,setTab]=useState<"login"|"register">("login");
  const{language,setLanguage}=useLanguage();
  return(
    <div className="min-h-screen bg-navy-800 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="h-10 flex items-center">
            <img 
              src="/logo.png" 
              alt="AFAR MKOPO FASTA Logo" 
              className="h-full w-auto object-contain"
              onError={(e) => {
                // Fallback to text if logo.png doesn't exist
                e.currentTarget.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'flex items-center gap-2.5';
                fallback.innerHTML = `
                  <div class="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow-orange">
                    <span class="text-white font-black text-sm">AF</span>
                  </div>
                  <div>
                    <p class="text-white font-black text-base">AFAR Mkopo</p>
                    <p class="text-brand-400 font-black text-xs tracking-widest">FASTA</p>
                  </div>
                `;
                e.currentTarget.parentElement?.appendChild(fallback);
              }}
            />
          </div>
        </div>
        <button onClick={()=>setLanguage(language==="en"?"sw":"en")} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl">
          {language==="en"?" Swahili":" English"}
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-[420px] animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">Mkopo <span className="text-brand-400">Haraka.</span></h1>
            <p className="text-slate-400">Fast microfinance for your business & life goals.</p>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex bg-slate-100 m-4 rounded-xl p-1 gap-1">
              {(["login","register"] as const).map(t=>(
                <button key={t} onClick={()=>setTab(t)} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab===t?"bg-navy-800 text-white shadow":"text-slate-500 hover:text-slate-800"}`}>
                  {t==="login"?"Sign In":"Create Account"}
                </button>
              ))}
            </div>
            <div className="px-6 pb-8">{tab==="login"?<LF/>:<RF/>}</div>
          </div>
          <div className="flex justify-center gap-6 mt-5 text-slate-500 text-xs">
            <span> Encrypted</span><span> Instant</span><span> Licensed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LF(){
  const router=useRouter();
  const[err,setErr]=useState<string|null>(null);
  const[busy,setBusy]=useState(false);
  const{register,handleSubmit,formState:{errors}}=useForm<LD>({resolver:zodResolver(LS)});
  const sub=async(data:LD)=>{
    const email=data.email as string;
    const password=data.password as string;
    console.log("Login attempt with:", { email, password: "[REDACTED]" });
    setBusy(true);setErr(null);
    try{
      const r=await loginUser({email,password});
      console.log("Login response:", r);
      localStorage.setItem("token",r.token);
      localStorage.setItem("user",JSON.stringify(r.user));
      if(r.user?.role==="ADMIN"){
        console.log("Redirecting to admin");
        router.push("/admin");
      }
      else if(r.user?.role==="LOAN_OFFICER"){
        console.log("Redirecting to staff");
        router.push("/staff");
      }
      else{
        console.log("Redirecting to borrower");
        router.push("/borrower");
      }
    }catch(e:any){
      console.error("Login error:", e);
      setErr(e.message);
    }
    finally{setBusy(false);}
  };
  return(
    <form onSubmit={handleSubmit(sub)} className="space-y-4">
      {err&&<Err msg={err}/>}
      <Fi label="Email Address" type="email" r={register("email")} e={errors.email?.message}/>
      <Fi label="Password" type="password" r={register("password")} e={errors.password?.message}/>
      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy?"Signing in":"Sign In "}
      </button>
    </form>
  );
}

function RF(){
  const router=useRouter();
  const[err,setErr]=useState<string|null>(null);
  const[busy,setBusy]=useState(false);
  const[profilePicture, setProfilePicture]=useState<File|null>(null);
  const[profilePicturePreview, setProfilePicturePreview]=useState<string|null>(null);
  const{register,handleSubmit,formState:{errors}}=useForm<RD>({resolver:zodResolver(RS)});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sub=async(data:RD)=>{
    if (!profilePicture) {
      setErr("Profile picture is required!");
      return;
    }
    const email=data.email as string;
    const password=data.password as string;
    const firstName=data.firstName as string;
    const lastName=data.lastName as string;
    const phone=data.phone as string;
    setBusy(true);setErr(null);
    try{
      const r=await registerUser({email,password,firstName,lastName,phone});
      localStorage.setItem("token",r.token);
      localStorage.setItem("user",JSON.stringify(r.user));

      // Upload profile picture
      const uploadResult = await uploadProfilePicture(profilePicture);
      localStorage.setItem("user",JSON.stringify(uploadResult.user));

      router.push("/borrower");
    }catch(e:any){setErr(e.message);}
    finally{setBusy(false);}
  };
  return(
    <form onSubmit={handleSubmit(sub)} className="space-y-3">
      {err&&<Err msg={err}/>}
      {/* Profile Picture Upload */}
      <div className="flex flex-col items-center space-y-2">
        <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50">
          {profilePicturePreview ? (
            <img src={profilePicturePreview} alt="Profile Preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-slate-400 text-xs">Add Photo</span>
          )}
        </div>
        <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold text-slate-700">
          Choose Profile Picture
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Fi label="First Name" r={register("firstName")} e={errors.firstName?.message}/>
        <Fi label="Last Name" r={register("lastName")} e={errors.lastName?.message}/>
      </div>
      <Fi label="Email Address" type="email" r={register("email")} e={errors.email?.message}/>
      <Fi label="Phone Number" r={register("phone")} e={errors.phone?.message} ph="07XXXXXXXX"/>
      <Fi label="Password" type="password" r={register("password")} e={errors.password?.message}/>
      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy?"Creating account":"Create Account "}
      </button>
    </form>
  );
}

function Fi({label,type="text",r,e,ph}:{label:string;type?:string;r:any;e?:string;ph?:string}){
  return(
    <div>
      <label className="label">{label}</label>
      <input type={type} {...r} placeholder={ph} className="input-field"/>
      {e&&<p className="text-red-500 text-xs mt-1">{e}</p>}
    </div>
  );
}

function Err({msg}:{msg:string}){
  return(
    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-xl whitespace-pre-wrap">
       {msg}
    </div>
  );
}

