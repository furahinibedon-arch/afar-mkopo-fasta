
"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const kycSchema = z.object({
  idNumber: z.string().min(5),
  address: z.string().min(5),
  dateOfBirth: z.string(),
  guarantorName: z.string().min(2),
  guarantorPhone: z.string().min(10),
  guarantorAddress: z.string().min(5),
});

const loanSchema = z.object({
  amount: z.number().min(1000),
  repaymentPeriod: z.number().min(1).max(24),
  purpose: z.string().min(5),
});

export default function BorrowerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">AFAR MKOPO FASTA</h1>
          <nav className="flex gap-4">
            <a href="/borrower" className="text-blue-600 font-medium">Dashboard</a>
            <a href="/" className="text-gray-600">Logout</a>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <LoanApplication />
          <KycForm />
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">My Loans</h2>
          <LoanList />
        </div>
      </main>
    </div>
  );
}

function LoanApplication() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(loanSchema),
    defaultValues: { interestRate: 15 },
  });
  const amount = watch("amount");
  const period = watch("repaymentPeriod");
  const interestRate = 15;
  const totalAmount = amount ? amount * (1 + interestRate / 100) : 0;
  const monthlyPayment = period && amount ? totalAmount / period : 0;

  const onSubmit = (data) => console.log("Apply for loan", data);
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Apply for Loan</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Loan Amount</label>
          <input
            type="number"
            {...register("amount", { valueAsNumber: true })}
            className="w-full mt-1 px-4 py-2 border rounded-lg"
          />
          {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message as string}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Repayment Period (Months)</label>
          <input
            type="number"
            {...register("repaymentPeriod", { valueAsNumber: true })}
            className="w-full mt-1 px-4 py-2 border rounded-lg"
          />
          {errors.repaymentPeriod && <p className="text-red-500 text-sm">{errors.repaymentPeriod.message as string}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Purpose</label>
          <textarea
            {...register("purpose")}
            className="w-full mt-1 px-4 py-2 border rounded-lg"
            rows={3}
          />
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm"><strong>Interest Rate:</strong> 15%</p>
          <p className="text-sm"><strong>Total Repayment:</strong> {totalAmount.toFixed(2)}</p>
          <p className="text-sm"><strong>Monthly Payment:</strong> {monthlyPayment.toFixed(2)}</p>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Submit Application
        </button>
      </form>
    </div>
  );
}

function KycForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(kycSchema) });
  const onSubmit = (data) => console.log("Update KYC", data);
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">KYC Information</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">ID Number</label>
          <input {...register("idNumber")} className="w-full mt-1 px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <textarea {...register("address")} className="w-full mt-1 px-3 py-2 border rounded" rows={2} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input type="date" {...register("dateOfBirth")} className="w-full mt-1 px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Guarantor Name</label>
          <input {...register("guarantorName")} className="w-full mt-1 px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Guarantor Phone</label>
          <input {...register("guarantorPhone")} className="w-full mt-1 px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Guarantor Address</label>
          <textarea {...register("guarantorAddress")} className="w-full mt-1 px-3 py-2 border rounded" rows={2} />
        </div>
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Save KYC Details
        </button>
      </form>
    </div>
  );
}

function LoanList() {
  const loans = [
    { id: "1", amount: 50000, status: "PENDING", createdAt: new Date().toISOString() },
    { id: "2", amount: 30000, status: "APPROVED", createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
  ];
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Loan ID</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loans.map(loan => (
            <tr key={loan.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm">{loan.id}</td>
              <td className="px-6 py-4 text-sm">{loan.amount.toLocaleString()}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  loan.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                  loan.status === "APPROVED" ? "bg-green-100 text-green-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {loan.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm">{new Date(loan.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
