
"use client";
export default function AnalyticsDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Management Dashboard</h1>
          <nav className="flex gap-4">
            <a href="/admin/analytics" className="text-blue-600 font-medium">Analytics</a>
            <a href="/admin/loans" className="text-gray-600">Loan Review</a>
            <a href="/" className="text-gray-600">Logout</a>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Disbursed" value="1,250,000" color="blue" />
          <StatCard title="Total Repaid" value="890,500" color="green" />
          <StatCard title="Current Balance" value="359,500" color="purple" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Individual Debts (Ledger)</h2>
            <DebtLedger />
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Aging / Arrears</h2>
            <AgingReport />
          </div>
        </div>
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Profit & Loss</h2>
          <ProfitLoss />
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, color }) {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
  };
  return (
    <div className={`border rounded-xl p-6 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function DebtLedger() {
  const debtors = [
    { name: "John Doe", phone: "0712345678", amount: 50000, dueDate: "2024-12-15" },
    { name: "Jane Smith", phone: "0723456789", amount: 35000, dueDate: "2024-12-20" },
    { name: "Bob Johnson", phone: "0734567890", amount: 80000, dueDate: "2024-12-25" },
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-3">Name</th>
            <th className="text-left py-2 px-3">Phone</th>
            <th className="text-left py-2 px-3">Outstanding</th>
            <th className="text-left py-2 px-3">Due Date</th>
          </tr>
        </thead>
        <tbody>
          {debtors.map((d, i) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              <td className="py-2 px-3">{d.name}</td>
              <td className="py-2 px-3">{d.phone}</td>
              <td className="py-2 px-3 font-medium">{d.amount.toLocaleString()}</td>
              <td className="py-2 px-3">{d.dueDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AgingReport() {
  const overdue = [
    { name: "John Doe", phone: "0712345678", amount: 15000, daysOverdue: 15 },
    { name: "Bob Johnson", phone: "0734567890", amount: 20000, daysOverdue: 7 },
  ];
  return (
    <div className="space-y-4">
      {overdue.map((item, i) => (
        <div key={i} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-gray-600">{item.phone}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-red-700">{item.amount.toLocaleString()}</p>
            <p className="text-xs text-red-600">{item.daysOverdue} days overdue</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfitLoss() {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <h3 className="font-medium mb-3 text-green-700">Expected Profit (Interest)</h3>
        <div className="space-y-2">
          <div className="flex justify-between"><span>Total Interest Earned</span><span>187,500</span></div>
          <div className="flex justify-between"><span>Projected Interest</span><span>53,925</span></div>
        </div>
      </div>
      <div>
        <h3 className="font-medium mb-3 text-red-700">Losses (Bad Debts)</h3>
        <div className="space-y-2">
          <div className="flex justify-between"><span>Written Off</span><span>35,000</span></div>
          <div className="flex justify-between"><span>At Risk</span><span>20,000</span></div>
        </div>
      </div>
    </div>
  );
}
