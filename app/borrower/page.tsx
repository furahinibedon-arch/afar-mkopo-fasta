'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Layout from '@/components/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { generateLoanApplicationPDF, type LoanApplicationData } from '@/lib/pdfGenerator';

const loanSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  dateOfBirth: z.string().min(1),
  gender: z.string().min(1),
  maritalStatus: z.string().min(1),
  address: z.string().min(2),
  houseNumber: z.string().min(1),
  spouseName: z.string().optional(),
  phone: z.string().min(10),
  businessName: z.string().min(2),
  businessLocation: z.string().min(2),
  businessSince: z.string().min(2),
  loanPurpose: z.string().min(5),
  loanAmount: z.number().min(1000),
  loanAmountWords: z.string().min(5),
  dailyPayment: z.number().min(100),
  guarantor1Name: z.string().optional(),
  guarantor1Address: z.string().optional(),
  guarantor1HouseNumber: z.string().optional(),
  guarantor1Business: z.string().optional(),
  guarantor1Relationship: z.string().optional(),
  guarantor1Phone: z.string().optional(),
  guarantor1Collateral: z.string().optional(),
  guarantor2Name: z.string().optional(),
  guarantor2Address: z.string().optional(),
  guarantor2HouseNumber: z.string().optional(),
  guarantor2Business: z.string().optional(),
  guarantor2Relationship: z.string().optional(),
  guarantor2Phone: z.string().optional(),
  guarantor2Collateral: z.string().optional(),
});

type LoanFormData = z.infer<typeof loanSchema>;

export default function BorrowerPortal() {
  const [activeTab, setActiveTab] = useState<'apply' | 'loans' | 'profile'>('apply');
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t.borrowerPortal}</h1>
      </div>
      
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('apply')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'apply'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border'
          }`}
        >
          {t.applyForLoan}
        </button>
        <button
          onClick={() => setActiveTab('loans')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'loans'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border'
          }`}
        >
          {t.myLoans}
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border'
          }`}
        >
          {t.myProfile}
        </button>
      </div>

      {activeTab === 'apply' && <LoanApplicationForm />}
      {activeTab === 'loans' && <MyLoansList />}
      {activeTab === 'profile' && <MyProfile />}
    </Layout>
  );
}

function LoanApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { t } = useLanguage();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
  });

  const loanAmount = watch('loanAmount') || 0;
  const interestRate = 20;
  const totalRepayment = loanAmount * (1 + interestRate / 100);
  const dailyPayment = Math.ceil(totalRepayment / 30);

  const onSubmit = async (data: LoanFormData) => {
    setIsSubmitting(true);
    try {
      const pdfData: LoanApplicationData = {
        ...data,
        interestRate,
        dailyPayment: data.dailyPayment || dailyPayment,
      };
      generateLoanApplicationPDF(pdfData);
      setSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-green-700 mb-4">{t.applicationSubmitted}</h2>
        <p className="text-green-600">{t.applicationSuccessMsg}</p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Make Another Application
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">FOMU YA MAOMBI YA MKOPO</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Borrower Info */}
        <div className="border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4">01. TAARIFA ZA MKOPAJI</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Majina kamili (First Name)</label>
              <input {...register('firstName')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Majina kamili (Last Name)</label>
              <input {...register('lastName')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tarehe ya kuzaliwa</label>
              <input type="date" {...register('dateOfBirth')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Jinsia</label>
              <select {...register('gender')} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">Select...</option>
                <option value="male">Mwanaume</option>
                <option value="female">Mwanamke</option>
              </select>
              {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Halya ndoa</label>
              <select {...register('maritalStatus')} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">Select...</option>
                <option value="married">Ameoa/Ameolewa</option>
                <option value="single">Hajaoa/Hajaolewa</option>
                <option value="divorced">Mjane/Mgane</option>
              </select>
              {errors.maritalStatus && <p className="text-red-500 text-sm">{errors.maritalStatus.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Sehemu ya makazi/mtaa</label>
              <input {...register('address')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nyumba no.</label>
              <input {...register('houseNumber')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              {errors.houseNumber && <p className="text-red-500 text-sm">{errors.houseNumber.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Jina kamili la mwenzi</label>
              <input {...register('spouseName')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Namba za simu</label>
              <input {...register('phone')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Business Info */}
        <div className="border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4">02. TAARIFA ZA BIASHARA YA MKOPAJI</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Aina/jina la biashara</label>
              <input {...register('businessName')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              {errors.businessName && <p className="text-red-500 text-sm">{errors.businessName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mahali pa biashara</label>
              <input {...register('businessLocation')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              {errors.businessLocation && <p className="text-red-500 text-sm">{errors.businessLocation.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Umefanya biashara tangu lini</label>
              <input {...register('businessSince')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              {errors.businessSince && <p className="text-red-500 text-sm">{errors.businessSince.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Dhumuni la mkopo</label>
              <textarea {...register('loanPurpose')} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              {errors.loanPurpose && <p className="text-red-500 text-sm">{errors.loanPurpose.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 3: Loan Details */}
        <div className="border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4">03. KIASI CHA MKOPO KWA ASILIMIA TATU POINT TANO TU.</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Kiasi cha mkopo</label>
              <input
                type="number"
                {...register('loanAmount', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              {errors.loanAmount && <p className="text-red-500 text-sm">{errors.loanAmount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Kiasi cha kurejesha kwa siku (autocalculated)</label>
              <input
                type="number"
                readOnly
                value={dailyPayment}
                {...register('dailyPayment', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Kiasi kwa maneno</label>
              <input {...register('loanAmountWords')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Elfu mia tano" />
              {errors.loanAmountWords && <p className="text-red-500 text-sm">{errors.loanAmountWords.message}</p>}
            </div>
            {loanAmount > 0 && (
              <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-800 mb-2">Loan Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="font-semibold">Loan Amount:</span> Tsh {loanAmount.toLocaleString()}</p>
                  <p><span className="font-semibold">Interest (20%):</span> Tsh {(loanAmount * 0.2).toLocaleString()}</p>
                  <p><span className="font-semibold">Total Repayment:</span> Tsh {totalRepayment.toLocaleString()}</p>
                  <p><span className="font-semibold">Daily Payment:</span> Tsh {dailyPayment.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Guarantor 1 */}
        <div className="border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4">06. TAARIFA ZA WADHAMINI - MDHAMINI WA KWANZA</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Majina ya mdhamini</label>
              <input {...register('guarantor1Name')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Sehemu ya makazi</label>
              <input {...register('guarantor1Address')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nyumba no.</label>
              <input {...register('guarantor1HouseNumber')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Sehemu ya biashara</label>
              <input {...register('guarantor1Business')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Uhusiano wake na mkopaji</label>
              <input {...register('guarantor1Relationship')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Namba za simu</label>
              <input {...register('guarantor1Phone')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Dhamana anazoandikisha</label>
              <textarea {...register('guarantor1Collateral')} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Section 5: Guarantor 2 */}
        <div className="border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4">08. MDHAMINI WA PILI</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Majina ya mdhamini</label>
              <input {...register('guarantor2Name')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Sehemu ya makazi</label>
              <input {...register('guarantor2Address')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nyumba no.</label>
              <input {...register('guarantor2HouseNumber')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Sehemu ya biashara</label>
              <input {...register('guarantor2Business')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Uhusiano wake na mkopaji</label>
              <input {...register('guarantor2Relationship')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Namba za simu</label>
              <input {...register('guarantor2Phone')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Dhamana anazoandikisha</label>
              <textarea {...register('guarantor2Collateral')} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit & Print PDF'}
        </button>
      </form>
    </div>
  );
}

function MyLoansList() {
  const { t } = useLanguage();
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.loanApplications}</h2>
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-800">Loan #1</h3>
              <p className="text-gray-600">Amount: Tsh 500,000</p>
              <p className="text-gray-500 text-sm">Applied on 2026-06-01</p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                {t.pendingReview}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MyProfile() {
  const { t } = useLanguage();
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.myProfile}</h2>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-semibold text-gray-700">{t.firstName}</p>
          <p className="text-gray-800">John</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">{t.lastName}</p>
          <p className="text-gray-800">Doe</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">{t.phone}</p>
          <p className="text-gray-800">0712345678</p>
        </div>
      </div>
    </div>
  );
}
