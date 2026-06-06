"use client";
import{useState,useEffect}from"react";
import{useForm,Controller}from"react-hook-form";
import{z}from"zod";
import{zodResolver}from"@hookform/resolvers/zod";
import{useRouter}from"next/navigation";
import Layout from"@/components/Layout";
import{useLanguage}from"@/context/LanguageContext";
import{submitLoan,getMe,getMyLoans}from"@/lib/api";
import{generateLoanApplicationPDF}from"@/lib/pdfGenerator";

const STEPS=["Borrower Info","Business & Collateral","Loan Details","Guarantors"];

// Interest rates per repayment type
const RATES:Record<string,number>={DAILY:3.5,WEEKLY:10,MONTHLY:20};

const S=z.object({
  firstName:z.string().min(2,"Required"),lastName:z.string().min(2,"Required"),
  dateOfBirth:z.string().min(1,"Required"),gender:z.string().min(1,"Required"),
  maritalStatus:z.string().min(1,"Required"),address:z.string().min(2,"Required"),
  houseNumber:z.string().min(1,"Required"),spouseName:z.string().optional(),
  phone:z.string().min(10,"Min 10 digits"),
  businessName:z.string().min(2,"Required"),businessLocation:z.string().min(2,"Required"),
  businessSince:z.string().min(2,"Required"),loanPurpose:z.string().min(5,"Required"),
  collateral:z.string().min(3,"Describe your collateral/asset"),
  repaymentType:z.enum(["DAILY","WEEKLY","MONTHLY"],{required_error:"Select repayment type"}),
  loanAmount:z.coerce.number().min(1000,"Min Tsh 1,000"),
  loanAmountWords:z.string().min(1,"Required"),
  guarantor1Name:z.string().optional(),guarantor1Address:z.string().optional(),
  guarantor1HouseNumber:z.string().optional(),guarantor1Business:z.string().optional(),
  guarantor1Relationship:z.string().optional(),guarantor1Phone:z.string().optional(),
  guarantor1Collateral:z.string().optional(),
  guarantor2Name:z.string().optional(),guarantor2Address:z.string().optional(),
  guarantor2HouseNumber:z.string().optional(),guarantor2Business:z.string().optional(),
  guarantor2Relationship:z.string().optional(),guarantor2Phone:z.string().optional(),
  guarantor2Collateral:z.string().optional(),
});
type FD=z.infer<typeof S>;

export default function BorrowerPortal(){
  const router=useRouter(),{t}=useLanguage();
  const[user,setUser]=useState<any>(null);
  const[step,setStep]=useState(0);
  const[done,setDone]=useState(false);
  const[busy,setBusy]=useState(false);
  const[err,setErr]=useState<string|null>(null);
  useEffect(()=>{const u=localStorage.getItem("user");if(!u){router.push("/");return;}setUser(JSON.parse(u));getMe().then(setUser).catch(()=>router.push("/"));},[router]);

  const{register,handleSubmit,watch,trigger,control,formState:{errors}}=useForm<FD>({
    resolver:zodResolver(S),
    defaultValues:{loanAmountWords:"",repaymentType:"MONTHLY"}
  });

  const amt=watch("loanAmount")||0;
  const repaymentType=watch("repaymentType")||"MONTHLY";
  const rate=RATES[repaymentType]||20;
  const total=amt*(1+rate/100);
  const periods={DAILY:30,WEEKLY:4,MONTHLY:1};
  const period=periods[repaymentType as keyof typeof periods]||1;
  const payment=amt>0?Math.ceil(total/period):0;
  const paymentLabel={DAILY:"Daily Payment",WEEKLY:"Weekly Payment",MONTHLY:"Monthly Payment"};

  const sf:string[][]=[
    ["firstName","lastName","dateOfBirth","gender","maritalStatus","address","houseNumber","phone"],
    ["businessName","businessLocation","businessSince","loanPurpose","collateral"],
    ["repaymentType","loanAmount","loanAmountWords"],
    [],
  ];

  const next=async()=>{
    const ok=await trigger(sf[step] as any);
    if(ok)setStep(s=>s+1);
  };
  const prev=()=>setStep(s=>Math.max(s-1,0));

  const sub=async(data:FD)=>{
    setBusy(true);setErr(null);
    try{
      const rp=data.repaymentType==="DAILY"?30:data.repaymentType==="WEEKLY"?4:1;
      await submitLoan({...data,interestRate:rate,repaymentPeriod:rp,payment,repaymentType:data.repaymentType});
      generateLoanApplicationPDF({...data,interestRate:rate,dailyPayment:payment});
      setDone(true);
    }catch(e:any){setErr(e.message);}
    finally{setBusy(false);}
  };

  if(done)return(
    <Layout portal="borrower">
      <div className="max-w-lg mx-auto text-center py-16 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h2 className="text-3xl font-black text-navy-800 mb-3">{t.applicationSubmitted}</h2>
        <p className="text-slate-500 mb-8">{t.applicationSuccessMsg}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={()=>{setDone(false);setStep(0);}} className="btn-primary">New Application</button>
          <a href="/borrower/loans" className="btn-secondary">View My Loans</a>
        </div>
      </div>
    </Layout>
  );

  return(
    <Layout portal="borrower">
      <div className="mb-8">
        <p className="text-slate-500 text-sm mb-1">Welcome back, <span className="font-semibold text-navy-800">{user?.firstName}</span></p>
        <h1 className="text-3xl font-black text-navy-800">{t.applyForLoan}</h1>
      </div>

      {/* Wizard steps */}
      <div className="card mb-6 p-4">
        <div className="flex items-center">
          {STEPS.map((label,i)=>(
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={i<step?"wizard-step-done":i===step?"wizard-step-active":"wizard-step-inactive"}>{i<step?"":i+1}</div>
                <span className={`text-xs font-semibold hidden sm:block ${i===step?"text-brand-500":"text-slate-400"}`}>{label}</span>
              </div>
              {i<STEPS.length-1&&<div className={`flex-1 h-0.5 mx-2 rounded-full ${i<step?"bg-emerald-400":"bg-slate-200"}`}/>}
            </div>
          ))}
        </div>
      </div>

      {err&&<div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl"> {err}</div>}

      <form onSubmit={handleSubmit(sub)}>
        <div className="card">

          {/* STEP 0: Borrower Info */}
          {step===0&&<div className="animate-fade-in">
            <h2 className="text-lg font-black text-navy-800 mb-6 pb-2 border-b border-slate-100">01. Taarifa za Mkopaji</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Fi l="Jina (First)" r={register("firstName")} e={errors.firstName?.message}/>
              <Fi l="Jina (Last)" r={register("lastName")} e={errors.lastName?.message}/>
              <Fi l="Tarehe ya kuzaliwa" t="date" r={register("dateOfBirth")} e={errors.dateOfBirth?.message}/>
              <Sel l="Jinsia" r={register("gender")} e={errors.gender?.message} opts={[["male","Mwanaume"],["female","Mwanamke"]]}/>
              <div className="sm:col-span-2"><Sel l="Hali ya ndoa" r={register("maritalStatus")} e={errors.maritalStatus?.message} opts={[["married","Ameoa/Ameolewa"],["single","Hajaoa/Hajaolewa"],["divorced","Talaka/Mjane"]]}/></div>
              <Fi l="Makazi/Mtaa" r={register("address")} e={errors.address?.message}/>
              <Fi l="Nyumba No." r={register("houseNumber")} e={errors.houseNumber?.message}/>
              <Fi l="Jina la mwenzi (optional)" r={register("spouseName")}/>
              <Fi l="Simu" r={register("phone")} e={errors.phone?.message} p="07XXXXXXXX"/>
            </div>
          </div>}

          {/* STEP 1: Business + Collateral */}
          {step===1&&<div className="animate-fade-in">
            <h2 className="text-lg font-black text-navy-800 mb-6 pb-2 border-b border-slate-100">02. Taarifa za Biashara & Dhamana</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Fi l="Jina la biashara" r={register("businessName")} e={errors.businessName?.message}/>
              <Fi l="Mahali pa biashara" r={register("businessLocation")} e={errors.businessLocation?.message}/>
              <div className="sm:col-span-2"><Fi l="Biashara tangu lini" r={register("businessSince")} e={errors.businessSince?.message}/></div>
              <div className="sm:col-span-2">
                <label className="label">Dhamuni la mkopo (Loan Purpose)</label>
                <textarea {...register("loanPurpose")} rows={3} className="input-field"/>
                {errors.loanPurpose&&<p className="text-red-500 text-xs mt-1">{errors.loanPurpose.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label"> Dhamana ya Mkopo (Collateral / Asset)</label>
                <textarea {...register("collateral")} rows={3} className="input-field" placeholder="e.g. Nyumba, gari, ardhi, bidhaa za duka... Eleza mali unayoweka dhamana"/>
                {errors.collateral&&<p className="text-red-500 text-xs mt-1">{errors.collateral.message}</p>}
                <p className="text-xs text-slate-400 mt-1">Describe the asset or property you are offering as security for this loan.</p>
              </div>
            </div>
          </div>}

          {/* STEP 2: Loan Details */}
          {step===2&&<div className="animate-fade-in">
            <h2 className="text-lg font-black text-navy-800 mb-6 pb-2 border-b border-slate-100">03. Kiasi & Masharti ya Mkopo</h2>

            {/* Repayment type selector */}
            <div className="mb-6">
              <label className="label">Aina ya Malipo (Repayment Type)</label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {([["DAILY","Kila Siku","Daily","3.5%"],["WEEKLY","Kila Wiki","Weekly","10%"],["MONTHLY","Kila Mwezi","Monthly","20%"]] as [string,string,string,string][]).map(([val,sw,en,r])=>(
                  <label key={val} className={`cursor-pointer border-2 rounded-xl p-3 text-center transition-all ${repaymentType===val?"border-brand-500 bg-brand-50":"border-slate-200 hover:border-slate-300"}`}>
                    <input type="radio" {...register("repaymentType")} value={val} className="hidden"/>
                    <p className="font-black text-navy-800 text-sm">{en}</p>
                    <p className="text-slate-500 text-xs">{sw}</p>
                    <p className="text-brand-600 font-bold text-sm mt-1">{r} interest</p>
                  </label>
                ))}
              </div>
              {errors.repaymentType&&<p className="text-red-500 text-xs mt-1">{errors.repaymentType.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Kiasi cha mkopo (Tsh)</label>
                <input type="number" {...register("loanAmount",{valueAsNumber:true})} className="input-field" placeholder="e.g. 500000" min={1000}/>
                {errors.loanAmount&&<p className="text-red-500 text-xs mt-1">{errors.loanAmount.message}</p>}
              </div>
              <div>
                <label className="label">{paymentLabel[repaymentType as keyof typeof paymentLabel]} (auto)</label>
                <input readOnly value={payment>0?`Tsh ${payment.toLocaleString()}`:""} className="input-field bg-slate-50 text-slate-500"/>
              </div>
              <div className="sm:col-span-2">
                <Fi l="Kiasi kwa maneno" r={register("loanAmountWords")} e={errors.loanAmountWords?.message} p="e.g. Elfu mia tano"/>
              </div>
            </div>

            {amt>0&&<div className="mt-6 bg-navy-800 rounded-2xl p-5 text-white">
              <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Muhtasari wa Mkopo</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {[
                  {l:"Principal",v:`Tsh ${amt.toLocaleString()}`},
                  {l:`Interest (${rate}%)`,v:`Tsh ${(amt*rate/100).toLocaleString()}`},
                  {l:"Total Repay",v:`Tsh ${total.toLocaleString()}`},
                  {l:paymentLabel[repaymentType as keyof typeof paymentLabel],v:`Tsh ${payment.toLocaleString()}`},
                ].map(({l,v})=><div key={l}><p className="text-brand-400 font-black text-lg">{v}</p><p className="text-slate-400 text-xs mt-0.5">{l}</p></div>)}
              </div>
            </div>}
          </div>}

          {/* STEP 3: Guarantors */}
          {step===3&&<div className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-lg font-black text-navy-800 mb-4 pb-2 border-b border-slate-100">06. Mdhamini wa Kwanza</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Fi l="Majina" r={register("guarantor1Name")}/><Fi l="Makazi" r={register("guarantor1Address")}/>
                <Fi l="Nyumba No." r={register("guarantor1HouseNumber")}/><Fi l="Biashara" r={register("guarantor1Business")}/>
                <Fi l="Uhusiano" r={register("guarantor1Relationship")}/><Fi l="Simu" r={register("guarantor1Phone")}/>
                <div className="sm:col-span-2"><label className="label">Dhamana anazoandikisha</label><textarea {...register("guarantor1Collateral")} rows={2} className="input-field"/></div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-black text-navy-800 mb-4 pb-2 border-b border-slate-100">08. Mdhamini wa Pili</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Fi l="Majina" r={register("guarantor2Name")}/><Fi l="Makazi" r={register("guarantor2Address")}/>
                <Fi l="Nyumba No." r={register("guarantor2HouseNumber")}/><Fi l="Biashara" r={register("guarantor2Business")}/>
                <Fi l="Uhusiano" r={register("guarantor2Relationship")}/><Fi l="Simu" r={register("guarantor2Phone")}/>
                <div className="sm:col-span-2"><label className="label">Dhamana anazoandikisha</label><textarea {...register("guarantor2Collateral")} rows={2} className="input-field"/></div>
              </div>
            </div>
          </div>}
        </div>

        <div className="flex items-center justify-between mt-6">
          <button type="button" onClick={prev} disabled={step===0} className="btn-secondary disabled:opacity-30"> Back</button>
          <span className="text-xs text-slate-400 font-medium">Step {step+1} of {STEPS.length}</span>
          {step<3
            ?<button type="button" onClick={next} className="btn-primary">Next </button>
            :<button type="submit" disabled={busy} className="btn-primary">{busy?"Saving":"Submit & Print PDF"}</button>
          }
        </div>
      </form>
    </Layout>
  );
}
function Fi({l,t="text",r,e,p}:{l:string;t?:string;r:any;e?:string;p?:string}){
  return<div><label className="label">{l}</label><input type={t} {...r} placeholder={p} className="input-field"/>{e&&<p className="text-red-500 text-xs mt-1">{e}</p>}</div>;
}
function Sel({l,r,e,opts}:{l:string;r:any;e?:string;opts:[string,string][]}){
  return<div><label className="label">{l}</label><select {...r} className="input-field"><option value="">Select</option>{opts.map(([v,lbl])=><option key={v} value={v}>{lbl}</option>)}</select>{e&&<p className="text-red-500 text-xs mt-1">{e}</p>}</div>;
}