const fs = require("fs");
const p1 = `

export interface LoanReportData {
  loans: any[];
  period: string;
  generatedAt: string;
  companyBalance?: number;
}

export function generateLoansReportPDF(data: LoanReportData) {
  const RP: [number,number,number] = [13,71,161];
  const RA: [number,number,number] = [245,158,11];
  const RW: [number,number,number] = [255,255,255];
  const RG: [number,number,number] = [22,163,74];
  const RR: [number,number,number] = [220,38,38];
  const RS: [number,number,number] = [100,116,139];
  const RL: [number,number,number] = [241,245,249];
  const RD: [number,number,number] = [30,41,59];

  const loans: any[] = data.loans || [];
  const period = data.period || "Annual";
  const generatedAt = data.generatedAt || new Date().toLocaleString();
  const W = 210, H = 297;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const TotalPages = 7;

  //  computed metrics 
  const totalLoans = loans.length;
  const totalPrincipal = loans.reduce((s, l) => s + (Number(l.amount) || 0), 0);
  const totalRepayable = loans.reduce((s, l) => s + (Number(l.totalAmount) || 0), 0);
  const repaidLoans   = loans.filter(l => l.status === "REPAID");
  const activeLoans   = loans.filter(l => l.status === "DISBURSED");
  const pendingLoans  = loans.filter(l => l.status === "PENDING");
  const approvedLoans = loans.filter(l => l.status === "APPROVED");
  const defaultedLoans = loans.filter(l => l.status === "DEFAULTED");
  const rejectedLoans  = loans.filter(l => l.status === "REJECTED");
  const totalRepaid   = repaidLoans.reduce((s, l) => s + (Number(l.totalAmount) || 0), 0);
  const outstanding   = activeLoans.reduce((s, l) => s + (Number(l.totalAmount) || 0), 0);
  const collectionRate = totalRepayable > 0 ? (totalRepaid / totalRepayable) * 100 : 0;
  const avgInterest    = totalLoans > 0
    ? loans.reduce((s, l) => s + (Number(l.interestRate) || 0), 0) / totalLoans
    : 0;

  const byStatus: Record<string, number> = {};
  loans.forEach(l => { byStatus[l.status] = (byStatus[l.status] || 0) + 1; });
`;
fs.appendFileSync("lib/pdfGenerator.ts", p1, "utf8");
console.log("p1 done");
