
"use client";
export default function AdminLoanReview() {
  const loans = [
    {
      id: "LN001",
      borrower: { name: "John Doe", idNumber: "12345678", phone: "0712345678" },
      amount: 50000,
      status: "PENDING",
      purpose: "Business Expansion",
    },
    {
      id: "LN002",
      borrower: { name: "Jane Smith", idNumber: "87654321", phone: "0723456789" },
      amount: 30000,
      status: "APPROVED",
      purpose: "School Fees",
    },
  ];

  const handleAction = (loanId, action) => {
    console.log(`Loan ${loanId} ${action}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel - Loan Review</h1>
          <nav className="flex gap-4">
            <a href="/admin/analytics" className="text-gray-600">Analytics</a>
            <a href="/admin/loans" className="text-blue-600 font-medium">Loan Review</a>
            <a href="/" className="text-gray-600">Logout</a>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borrower
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {loan.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>{loan.borrower.name}</div>
                    <div className="text-gray-500 text-xs">{loan.borrower.phone}</div>
                    <div className="text-gray-500 text-xs">ID: {loan.borrower.idNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {loan.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{loan.purpose}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      loan.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                      loan.status === "APPROVED" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {loan.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(loan.id, "APPROVE")}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(loan.id, "REJECT")}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
