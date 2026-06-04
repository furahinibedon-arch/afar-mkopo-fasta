
'use client';
import { useState } from 'react';
import Layout from '@/components/Layout';

interface LoanApplication {
  id: string;
  borrowerName: string;
  amount: number;
  period: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

const sampleLoans: LoanApplication[] = [
  {
    id: '1',
    borrowerName: 'John Doe',
    amount: 50000,
    period: 12,
    purpose: 'Business expansion',
    status: 'pending',
    date: '2026-06-01'
  },
  {
    id: '2',
    borrowerName: 'Jane Smith',
    amount: 30000,
    period: 6,
    purpose: 'School fees',
    status: 'pending',
    date: '2026-06-02'
  }
];

export default function AdminLoanReview() {
  const [loans, setLoans] = useState<LoanApplication[]>(sampleLoans);

  const handleApprove = (id: string) => {
    setLoans(loans.map(loan => 
      loan.id === id ? { ...loan, status: 'approved' } : loan
    ));
  };

  const handleReject = (id: string) => {
    setLoans(loans.map(loan => 
      loan.id === id ? { ...loan, status: 'rejected' } : loan
    ));
  };

  const pendingLoans = loans.filter(l => l.status === 'pending');
  const approvedLoans = loans.filter(l => l.status === 'approved');
  const rejectedLoans = loans.filter(l => l.status === 'rejected');

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Loan Management</h1>
        <p className="text-gray-600">Review and manage loan applications from borrowers.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-400">
          <h3 className="text-sm font-semibold text-gray-600">Pending Review</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{pendingLoans.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-400">
          <h3 className="text-sm font-semibold text-gray-600">Approved</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{approvedLoans.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-400">
          <h3 className="text-sm font-semibold text-gray-600">Rejected</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{rejectedLoans.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Loan Applications</h2>
        <div className="space-y-6">
          {loans.map(loan => (
            <div key={loan.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">{loan.borrowerName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      loan.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      loan.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {loan.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>Amount:</strong> Ksh {loan.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p><strong>Period:</strong> {loan.period} months</p>
                    </div>
                    <div>
                      <p><strong>Date:</strong> {loan.date}</p>
                    </div>
                    <div>
                      <p><strong>Purpose:</strong> {loan.purpose}</p>
                    </div>
                  </div>
                </div>
                {loan.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(loan.id)}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(loan.id)}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
