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
  borrowerPhone: z.string().min(10,"Valid phone required"),
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
