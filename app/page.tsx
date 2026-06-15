
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginUser, registerUser, uploadProfilePicture, LoginInput, RegisterInput } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { Mail, Lock, User, Phone, LogIn, UserPlus, ShieldCheck, Zap, CheckCircle2, Upload } from "lucide-react";

const LS = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Min 6 characters"),
});
const RS = z.object({
  firstName: z.string().min(2, "Required"),
  lastName: z.string().min(2, "Required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone required"),
  password: z.string().min(6, "Min 6 characters"),
});
type LD = z.infer<typeof LS>;
type RD = z.infer<typeof RS>;

export default function HomePage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const { language, setLanguage } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-primary-900 to-brand-800 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="h-10 flex items-center">
            <img 
              src="/logo.png" 
              alt="AFAR MKOPO FASTA Logo" 
              className="h-full w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'flex items-center gap-2.5';
                fallback.innerHTML = `
                  <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-glow-brand">
                    <span class="text-white font-black text-sm">AF</span>
                  </div>
                  <div>
                    <p class="text-white font-black text-base">AFAR Mkopo</p>
                    <p class="text-brand-300 font-black text-xs tracking-widest">FASTA</p>
                  </div>
                `;
                e.currentTarget.parentElement?.appendChild(fallback);
              }}
            />
          </div>
        </div>
        <button onClick={() => setLanguage(language === "en" ? "sw" : "en")} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-all">
          {language === "en" ? " Swahili" : " English"}
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-[450px] animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
              Karibu!
            </h1>
            <p className="text-xl text-brand-300 font-semibold mb-2">
              Mfalme Omba mkopo wako kwa urahisi na haraka mtandaoni.
            </p>
            <p className="text-dark-200">
              Welcome! King Apply for your loan easily and quickly online.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-white to-primary-50 rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="flex bg-gradient-to-r from-dark-100 to-primary-100 m-4 rounded-xl p-1 gap-1">
              {(["login", "register"] as const).map((t) => (
                <button 
                  key={t} 
                  onClick={() => setTab(t)} 
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    tab === t 
                      ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg" 
                      : "text-dark-600 hover:text-dark-800 hover:bg-white/50"
                  }`}
                >
                  {t === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {t === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>
            <div className="px-6 pb-8">{tab === "login" ? <LF /> : <RF />}</div>
          </div>
          
          <div className="flex justify-center gap-8 mt-6">
            <div className="flex flex-col items-center text-dark-200">
              <ShieldCheck className="w-6 h-6 mb-1 text-brand-300" />
              <span className="text-xs font-semibold">Encrypted</span>
            </div>
            <div className="flex flex-col items-center text-dark-200">
              <Zap className="w-6 h-6 mb-1 text-brand-300" />
              <span className="text-xs font-semibold">Instant</span>
            </div>
            <div className="flex flex-col items-center text-dark-200">
              <CheckCircle2 className="w-6 h-6 mb-1 text-brand-300" />
              <span className="text-xs font-semibold">Licensed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LF() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LD>({ resolver: zodResolver(LS) });
  
  const sub = async (data: LD) => {
    const email = data.email as string;
    const password = data.password as string;
    setBusy(true);
    setErr(null);
    try {
      const r = await loginUser({ email, password });
      localStorage.setItem("token", r.token);
      localStorage.setItem("user", JSON.stringify(r.user));
      if (r.user?.role === "ADMIN") router.push("/admin");
      else if (r.user?.role === "LOAN_OFFICER") router.push("/staff");
      else router.push("/borrower");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(sub)} className="space-y-4">
      {err && <Err msg={err} />}
      <Fi 
        label="Email Address" 
        type="email" 
        r={register("email")} 
        e={errors.email?.message} 
        icon={<Mail className="w-5 h-5" />}
      />
      <Fi 
        label="Password" 
        type="password" 
        r={register("password")} 
        e={errors.password?.message} 
        icon={<Lock className="w-5 h-5" />}
      />
      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? "Signing in" : "Sign In"}
        <LogIn className="w-5 h-5" />
      </button>
    </form>
  );
}

function RF() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<RD>({ resolver: zodResolver(RS) });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicturePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const sub = async (data: RD) => {
    if (!profilePicture) {
      setErr("Profile picture is required!");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const r = await registerUser(data as RegisterInput);
      localStorage.setItem("token", r.token);
      localStorage.setItem("user", JSON.stringify(r.user));
      const uploadResult = await uploadProfilePicture(profilePicture);
      localStorage.setItem("user", JSON.stringify(uploadResult.user));
      router.push("/borrower");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(sub)} className="space-y-3">
      {err && <Err msg={err} />}
      <div className="flex flex-col items-center space-y-2">
        <div className="w-24 h-24 rounded-full border-2 border-dashed border-dark-300 flex items-center justify-center overflow-hidden bg-dark-50">
          {profilePicturePreview ? (
            <img src={profilePicturePreview} alt="Profile Preview" className="w-full h-full object-cover" />
          ) : (
            <Upload className="w-8 h-8 text-dark-400" />
          )}
        </div>
        <label className="cursor-pointer px-4 py-2 bg-dark-100 hover:bg-dark-200 rounded-lg text-sm font-semibold text-dark-700 flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Choose Profile Picture
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Fi label="First Name" r={register("firstName")} e={errors.firstName?.message} icon={<User className="w-5 h-5" />} />
        <Fi label="Last Name" r={register("lastName")} e={errors.lastName?.message} icon={<User className="w-5 h-5" />} />
      </div>
      <Fi label="Email Address" type="email" r={register("email")} e={errors.email?.message} icon={<Mail className="w-5 h-5" />} />
      <Fi label="Phone Number" r={register("phone")} e={errors.phone?.message} ph="07XXXXXXXX" icon={<Phone className="w-5 h-5" />} />
      <Fi label="Password" type="password" r={register("password")} e={errors.password?.message} icon={<Lock className="w-5 h-5" />} />
      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? "Creating account" : "Create Account"}
        <UserPlus className="w-5 h-5" />
      </button>
    </form>
  );
}

function Fi({ label, type = "text", r, e, ph, icon }: { label: string; type?: string; r: any; e?: string; ph?: string; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">{icon}</div>}
        <input 
          type={type} 
          {...r} 
          placeholder={ph} 
          className={`input-field ${icon ? 'pl-10' : ''}`}
        />
      </div>
      {e && <p className="text-red-500 text-xs mt-1">{e}</p>}
    </div>
  );
}

function Err({ msg }: { msg: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-xl whitespace-pre-wrap">
      {msg}
    </div>
  );
}

