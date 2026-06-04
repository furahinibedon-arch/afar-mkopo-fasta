
'use client';
import Layout from '@/components/Layout';

export default function AnalyticsDashboard() {
  const stats = [
    { label: 'Total Disbursed', value: 'Ksh 800,000', color: 'blue' },
    { label: 'Total Repaid', value: 'Ksh 250,000', color: 'green' },
    { label: 'Outstanding Balance', value: 'Ksh 550,000', color: 'purple' },
    { label: 'Active Borrowers', value: '12', color: 'yellow' },
  ];

  const borrowers = [
    { name: 'John Doe', outstanding: 50000, dueDate: '2026-07-01', status: 'current' },
    { name: 'Jane Smith', outstanding: 30000, dueDate: '2026-06-15', status: 'overdue' },
    { name: 'Bob Johnson', outstanding: 100000, dueDate: '2026-08-01', status: 'current' },
  ];

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Financial overview and reporting.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-sm font-semibold text-gray-600">{stat.label}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Individual Debtor Ledger</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Borrower</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Outstanding</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Due Date</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {borrowers.map((borrower, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-4 text-gray-800">{borrower.name}</td>
                    <td className="py-4 font-semibold text-gray-800">Ksh {borrower.outstanding.toLocaleString()}</td>
                    <td className="py-4 text-gray-600">{borrower.dueDate}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        borrower.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {borrower.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Payment Aging Report</h2>
          <div className="space-y-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800">Current (0-30 days)</span>
                <span className="font-bold text-gray-800">10 loans</span>
              </div>
              <p className="text-gray-600 text-sm">Total: Ksh 450,000</p>
            </div>
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800">31-60 days overdue</span>
                <span className="font-bold text-gray-800">2 loans</span>
              </div>
              <p className="text-gray-600 text-sm">Total: Ksh 100,000</p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800">60+ days overdue</span>
                <span className="font-bold text-gray-800">0 loans</span>
              </div>
              <p className="text-gray-600 text-sm">Total: Ksh 0</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Profit and Loss Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 p-6 rounded-xl">
            <h3 className="text-sm font-semibold text-green-700">Expected Interest</h3>
            <p className="text-2xl font-bold text-green-800">Ksh 120,000</p>
          </div>
          <div className="bg-red-50 p-6 rounded-xl">
            <h3 className="text-sm font-semibold text-red-700">Bad Debts (Expected)</h3>
            <p className="text-2xl font-bold text-red-800">Ksh 0</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl">
            <h3 className="text-sm font-semibold text-blue-700">Net Profit (Expected)</h3>
            <p className="text-2xl font-bold text-blue-800">Ksh 120,000</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
