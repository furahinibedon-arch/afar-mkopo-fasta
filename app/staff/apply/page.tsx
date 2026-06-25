"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { lookupBorrowerByPhone, staffSubmitLoan } from "@/lib/api";
import { TANZANIA_REGIONS } from "@/lib/tanzaniaLocations";
import { Search, UserCheck, UserPlus, Check, ArrowLeft, ArrowRight, AlertCircle, ClipboardList } from "lucide-react";

const RATES: Record<string,number> = { DAILY: 20, WEEKLY: 47, MONTHLY: 28 };
const STEPS = ["Find Customer","Personal Info","Business & Loan","Guarantors"];

const Schema = z.object({
  borrowerPhone: z.string().optional(),
  firstName: z.string().min(2,"Required"), lastName: z.string().min(2,"Required"),
  nin: z.string().min(3,"NIN required"),
  dateOfBirth: z.string().min(1,"Required"), gender: z.string().min(1,"Required"),
  maritalStatus: z.string().min(1,"Required"),
  country: z.string().default("Tanzania"),
  region: z.string().min(1,"Region required"), district: z.string().min(1,"District required"),
  address: z.string().min(2,"Required"), houseNumber: z.string().min(1,"Required"),
  spouseName: z.string().optional(),
  businessName: z.string().min(2,"Required"), businessLocation: z.string().min(2,"Required"),
  businessSince: z.string().min(2,"Required"),
  loanPurpose: z.string().min(5,"Required"), collateral: z.string().min(3,"Required"),
  repaymentType: z.enum(["DAILY","WEEKLY","MONTHLY"],{required_error:"Select type"}),
  loanAmount: z.coerce.number().min(1000,"Min Tsh 1,000"),
  loanAmountWords: z.string().min(1,"Required"),
  guarantor1Name: z.string().min(2,"Required"), guarantor1Address: z.string().min(2,"Required"),
  guarantor1HouseNumber: z.string().min(1,"Required"), guarantor1Business: z.string().min(2,"Required"),
  guarantor1Relationship: z.string().min(2,"Required"), guarantor1Phone: z.string().min(10,"Min 10 digits"),
  guarantor1Collateral: z.string().min(3,"Required"),
  guarantor2Name: z.string().min(2,"Required"), guarantor2Address: z.string().min(2,"Required"),
  guarantor2HouseNumber: z.string().min(1,"Required"), guarantor2Business: z.string().min(2,"Required"),
  guarantor2Relationship: z.string().min(2,"Required"), guarantor2Phone: z.string().min(10,"Min 10 digits"),
  guarantor2Collateral: z.string().min(3,"Required"),
});
type FD = z.infer<typeof Schema>;

function toWords(n: number): string {
  if (!n) return "";
  const ones=["","moja","mbili","tatu","nne","tano","sita","saba","nane","tisa"];
  const teens=["kumi","kumi na moja","kumi na mbili","kumi na tatu","kumi na nne","kumi na tano","kumi na sita","kumi na saba","kumi na nane","kumi na tisa"];
  const tens=["","","ishirini","thelathini","arubaini","hamsini","sitini","sabini","themanini","tisini"];
  function c(x:number):string{
    if(x<10)return ones[x];
    if(x<20)return teens[x-10];
    if(x<100){const t=Math.floor(x/10),o=x%10;return tens[t]+(o>0?" na "+ones[o]:"");}
    if(x<1000){const h=Math.floor(x/100),r=x%100;return "mia "+ones[h]+(r>0?" na "+c(r):"");}
    if(x<1000000){const k=Math.floor(x/1000),r=x%1000;return "elfu "+c(k)+(r>0?" "+c(r):"");}
    return "milioni "+c(Math.floor(x/1000000));
  }
  return c(Math.floor(n));
}

export default function StaffApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [lookupPhone, setLookupPhone] = useState("");
  const [looking, setLooking] = useState(false);
  const [foundBorrower, setFoundBorrower] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);
  const [done, setDone] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string|null>(null);
  const [districts, setDistricts] = useState<string[]>([]);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { router.push("/"); return; }
    const role = JSON.parse(u).role;
    if (role === "BORROWER") { router.push("/borrower"); return; }
  }, [router]);

  const { register, handleSubmit, watch, trigger, setValue, reset, formState: { errors } } = useForm<FD>({
    resolver: zodResolver(Schema),
    defaultValues: { country: "Tanzania", repaymentType: "MONTHLY", loanAmountWords: "" },
  });

  const watchedRegion = watch("region");
  useEffect(() => {
    const region = TANZANIA_REGIONS.find(r => r.name === watchedRegion);
    setDistricts(region ? region.districts.map((d:any) => d.name) : []);
  }, [watchedRegion]);

  const amt = watch("loanAmount") || 0;
  const repType = watch("repaymentType") || "MONTHLY";
  const rate = RATES[repType] || 20;
  const periods: Record<string,number> = { DAILY: 30, WEEKLY: 14, MONTHLY: 1 };
  const period = periods[repType] || 1;
  const total = amt * (1 + rate / 100);
  const payment = amt > 0 ? Math.ceil(total / period) : 0;
  useEffect(() => { if (amt > 0) setValue("loanAmountWords", toWords(amt)); }, [amt, setValue]);

  const stepFields: string[][] = [
    ["firstName","lastName","nin","dateOfBirth","gender","maritalStatus","country","region","district","address","houseNumber"],
    ["businessName","businessLocation","businessSince","loanPurpose","collateral"],
    ["repaymentType","loanAmount","loanAmountWords"],
    ["guarantor1Name","guarantor1Address","guarantor1HouseNumber","guarantor1Business","guarantor1Relationship","guarantor1Phone","guarantor1Collateral",
     "guarantor2Name","guarantor2Address","guarantor2HouseNumber","guarantor2Business","guarantor2Relationship","guarantor2Phone","guarantor2Collateral"],
  ];

  const lookup = async () => {
    if (!lookupPhone || lookupPhone.length < 10) { setErr("Enter a valid phone number"); return; }
    setLooking(true); setErr(null); setFoundBorrower(null);
    try {
      const res = await lookupBorrowerByPhone(lookupPhone);
      if (res.found) {
        setFoundBorrower(res.borrower); setIsNew(false);
        const bp = res.borrower.borrowerProfile || {};
        reset({
          borrowerPhone: lookupPhone,
          firstName: res.borrower.firstName, lastName: res.borrower.lastName,
          nin: bp.nin || "", dateOfBirth: bp.dateOfBirth?.split("T")[0] || "",
          gender: bp.gender || "", maritalStatus: bp.maritalStatus || "",
          country: bp.country || "Tanzania", region: bp.region || "", district: bp.district || "",
          address: bp.address || "", houseNumber: bp.houseNumber || "", spouseName: bp.spouseName || "",
          businessName: bp.businessName || "", businessLocation: bp.businessLocation || "",
          businessSince: bp.businessSince || "", repaymentType: "MONTHLY", loanAmountWords: "",
        });
      } else {
        setIsNew(true); setFoundBorrower(null);
        setValue("borrowerPhone", lookupPhone);
      }
      setStep(1);
    } catch(e:any) { setErr(e.message); }
    finally { setLooking(false); }
  };

  const next = async () => {
    const ok = await trigger(stepFields[step] as any);
    if (ok) setStep(s => s + 1);
  };

  const submit = async (data: FD) => {
    setBusy(true); setErr(null);
    try {
      const rp = data.repaymentType === "DAILY" ? 30 : data.repaymentType === "WEEKLY" ? 14 : 1;
      const result = await staffSubmitLoan({ ...data, borrowerPhone: data.borrowerPhone || ("walkin_" + Date.now()), interestRate: rate, repaymentPeriod: rp, payment, repaymentType: data.repaymentType });
      setDone(result);
    } catch(e:any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  if (done) return (
    <Layout portal="staff">
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-emerald-600"/>
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Loan Applied Successfully</h2>
        <p className="text-zinc-500 mb-2">For: <strong>{done.borrower?.firstName} {done.borrower?.lastName}</strong></p>
        <p className="text-zinc-400 text-sm mb-8">Phone: {done.borrower?.phone}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setDone(null); setStep(0); setLookupPhone(""); reset(); }} className="btn-primary">New Application</button>
          <button onClick={() => router.push("/staff")} className="btn-secondary">Back to Queue</button>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout portal="staff">
      <div className="mb-6">
        <h1 className="page-title flex items-center gap-2"><ClipboardList className="w-6 h-6"/> Apply on Behalf</h1>
        <p className="page-subtitle">Submit a loan application for a walk-in customer</p>
      </div>

      {/* Step indicator */}
      <div className="card mb-6 p-4">
        <div className="flex items-center">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={i < step ? "wizard-step-done" : i === step ? "wizard-step-active" : "wizard-step-inactive"}>
                  {i < step ? <Check className="w-4 h-4"/> : i + 1}
                </div>
                <span className="text-xs font-semibold hidden sm:block text-zinc-500">{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 rounded-full ${i < step ? "bg-emerald-400" : "bg-zinc-200"}`}/>}
            </div>
          ))}
        </div>
      </div>

      {err && <div className="alert-error mb-4"><AlertCircle className="w-4 h-4 shrink-0"/>{err}</div>}

      {/* Step 0: Phone lookup */}
      {step === 0 && (
        <div className="card max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">Find or Register Customer</h2>
          <p className="text-sm text-zinc-500 mb-4">Enter phone number to look up existing customer. If customer has no phone, click <strong>Continue without phone</strong>.</p>
          <div className="flex gap-3">
            <input
              type="tel" value={lookupPhone} onChange={e => setLookupPhone(e.target.value)}
              onKeyDown={e => e.key === "Enter" && lookup()}
              className="input-field flex-1" placeholder="07XXXXXXXX"
            />
            <button onClick={lookup} disabled={looking} className="btn-primary px-6">
              {looking ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"/> : <Search className="w-4 h-4"/>}
              {looking ? "" : " Search"}
            </button>
          </div>
          <button type="button" onClick={() => { setIsNew(true); setValue("borrowerPhone", ""); setStep(1); }} className="btn-secondary w-full mt-3 text-sm">Continue without phone (Walk-in)</button>
        </div>
      )}

      {/* Steps 1-3: Form */}
      {step > 0 && (
        <form onSubmit={handleSubmit(submit)}>
          {/* Customer banner */}
          <div className={`card mb-4 flex items-center gap-3 border-l-4 ${isNew ? "border-amber-400" : "border-emerald-400"}`}>
            {isNew
              ? <><UserPlus className="w-5 h-5 text-amber-500 shrink-0"/><div><p className="text-sm font-semibold text-zinc-800">New Customer</p><p className="text-xs text-zinc-500">A new account will be created for {watch("borrowerPhone")}</p></div></>
              : <><UserCheck className="w-5 h-5 text-emerald-500 shrink-0"/><div><p className="text-sm font-semibold text-zinc-800">Existing: {foundBorrower?.firstName} {foundBorrower?.lastName}</p><p className="text-xs text-zinc-500">{watch("borrowerPhone")}</p></div></>
            }
          </div>

          <div className="card">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="animate-fade-in">
                <h2 className="text-base font-bold text-zinc-800 mb-4 pb-2 border-b border-zinc-100">01. Customer Personal Info</h2>
                <input type="hidden" {...register("borrowerPhone")}/>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Fi l="First Name" r={register("firstName")} e={errors.firstName?.message}/>
                  <Fi l="Last Name" r={register("lastName")} e={errors.lastName?.message}/>
                  <Fi l="NIDA Number (NIN)" r={register("nin")} e={errors.nin?.message}/>
                  <Fi l="Date of Birth" t="date" r={register("dateOfBirth")} e={errors.dateOfBirth?.message}/>
                  <Sel l="Gender" r={register("gender")} e={errors.gender?.message} opts={[["male","Male"],["female","Female"]]}/>
                  <Sel l="Marital Status" r={register("maritalStatus")} e={errors.maritalStatus?.message} opts={[["married","Married"],["single","Single"],["divorced","Divorced/Widowed"]]}/>
                  <Sel l="Region" r={register("region")} e={errors.region?.message} opts={TANZANIA_REGIONS.map(r => [r.name, r.name])}/>
                  <Sel l="District" r={register("district")} e={errors.district?.message} opts={districts.map(d => [d, d])}/>
                  <Fi l="Address / Street" r={register("address")} e={errors.address?.message}/>
                  <Fi l="House No." r={register("houseNumber")} e={errors.houseNumber?.message}/>
                  <Fi l="Spouse Name (optional)" r={register("spouseName")}/>
                </div>
              </div>
            )}

            {/* Step 2: Business & Loan */}
            {step === 2 && (
              <div className="animate-fade-in">
                <h2 className="text-base font-bold text-zinc-800 mb-4 pb-2 border-b border-zinc-100">02. Business & Loan Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Fi l="Business Name" r={register("businessName")} e={errors.businessName?.message}/>
                  <Fi l="Business Location" r={register("businessLocation")} e={errors.businessLocation?.message}/>
                  <div className="sm:col-span-2"><Fi l="In Business Since" r={register("businessSince")} e={errors.businessSince?.message}/></div>
                  <div className="sm:col-span-2">
                    <label className="label">Loan Purpose</label>
                    <textarea {...register("loanPurpose")} rows={2} className="input-field"/>
                    {errors.loanPurpose && <p className="text-red-500 text-xs mt-1">{errors.loanPurpose.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Collateral / Dhamana</label>
                    <textarea {...register("collateral")} rows={2} className="input-field"/>
                    {errors.collateral && <p className="text-red-500 text-xs mt-1">{errors.collateral.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Repayment Type</label>
                    <div className="grid grid-cols-3 gap-3 mt-1">
                      {([["DAILY","Daily","20%"],["WEEKLY","Weekly","47%"],["MONTHLY","Monthly","28%"]] as [string,string,string][]).map(([val,en,r]) => (
                        <label key={val} className={`cursor-pointer border-2 rounded-xl p-3 text-center transition-all ${repType===val?"border-sky-500 bg-sky-50":"border-zinc-200"}`}>
                          <input type="radio" {...register("repaymentType")} value={val} className="hidden"/>
                          <p className="font-bold text-zinc-800 text-sm">{en}</p>
                          <p className="text-sky-600 font-semibold text-xs mt-0.5">{r} interest</p>
                        </label>
                      ))}
                    </div>
                    {errors.repaymentType && <p className="text-red-500 text-xs mt-1">{errors.repaymentType.message}</p>}
                  </div>
                  <div>
                    <label className="label">Loan Amount (Tsh)</label>
                    <input type="number" {...register("loanAmount",{valueAsNumber:true})} className="input-field" placeholder="e.g. 500000" min={1000}/>
                    {errors.loanAmount && <p className="text-red-500 text-xs mt-1">{errors.loanAmount.message}</p>}
                  </div>
                  <div>
                    <label className="label">Payment per period (auto)</label>
                    <input readOnly value={payment > 0 ? `Tsh ${payment.toLocaleString()}` : ""} className="input-field bg-zinc-50 text-zinc-500"/>
                  </div>
                  <div className="sm:col-span-2"><Fi l="Amount in Words (Swahili)" r={register("loanAmountWords")} e={errors.loanAmountWords?.message}/></div>
                </div>
                {amt > 0 && (
                  <div className="mt-4 bg-zinc-800 rounded-xl p-4 text-white grid grid-cols-4 gap-3 text-center">
                    {[["Principal",`Tsh ${amt.toLocaleString()}`],[`Interest (${rate}%)`,`Tsh ${(amt*rate/100).toLocaleString()}`],["Total",`Tsh ${total.toLocaleString()}`],["Per period",`Tsh ${payment.toLocaleString()}`]].map(([l,v]) => (
                      <div key={l}><p className="text-orange-400 font-bold">{v}</p><p className="text-zinc-400 text-xs mt-0.5">{l}</p></div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Guarantors */}
            {step === 3 && (
              <div className="animate-fade-in space-y-6">
                {[1,2].map(n => (
                  <div key={n}>
                    <h2 className="text-base font-bold text-zinc-800 mb-3 pb-2 border-b border-zinc-100">0{n===1?6:8}. Guarantor {n}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Fi l="Full Name" r={register(`guarantor${n}Name` as any)} e={(errors as any)[`guarantor${n}Name`]?.message}/>
                      <Fi l="Address" r={register(`guarantor${n}Address` as any)} e={(errors as any)[`guarantor${n}Address`]?.message}/>
                      <Fi l="House No." r={register(`guarantor${n}HouseNumber` as any)} e={(errors as any)[`guarantor${n}HouseNumber`]?.message}/>
                      <Fi l="Business" r={register(`guarantor${n}Business` as any)} e={(errors as any)[`guarantor${n}Business`]?.message}/>
                      <Fi l="Relationship" r={register(`guarantor${n}Relationship` as any)} e={(errors as any)[`guarantor${n}Relationship`]?.message}/>
                      <Fi l="Phone" r={register(`guarantor${n}Phone` as any)} e={(errors as any)[`guarantor${n}Phone`]?.message}/>
                      <div className="sm:col-span-2">
                        <label className="label">Collateral</label>
                        <textarea {...register(`guarantor${n}Collateral` as any)} rows={2} className="input-field"/>
                        {(errors as any)[`guarantor${n}Collateral`] && <p className="text-red-500 text-xs mt-1">{(errors as any)[`guarantor${n}Collateral`]?.message}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-5">
            <button type="button" onClick={() => step === 1 ? setStep(0) : setStep(s => s - 1)} className="btn-secondary">
              <ArrowLeft className="w-4 h-4"/> Back
            </button>
            <span className="text-xs text-zinc-400">Step {step} of {STEPS.length - 1}</span>
            {step < 3
              ? <button type="button" onClick={next} className="btn-primary">Next <ArrowRight className="w-4 h-4"/></button>
              : <button type="submit" disabled={busy} className="btn-primary">{busy ? "Submitting..." : "Submit Application"}</button>
            }
          </div>
        </form>
      )}
    </Layout>
  );
}

function Fi({ l, t = "text", r, e, p }: { l: string; t?: string; r: any; e?: string; p?: string }) {
  return (
    <div>
      <label className="label">{l}</label>
      <input type={t} {...r} placeholder={p} className="input-field"/>
      {e && <p className="text-red-500 text-xs mt-1">{e}</p>}
    </div>
  );
}
function Sel({ l, r, e, opts }: { l: string; r: any; e?: string; opts: [string,string][] }) {
  return (
    <div>
      <label className="label">{l}</label>
      <select {...r} className="input-field">
        <option value="">Select...</option>
        {opts.map(([v, lbl]) => <option key={v} value={v}>{lbl}</option>)}
      </select>
      {e && <p className="text-red-500 text-xs mt-1">{e}</p>}
    </div>
  );
}
