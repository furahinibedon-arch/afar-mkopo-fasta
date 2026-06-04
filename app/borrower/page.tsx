
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Layout from '@/components/Layout';

const loanSchema = z.object({
  amount: z.number().min(1000, 'Minimum loan amount is 1000'),
  repaymentPeriod: z.number().min(1, 'Minimum 1 month'),
  purpose: z.string().min(5, 'Please provide a purpose'),
});

type LoanFormData = z.infer<typeof loanSchema>;

export default function BorrowerPortal() {
  const [activeTab, setActiveTab] = useState<'apply' | 'loans' | 'profile'>('apply');
  
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Borrower Portal</h1>
        <p className="text-gray-600">Welcome back! Apply for loans and manage your account.</p>
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
          Apply for Loan
        </button>
        <button
          onClick={() => setActiveTab('loans')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'loans'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border'
          }`}
        >
          My Loans
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border'
          }`}
        >
          My Profile
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
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: { interestRate: 15 },
  });

  const amount = watch('amount') || 0;
  const repaymentPeriod = watch('repaymentPeriod') || 1;
  const interestRate = 15;
  const totalAmount = amount * (1 + interestRate / 100);
  const monthlyPayment = totalAmount / repaymentPeriod;

  const onSubmit = async (data: LoanFormData) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setSuccess(true);
      setIsSubmitting(false);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-green-700 mb-4">Loan Application Submitted!</h2>
        <p className="text-green-600">Your loan application has been received. We will review it and notify you soon.</p>
      </div>
      );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply for a New Loan</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Loan Amount</label>
          <input
            type="number"
            {...register('amount', { valueAsNumber: true })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter loan amount"
          />
          {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Repayment Period (Months)</label>
          <input
            type="number"
            {...register('repaymentPeriod', { valueAsNumber: true })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="12"
          />
          {errors.repaymentPeriod && <p className="text-red-500 text-sm mt-1">{errors.repaymentPeriod.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Purpose of Loan</label>
          <textarea
            {...register('purpose')}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="What will you use this loan for?"
          />
          {errors.purpose && <p className="text-red-500 text-sm mt-1">{errors.purpose.message}</p>}
        </div>
        
        {amount > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Loan Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Principal Amount</p>
                <p className="text-xl font-bold text-blue-800">Ksh {amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Interest Rate</p>
                <p className="text-xl font-bold text-blue-800">{interestRate}%</p>
              </div>
              <div>
                <p className="text-gray-600">Total Repayment</p>
                <p className="text-xl font-bold text-blue-800">Ksh {totalAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Monthly Payment</p>
                <p className="text-xl font-bold text-blue-800">Ksh {monthlyPayment.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}

function MyLoansList() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Loan Applications</h2>
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-800">Loan #1</h3>
              <p className="text-gray-600">Amount: Ksh 50,000</p>
              <p className="text-gray-500 text-sm">Applied on 2026-06-01</p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                Pending
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MyProfile() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h2>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-semibold text-gray-700">First Name</p>
          <p className="text-gray-800">John</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">Last Name</p>
          <p className="text-gray-800">Doe</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">Email</p>
          <p className="text-gray-800">john@example.com</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">Phone</p>
          <p className="text-gray-800">0712345678</p>
        </div>
      </div>
    </div>
  );
}
