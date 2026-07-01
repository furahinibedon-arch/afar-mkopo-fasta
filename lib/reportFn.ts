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
  //  PAGE 1: Cover 
  let y = 0;
  hdr(doc, pw, data.period);
  y = 22;
  doc.setFillColor(...RP);
  doc.rect(0, y, pw, 58, 'F');
  doc.setFillColor(...RA);
  doc.rect(0, y + 58, pw, 3, 'F');
  doc.setFontSize(22); doc.setFont('helvetica', 'bold'); doc.setTextColor(...RW);
  doc.text('LOAN PORTFOLIO', pw / 2, y + 20, { align: 'center' });
  doc.text('REPORT', pw / 2, y + 35, { align: 'center' });
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text(data.period, pw / 2, y + 48, { align: 'center' });
  doc.setFontSize(8); doc.setTextColor(...RS);
  doc.text('Generated: ' + data.generatedAt, pw / 2, y + 57, { align: 'center' });

  y = 95;
  const kw = (pw - 28 - 9) / 4;
  const kh = 22;
  [
    ['Total Loans',       String(loans.length),        RL, RP],
    ['Total Principal',   rfmt(totPrincipal),          RL, RP],
    ['Total Repaid',      rfmt(totRepaid),             RL, RG],
    ['Outstanding',       rfmt(totOutstanding),        RL, RA],
    ['Active Loans',      String(active.length),       RL, RG],
    ['Pending',           String(pending.length),      RL, RA],
    ['Defaulted',         String(defaulted.length),    RL, RR],
    ['Collection Rate',   colRate + '%',               RL, RG],
  ].forEach((item, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    kpi(doc, 14 + col * (kw + 3), y + row * (kh + 3), kw, kh,
        item[0] as string, item[1] as string,
        item[2] as [number,number,number], item[3] as [number,number,number]);
  });

  ftr(doc, pw, ph, 1, PAGES, data.period);

  //  PAGE 2: Summary Stats 
  doc.addPage();
  hdr(doc, pw, data.period);
  y = banner(doc, 20, pw, 'FINANCIAL SUMMARY');

  const summaryRows = [
    ['Total Loans Recorded',         String(loans.length),       ''],
    ['Active (Disbursed)',            String(active.length),      rfmt(totOutstanding)],
    ['Pending / Approved',           String(pending.length),     ''],
    ['Fully Repaid',                 String(repaid.length),      rfmt(totRepaid)],
    ['Rejected',                     String(rejected.length),    ''],
    ['Defaulted',                    String(defaulted.length),   ''],
    ['Total Principal Disbursed',    '',                          rfmt(totPrincipal)],
    ['Total Interest Expected',      '',                          rfmt(totInterest)],
    ['Average Interest Rate',        '',                          avgRate.toFixed(1) + '%'],
    ['Collection Rate',              '',                          colRate + '%'],
    ['Company Balance',              '',                          rfmt(data.companyBalance || 0)],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Count', 'Amount']],
    body: summaryRows,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: RP, textColor: RW, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: RL },
  });

  ftr(doc, pw, ph, 2, PAGES, data.period);

  //  PAGE 3: All Loans Table 
  doc.addPage();
  hdr(doc, pw, data.period);
  y = banner(doc, 20, pw, 'ALL LOANS');

  autoTable(doc, {
    startY: y,
    head: [['#', 'Borrower', 'Phone', 'Amount', 'Rate', 'Period', 'Total', 'Status', 'Date']],
    body: loans.slice(0, 50).map((l: any, i: number) => [
      i + 1,
      bname(l),
      l.borrower?.phone || '',
      rfmt(Number(l.amount)),
      Number(l.interestRate) + '%',
      l.repaymentPeriod + 'd',
      rfmt(Number(l.totalAmount)),
      l.status,
      new Date(l.createdAt).toLocaleDateString(),
    ]),
    margin: { left: 14, right: 14 },
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: RP, textColor: RW, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: RL },
    columnStyles: { 0: { cellWidth: 8 }, 7: { fontStyle: 'bold' } },
  });

  ftr(doc, pw, ph, 3, PAGES, data.period);

  //  PAGE 4: Active Loans 
  doc.addPage();
  hdr(doc, pw, data.period);
  y = banner(doc, 20, pw, 'ACTIVE LOANS (DISBURSED)');

  autoTable(doc, {
    startY: y,
    head: [['#', 'Borrower', 'Phone', 'Principal', 'Total Due', 'Disbursed Date']],
    body: active.map((l: any, i: number) => [
      i + 1, bname(l), l.borrower?.phone || '',
      rfmt(Number(l.amount)), rfmt(Number(l.totalAmount)),
      l.disbursedAt ? new Date(l.disbursedAt).toLocaleDateString() : '-',
    ]),
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: RG, textColor: RW, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: RL },
  });

  ftr(doc, pw, ph, 4, PAGES, data.period);

  //  PAGE 5: Pending Loans 
  doc.addPage();
  hdr(doc, pw, data.period);
  y = banner(doc, 20, pw, 'PENDING / AWAITING APPROVAL');

  autoTable(doc, {
    startY: y,
    head: [['#', 'Borrower', 'Phone', 'Amount', 'Purpose', 'Applied']],
    body: pending.map((l: any, i: number) => [
      i + 1, bname(l), l.borrower?.phone || '',
      rfmt(Number(l.amount)),
      (l.purpose || '').slice(0, 40),
      new Date(l.createdAt).toLocaleDateString(),
    ]),
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: RA, textColor: RW, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: RL },
  });

  ftr(doc, pw, ph, 5, PAGES, data.period);

  //  PAGE 6: Repaid Loans 
  doc.addPage();
  hdr(doc, pw, data.period);
  y = banner(doc, 20, pw, 'REPAID LOANS');

  autoTable(doc, {
    startY: y,
    head: [['#', 'Borrower', 'Phone', 'Principal', 'Total Repaid', 'Date']],
    body: repaid.map((l: any, i: number) => [
      i + 1, bname(l), l.borrower?.phone || '',
      rfmt(Number(l.amount)), rfmt(Number(l.totalAmount)),
      new Date(l.updatedAt || l.createdAt).toLocaleDateString(),
    ]),
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: RG, textColor: RW, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: RL },
  });

  ftr(doc, pw, ph, 6, PAGES, data.period);

  //  PAGE 7: Defaulted 
  doc.addPage();
  hdr(doc, pw, data.period);
  y = banner(doc, 20, pw, 'DEFAULTED LOANS');

  if (defaulted.length === 0) {
    doc.setFontSize(10); doc.setTextColor(...RS);
    doc.text('No defaulted loans in this period.', pw / 2, 60, { align: 'center' });
  } else {
    autoTable(doc, {
      startY: y,
      head: [['#', 'Borrower', 'Phone', 'Amount', 'Total Due', 'Date']],
      body: defaulted.map((l: any, i: number) => [
        i + 1, bname(l), l.borrower?.phone || '',
        rfmt(Number(l.amount)), rfmt(Number(l.totalAmount)),
        new Date(l.createdAt).toLocaleDateString(),
      ]),
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: RR, textColor: RW, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: RL },
    });
  }

  ftr(doc, pw, ph, 7, PAGES, data.period);

  const _b=doc.output('blob');const _u=URL.createObjectURL(_b);window.open(_u,'_blank');
}

export interface CompanyReportData { loans: any[]; financialLogs: any[]; period: string; generatedAt: string; companyBalance: number; }

export function generateCompanyReportPDF(data: CompanyReportData) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.width;
  const ph = doc.internal.pageSize.height;
  const loans: any[] = data.loans || [];
  const logs: any[] = data.financialLogs || [];
  const capital = logs.filter(l=>l.type==='CREDIT'&&(l.reference==='CAPITAL'||l.reference==='MANUAL')).reduce((s,l)=>s+Number(l.amount),0);
  const repaidIn = logs.filter(l=>l.type==='CREDIT'&&(String(l.reference||'').startsWith('REPAY_')||String(l.reference||'').startsWith('LOAN_REPAY_'))).reduce((s,l)=>s+Number(l.amount),0);
  const disbursed = logs.filter(l=>l.type==='DEBIT'&&String(l.reference||'').startsWith('LOAN_DISBURSE_')).reduce((s,l)=>s+Number(l.amount),0);
  const expenses = logs.filter(l=>l.type==='DEBIT'&&!String(l.reference||'').startsWith('LOAN_DISBURSE_')).reduce((s,l)=>s+Number(l.amount),0);
  const totalIn = logs.filter(l=>l.type==='CREDIT').reduce((s,l)=>s+Number(l.amount),0);
  const totalOut = logs.filter(l=>l.type==='DEBIT').reduce((s,l)=>s+Number(l.amount),0);
  const interest = Math.max(0,repaidIn-disbursed);
  const active = loans.filter(l=>l.status==='DISBURSED').length;
  const repaid = loans.filter(l=>l.status==='REPAID').length;
  const defaulted = loans.filter(l=>l.status==='DEFAULTED').length;
  hdr(doc,pw,data.period);
  let y=22;
  doc.setFillColor(...RP);doc.rect(0,y,pw,60,'F');
  doc.setFillColor(...RA);doc.rect(0,y+60,pw,3,'F');
  doc.setFontSize(20);doc.setFont('helvetica','bold');doc.setTextColor(...RW);
  doc.text('COMPANY FINANCIAL',pw/2,y+18,{align:'center'});
  doc.text('REPORT',pw/2,y+32,{align:'center'});
  doc.setFontSize(10);doc.setFont('helvetica','normal');
  doc.text(data.period,pw/2,y+46,{align:'center'});
  doc.setFontSize(8);doc.setTextColor(...RS);
  doc.text('Generated: '+data.generatedAt,pw/2,y+57,{align:'center'});
  y=96;
  const kw=(pw-28-9)/4;const kh=22;
  [['Capital Invested',rfmt(capital),RL,RP],['Total Disbursed',rfmt(disbursed),RL,[124,58,237]],['Repayments In',rfmt(repaidIn),RL,RG],['Interest Earned',rfmt(interest),RL,RA],['Other Expenses',rfmt(expenses),RL,RR],['Net Balance',rfmt(data.companyBalance),RL,RP],['Active Loans',String(active),RL,RG],['Repaid Loans',String(repaid),RL,RP]].forEach((item,i)=>{
    const col=i%4;const row=Math.floor(i/4);
    kpi(doc,14+col*(kw+3),y+row*(kh+3),kw,kh,item[0] as string,item[1] as string,item[2] as [number,number,number],item[3] as [number,number,number]);
  });
  ftr(doc,pw,ph,1,3,data.period);
  doc.addPage();
  hdr(doc,pw,data.period);
  y=banner(doc,20,pw,'PROFIT & LOSS SUMMARY');
  const plRows=[
    ['Capital Invested (IN)','+',rfmt(capital),'Funds added as capital'],
    ['Customer Repayments (IN)','+',rfmt(repaidIn),'Cash received from borrowers'],
    ['Total Credited','+',rfmt(totalIn),'All money in'],
    ['Loans Disbursed (OUT)','-',rfmt(disbursed),'Money given to borrowers'],
    ['Other Expenses (OUT)','-',rfmt(expenses),'Operating expenses'],
    ['Total Debited','-',rfmt(totalOut),'All money out'],
    ['Interest Earned','+',rfmt(interest),'Repayments minus principal'],
    ['Current Balance','=',rfmt(data.companyBalance),'Available cash'],
  ];
  autoTable(doc,{startY:y,head:[['Item','+/-','Amount (TZS)','Notes']],body:plRows,margin:{left:14,right:14},styles:{fontSize:9,cellPadding:3},headStyles:{fillColor:RP,textColor:RW,fontStyle:'bold'},alternateRowStyles:{fillColor:RL},columnStyles:{1:{halign:'center',fontStyle:'bold'},2:{halign:'right',fontStyle:'bold'}}});
  ftr(doc,pw,ph,2,3,data.period);
  doc.addPage();
  hdr(doc,pw,data.period);
  y=banner(doc,20,pw,'LOAN PORTFOLIO');
  autoTable(doc,{startY:y,head:[['#','Borrower','Principal','Total Due','Rate','Status','Date']],body:loans.slice(0,60).map((l: any,i: number)=>[i+1,bname(l),rfmt(Number(l.amount)),rfmt(Number(l.totalAmount)),Number(l.interestRate)+'%',l.status,new Date(l.createdAt).toLocaleDateString()]),margin:{left:14,right:14},styles:{fontSize:7,cellPadding:2},headStyles:{fillColor:RP,textColor:RW,fontStyle:'bold'},alternateRowStyles:{fillColor:RL},columnStyles:{0:{cellWidth:8},5:{fontStyle:'bold'}}});
  ftr(doc,pw,ph,3,3,data.period);
  const _b=doc.output('blob');const _u=URL.createObjectURL(_b);window.open(_u,'_blank');
}

export interface ClientReportData {
  borrower: any;
  loans: any[];
  summary: any;
  period: string;
  generatedAt: string;
}

export function generateClientReportPDF(data: ClientReportData) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.width;
  const ph = doc.internal.pageSize.height;
  const loans: any[] = data.loans || [];
  const bp = data.borrower?.borrowerProfile || {};

  hdr(doc, pw, data.period);
  let y = banner(doc, 20, pw, 'CLIENT REPORT');

  // Borrower details table
  autoTable(doc, {
    startY: y,
    head: [['Field', 'Details']],
    body: [
      ['Full Name', (data.borrower?.firstName || '') + ' ' + (data.borrower?.lastName || '')],
      ['Phone', data.borrower?.phone || '-'],
      ['Email', data.borrower?.email || '-'],
      ['NIN', bp.nin || '-'],
      ['Region', bp.region || '-'],
      ['District', bp.district || '-'],
      ['Address', bp.address || '-'],
      ['Business', bp.businessName || '-'],
      ['Business Location', bp.businessLocation || '-'],
    ],
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: RP, textColor: RW, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: RL },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
  });

  y = (doc as any).lastAutoTable.finalY + 10;
  y = sub(doc, y, pw, 'LOAN SUMMARY');

  // KPI row
  const kw = (pw - 28 - 9) / 4;
  const kh = 22;
  kpi(doc, 14,            y, kw, kh, 'Total Loans',   String(data.summary?.total || 0),                  RL, RP);
  kpi(doc, 14 + kw + 3,  y, kw, kh, 'Total Borrowed', rfmt(data.summary?.totalBorrowed || 0),            RL, RP);
  kpi(doc, 14 + (kw+3)*2,y, kw, kh, 'Total Repaid',   rfmt(data.summary?.totalRepaid || 0),              RL, RG);
  kpi(doc, 14 + (kw+3)*3,y, kw, kh, 'Outstanding',    rfmt(data.summary?.outstanding || 0),              RL, RA);
  y += kh + 10;

  // Loan history table
  autoTable(doc, {
    startY: y,
    head: [['#', 'Amount', 'Total Due', 'Rate', 'Period', 'Status', 'Date']],
    body: loans.map((l: any, i: number) => [
      i + 1,
      rfmt(Number(l.amount)),
      rfmt(Number(l.totalAmount)),
      Number(l.interestRate) + '%',
      l.repaymentPeriod + 'd',
      l.status,
      new Date(l.createdAt).toLocaleDateString(),
    ]),
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: RP, textColor: RW, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: RL },
    columnStyles: { 5: { fontStyle: 'bold' } },
  });

  ftr(doc, pw, ph, 1, 1, data.period);
  const _b = doc.output('blob');
  const _u = URL.createObjectURL(_b);
  window.open(_u, '_blank');
}

export interface OfficerReportData {
  officer: any;
  loans: any[];
  actions: any[];
  summary: any;
  period: string;
  generatedAt: string;
}

export function generateOfficerReportPDF(data: OfficerReportData) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.width;
  const ph = doc.internal.pageSize.height;
  const loans: any[] = data.loans || [];

  hdr(doc, pw, data.period);
  let y = banner(doc, 20, pw, 'OFFICER PERFORMANCE REPORT');

  // Officer info
  autoTable(doc, {
    startY: y,
    head: [['Field', 'Details']],
    body: [
      ['Name', (data.officer?.firstName || '') + ' ' + (data.officer?.lastName || '')],
      ['Phone', data.officer?.phone || '-'],
      ['Role', (data.officer?.role || '').replace('_', ' ')],
    ],
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: RP, textColor: RW, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: RL },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // KPI row
  const kw = (pw - 28 - 9) / 4;
  const kh = 22;
  kpi(doc, 14,             y, kw, kh, 'Loans Handled', String(data.summary?.totalLoans || 0), RL, RP);
  kpi(doc, 14 + kw + 3,   y, kw, kh, 'Total Value',   rfmt(data.summary?.totalValue || 0),  RL, RP);
  kpi(doc, 14 + (kw+3)*2, y, kw, kh, 'Approved',      String(data.summary?.approved || 0),  RL, RG);
  kpi(doc, 14 + (kw+3)*3, y, kw, kh, 'Rejected',      String(data.summary?.rejected || 0),  RL, RR);
  y += kh + 10;

  // Loans table
  autoTable(doc, {
    startY: y,
    head: [['#', 'Client', 'Phone', 'Amount', 'Status', 'Decision', 'Date']],
    body: loans.map((l: any, i: number) => {
      const action = data.actions?.find((a: any) => a.loanId === l.id);
      return [
        i + 1,
        (l.borrower?.firstName || '') + ' ' + (l.borrower?.lastName || ''),
        l.borrower?.phone || '',
        rfmt(Number(l.amount)),
        l.status,
        action?.action || '-',
        action ? new Date(action.createdAt).toLocaleDateString() : '-',
      ];
    }),
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: RP, textColor: RW, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: RL },
    columnStyles: { 4: { fontStyle: 'bold' } },
  });

  ftr(doc, pw, ph, 1, 1, data.period);
  const _b = doc.output('blob');
  const _u = URL.createObjectURL(_b);
  window.open(_u, '_blank');
}
