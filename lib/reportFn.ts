import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface LoanReportData {
  loans: any[];
  period: string;
  generatedAt: string;
  companyBalance?: number;
}

// ── Palette ──────────────────────────────────────────────────────────────
const RP: [number,number,number] = [13, 71, 161];
const RA: [number,number,number] = [245,158,  11];
const RW: [number,number,number] = [255,255, 255];
const RG: [number,number,number] = [ 22,163,  74];
const RR: [number,number,number] = [220, 38,  38];
const RS: [number,number,number] = [100,116, 139];
const RL: [number,number,number] = [241,245, 249];
const RD: [number,number,number] = [ 30, 41,  59];

function rfmt(n: number) {
  return 'TZS ' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(Math.round(n));
}
function bname(l: any) {
  return ((l.borrower?.firstName || '') + ' ' + (l.borrower?.lastName || '')).trim();
}

function hdr(doc: jsPDF, pw: number, right: string) {
  doc.setFillColor(...RP); doc.rect(0, 0, pw, 12, 'F');
  doc.setFillColor(...RA); doc.rect(0, 12, pw, 2, 'F');
  doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...RW);
  doc.text('AFAR MKOPO FASTA', 14, 8);
  doc.text(right, pw - 14, 8, { align: 'right' });
}
function ftr(doc: jsPDF, pw: number, ph: number, pg: number, tot: number, per: string) {
  doc.setFillColor(...RL); doc.rect(0, ph - 11, pw, 11, 'F');
  doc.setDrawColor(200, 210, 220); doc.line(0, ph - 11, pw, ph - 11);
  doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(...RS);
  doc.text('AFAR MKOPO FASTA  |  Mbeya, Tanzania  |  +255 741 525 547', 14, ph - 4);
  doc.text(per, pw / 2, ph - 4, { align: 'center' });
  doc.text('Page ' + pg + ' of ' + tot, pw - 14, ph - 4, { align: 'right' });
}
function banner(doc: jsPDF, y: number, pw: number, txt: string): number {
  doc.setFillColor(...RP); doc.roundedRect(14, y, pw - 28, 11, 2, 2, 'F');
  doc.setFillColor(...RA); doc.roundedRect(14, y, 5, 11, 2, 2, 'F'); doc.rect(17, y, 2, 11, 'F');
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...RW);
  doc.text(txt, 23, y + 8); doc.setTextColor(0, 0, 0);
  return y + 17;
}
function sub(doc: jsPDF, y: number, pw: number, txt: string): number {
  doc.setFillColor(...RL); doc.rect(14, y, pw - 28, 9, 'F');
  doc.setDrawColor(180, 190, 200); doc.setLineWidth(0.3); doc.line(14, y + 9, pw - 14, y + 9);
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...RD);
  doc.text(txt, 18, y + 6.5); doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'normal');
  return y + 15;
}
function kpi(doc: jsPDF, x: number, y: number, w: number, h: number,
             lbl: string, val: string, bg: [number,number,number], ac: [number,number,number]) {
  doc.setFillColor(...bg); doc.roundedRect(x, y, w, h, 2, 2, 'F');
  doc.setFillColor(...ac); doc.roundedRect(x, y, w, 2.5, 2, 0, 'F'); doc.rect(x + 2, y, w - 4, 2.5, 'F');
  const lb = doc.splitTextToSize(lbl.toUpperCase(), w - 5);
  doc.setFontSize(6); doc.setFont('helvetica', 'bold'); doc.setTextColor(...RS);
  doc.text(lb, x + 3, y + 7);
  doc.setFontSize(9.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...RD);
  doc.text(val, x + 3, y + h - 5);
}

export function generateLoansReportPDF(data: LoanReportData) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.width;
  const ph = doc.internal.pageSize.height;
  const loans: any[] = data.loans || [];

  const active    = loans.filter((l: any) => l.status === 'DISBURSED');
  const pending   = loans.filter((l: any) => ['PENDING','APPROVED'].includes(l.status));
  const repaid    = loans.filter((l: any) => l.status === 'REPAID');
  const rejected  = loans.filter((l: any) => l.status === 'REJECTED');
  const defaulted = loans.filter((l: any) => l.status === 'DEFAULTED');

  const totPrincipal   = loans.reduce((s: number, l: any) => s + Number(l.amount), 0);
  const totOutstanding = active.reduce((s: number, l: any) => s + Number(l.totalAmount), 0);
  const totRepaid      = repaid.reduce((s: number, l: any) => s + Number(l.totalAmount), 0);
  const totDisbursed   = loans.filter((l: any) => ['DISBURSED','REPAID','DEFAULTED'].includes(l.status))
                              .reduce((s: number, l: any) => s + Number(l.amount), 0);
  const totInterest    = loans.reduce((s: number, l: any) => s + (Number(l.totalAmount) - Number(l.amount)), 0);
  const avgRate        = loans.length ? loans.reduce((s: number, l: any) => s + Number(l.interestRate), 0) / loans.length : 0;
  const colRate        = totDisbursed > 0 ? Math.round((totRepaid / totDisbursed) * 100) : 0;
  const PAGES          = 7;
