import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface LoanApplicationData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  address?: string;
  houseNumber?: string;
  spouseName?: string;
  phone?: string;
  nin?: string; // NIDA Number
  country?: string;
  region?: string;
  district?: string;
  businessName?: string;
  businessLocation?: string;
  businessSince?: string;
  loanPurpose?: string;
  loanAmount?: number;
  loanAmountWords?: string;
  dailyPayment?: number;
  interestRate?: number;
  guarantor1Name?: string;
  guarantor1Address?: string;
  guarantor1HouseNumber?: string;
  guarantor1Business?: string;
  guarantor1Relationship?: string;
  guarantor1Phone?: string;
  guarantor1Collateral?: string;
  guarantor2Name?: string;
  guarantor2Address?: string;
  guarantor2HouseNumber?: string;
  guarantor2Business?: string;
  guarantor2Relationship?: string;
  guarantor2Phone?: string;
  guarantor2Collateral?: string;
  profilePictureUrl?: string;
}

const COMPANY_DETAILS = {
  parentCompany: 'Helder Company',
  tradingName: 'Afar Mkopo Fasta',
  address: 'Mbeya, Tanzania',
  phone: '0741525547',
  motto: 'PATA MKOPO WAKO FASTA'
};

export function generateLoanApplicationPDF(data: LoanApplicationData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;

  // ===========================================
  // HEADER WITH COMPANY LOGO
  // ===========================================
  
  // Header background - light gray
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, 70, 'F');

  // Company Logo - small, fits perfectly
  const logoX = 15;
  const logoY = 10;
  const logoSize = 50;

  // Try to add logo
  try {
    doc.addImage('/logo.png', 'PNG', logoX, logoY, logoSize, logoSize);
  } catch (e) {
    // Simple fallback circle
    doc.setFillColor(30, 58, 95);
    doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 'F');
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11);
    doc.text('AF', logoX + logoSize/2, logoY + logoSize/2 + 8, { align: 'center' });
  }

  // Content to the right of logo
  const contentX = logoX + logoSize + 12;
  let currentY = 18;

  // Company Name - big, bold
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 95);
  doc.text(COMPANY_DETAILS.tradingName.toUpperCase(), contentX, currentY);
  
  currentY += 10;
  
  // Parent company - small
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text(`A division of ${COMPANY_DETAILS.parentCompany}`, contentX, currentY);
  
  currentY += 10;
  
  // Location and contact on same line
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Location:', contentX, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY_DETAILS.address, contentX + 28, currentY);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Contact:', contentX + 90, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY_DETAILS.phone, contentX + 118, currentY);
  
  currentY += 10;
  
  // Motto
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 95);
  doc.text(COMPANY_DETAILS.motto, contentX, currentY);
  
  yPosition = 75;
  
  // Add a decorative line
  yPosition += 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  
  yPosition += 15;
  doc.setTextColor(0, 0, 0);

  // Document Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 95);
  doc.text('LOAN APPLICATION FORM', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 6;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 80, 80);
  doc.text('FOMU YA MAOMBI YA MKOPO', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  doc.setTextColor(0, 0, 0);

  // Borrower Photo Section
  if (data.profilePictureUrl) {
    try {
      // Render actual profile picture (supports base64)
      const imgWidth = 40;
      const imgHeight = 40;
      doc.addImage(data.profilePictureUrl, 'PNG', 20, yPosition, imgWidth, imgHeight);
      
      // Add border
      doc.setDrawColor(30, 58, 95);
      doc.setLineWidth(1);
      doc.roundedRect(20, yPosition, imgWidth, imgHeight, 3, 3, 'S');
      
      // Move yPosition
      yPosition += 50;
    } catch (e) {
      // Fallback if image fails to load
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(20, yPosition, 40, 40, 3, 3, 'F');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.text('PHOTO', 40, yPosition + 22, { align: 'center' });
      yPosition += 50;
    }
  }

  // Section 1: Borrower Information
  doc.setFillColor(30, 58, 95);
  doc.rect(14, yPosition - 6, pageWidth - 28, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('01. BORROWER INFORMATION | TAARIFA ZA MKOPAJI', 20, yPosition + 8);
  
  yPosition += 24;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const tableData1 = [
    ['Full Name / Majina kamili:', `${data.firstName || ''} ${data.lastName || ''}`],
    ['NIDA Number (NIN):', data.nin || ''],
    ['Date of Birth / Tarehe ya kuzaliwa:', data.dateOfBirth || ''],
    ['Gender / Jinsia:', data.gender || ''],
    ['Marital Status / Halya ndoa:', data.maritalStatus || ''],
    ['Country / Nchi:', data.country || ''],
    ['Region / Mkoa:', data.region || ''],
    ['District / Wilaya:', data.district || ''],
    ['Residence Address / Sehemu ya makazi/mtaa:', data.address || ''],
    ['House Number / Nyumba no:', data.houseNumber || ''],
    ['Spouse Name / Jina kamili la mwenzi:', data.spouseName || ''],
    ['Phone Number / Namba za simu:', data.phone || ''],
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: tableData1,
    theme: 'striped',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 85, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 16;

  // Section 2: Business Information
  doc.setFillColor(30, 58, 95);
  doc.rect(14, yPosition - 6, pageWidth - 28, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('02. BUSINESS INFORMATION | TAARIFA ZA BIASHARA', 20, yPosition + 8);
  
  yPosition += 24;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const tableData2 = [
    ['Business Type/Name / Aina/jina la biashara:', data.businessName || ''],
    ['Business Location / Mahali pa biashara:', data.businessLocation || ''],
    ['Business Since / Umefanya biashara tangu lini:', data.businessSince || ''],
    ['Loan Purpose / Dhumuni la mkopo:', data.loanPurpose || ''],
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: tableData2,
    theme: 'striped',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 85, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 16;

  // Section 3: Loan Amount
  doc.setFillColor(30, 58, 95);
  doc.rect(14, yPosition - 6, pageWidth - 28, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('03. LOAN DETAILS | KIASI CHA MKOPO', 20, yPosition + 8);
  
  yPosition += 24;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const tableData3 = [
    ['I agree to receive / Mimi Nakubali kupokea:', ''],
    ['Amount (Figures) / Kiasi kwa tarakimu:', data.loanAmount ? `Tsh ${data.loanAmount.toLocaleString()}` : ''],
    ['Amount (Words) / Kiasi kwa maneno:', data.loanAmountWords || ''],
    ['Daily Repayment / Kiasi cha kurejesha kwa siku:', data.dailyPayment ? `Tsh ${data.dailyPayment.toLocaleString()}` : ''],
    ['Interest Rate / Riba ya mkopo:', data.interestRate ? `${data.interestRate}%` : ''],
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: tableData3,
    theme: 'striped',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 85, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 16;

  // Section 4: Loan Terms
  doc.setFillColor(30, 58, 95);
  doc.rect(14, yPosition - 6, pageWidth - 28, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('04. LOAN TERMS | TAARIFA YA MKOPO', 20, yPosition + 8);
  
  yPosition += 24;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const termsData = [
    ['Form Fee (10% of loan) / Gharama ya fomu:', `Tsh ${data.loanAmount ? (data.loanAmount * 0.1).toLocaleString() : '0'}`],
    ['Interest Rate / Riba ya mkopo:', 'Twenty percent (20%) / Asilimia ishirini (20%)'],
    ['Repayment Frequency / Mara ya marejesho:', 'Daily / Kila siku'],
    ['Penalty / Faini:', 'Tsh 1,000/='],
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: termsData,
    theme: 'striped',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 85, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 16;

  // Section 5: First Guarantor
  if (data.guarantor1Name) {
    doc.setFillColor(30, 58, 95);
    doc.rect(14, yPosition - 6, pageWidth - 28, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('05. FIRST GUARANTOR | MDHAMINI WA KWANZA', 20, yPosition + 8);
    
    yPosition += 24;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const tableData4 = [
      ['Guarantor Name / Majina ya mdhamini:', data.guarantor1Name],
      ['Residence / Sehemu ya makazi:', data.guarantor1Address || ''],
      ['House Number / Nyumba no:', data.guarantor1HouseNumber || ''],
      ['Business Location / Sehemu ya biashara:', data.guarantor1Business || ''],
      ['Relationship / Uhusiano wake na mkopaji:', data.guarantor1Relationship || ''],
      ['Phone Number / Namba za simu:', data.guarantor1Phone || ''],
      ['Collateral / Dhamana anazoandikisha:', data.guarantor1Collateral || ''],
    ];
    
    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: tableData4,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 85, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
      },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 16;
  }

  // Section 6: Second Guarantor
  if (data.guarantor2Name) {
    doc.setFillColor(30, 58, 95);
    doc.rect(14, yPosition - 6, pageWidth - 28, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('06. SECOND GUARANTOR | MDHAMINI WA PILI', 20, yPosition + 8);
    
    yPosition += 24;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const tableData5 = [
      ['Guarantor Name / Majina ya mdhamini:', data.guarantor2Name],
      ['Residence / Sehemu ya makazi:', data.guarantor2Address || ''],
      ['House Number / Nyumba no:', data.guarantor2HouseNumber || ''],
      ['Business Location / Sehemu ya biashara:', data.guarantor2Business || ''],
      ['Relationship / Uhusiano wake na mkopaji:', data.guarantor2Relationship || ''],
      ['Phone Number / Namba za simu:', data.guarantor2Phone || ''],
      ['Collateral / Dhamana anazoandikisha:', data.guarantor2Collateral || ''],
    ];
    
    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: tableData5,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 85, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
      },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 16;
  }

  // Add new page for payment schedule if needed
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = 30;
  }
  
  // Payment Schedule
  doc.setFillColor(30, 58, 95);
  doc.rect(14, yPosition - 6, pageWidth - 28, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT SCHEDULE | RUTIBA YA MAREJESHO', 20, yPosition + 8);
  
  yPosition += 24;
  doc.setTextColor(0, 0, 0);
  const scheduleData = [];
  for (let i = 1; i <= 30; i++) {
    scheduleData.push([i, '', 'INSTALMENT', '']);
  }
  
  autoTable(doc, {
    startY: yPosition,
    head: [['NO', 'DATE / TAREHE', 'PAYMENT / REJESHO', 'SIGNATURE / SAHIHI']],
    body: scheduleData,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`Loan_Application_${data.firstName || 'Unknown'}_${data.lastName || 'Unknown'}.pdf`);
}



//  Report PDF helpers 

function _rfmt(n) {
  if (isNaN(n) || n == null) return "Tsh 0";
  return new Intl.NumberFormat("en-TZ", {
    style: "currency", currency: "TZS", minimumFractionDigits: 0,
    notation: Math.abs(n) >= 1000000 ? "compact" : "standard", compactDisplay: "short"
  }).format(n);
}

function _bname(loan) {
  const b = loan && loan.borrower;
  if (!b) return "Unknown";
  return ((b.firstName || "") + " " + (b.lastName || "")).trim() || "Unknown";
}

function _hdr(doc, title, period, pageNum, totalPages, RP, RW, RL, RS) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(RP[0], RP[1], RP[2]);
  doc.rect(0, 0, W, 18, "F");
  doc.setTextColor(RW[0], RW[1], RW[2]);
  doc.setFontSize(11); doc.setFont("helvetica", "bold");
  doc.text("AFAR MKOPO FASTA", 14, 11);
  doc.setFontSize(8); doc.setFont("helvetica", "normal");
  doc.text(title, W / 2, 11, { align: "center" });
  doc.text("Page " + pageNum + " / " + totalPages, W - 14, 11, { align: "right" });
  doc.setFillColor(RL[0], RL[1], RL[2]);
  doc.rect(0, 18, W, 6, "F");
  doc.setTextColor(RS[0], RS[1], RS[2]);
  doc.setFontSize(7);
  doc.text(period, 14, 22);
  doc.text("Annual Company Report", W - 14, 22, { align: "right" });
  doc.setTextColor(0, 0, 0);
}

function _ftr(doc, generatedAt, RS, RL) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  doc.setFillColor(RL[0], RL[1], RL[2]);
  doc.rect(0, H - 10, W, 10, "F");
  doc.setTextColor(RS[0], RS[1], RS[2]);
  doc.setFontSize(7);
  doc.text("AFAR MKOPO FASTA  CONFIDENTIAL", 14, H - 3.5);
  doc.text("Generated: " + generatedAt, W - 14, H - 3.5, { align: "right" });
  doc.setTextColor(0, 0, 0);
}

function _banner(doc, text, y, RP, RW) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(RP[0], RP[1], RP[2]);
  doc.rect(14, y, W - 28, 7, "F");
  doc.setTextColor(RW[0], RW[1], RW[2]);
  doc.setFontSize(9); doc.setFont("helvetica", "bold");
  doc.text(text, 17, y + 5);
  doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "normal");
  return y + 10;
}

function _sub(doc, text, y, RD) {
  doc.setTextColor(RD[0], RD[1], RD[2]);
  doc.setFontSize(9); doc.setFont("helvetica", "bold");
  doc.text(text, 14, y);
  doc.setLineWidth(0.3);
  doc.setDrawColor(200, 200, 200);
  const W = doc.internal.pageSize.getWidth();
  doc.line(14, y + 1.5, W - 14, y + 1.5);
  doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "normal");
  return y + 6;
}

function _kpi(doc, x, y, w, h, label, value, sub, color, RW, RL) {
  doc.setFillColor(RL[0], RL[1], RL[2]);
  doc.roundedRect(x, y, w, h, 2, 2, "F");
  doc.setFillColor(color[0], color[1], color[2]);
  doc.rect(x, y, 2.5, h, "F");
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFontSize(7); doc.setFont("helvetica", "bold");
  doc.text(label.toUpperCase(), x + 5, y + 5);
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.text(value, x + 5, y + 12);
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7); doc.setFont("helvetica", "normal");
  doc.text(sub, x + 5, y + 17);
  doc.setTextColor(0, 0, 0);
}


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

  // 
  // PAGE 1  COVER
  // 
  doc.setFillColor(RP[0], RP[1], RP[2]);
  doc.rect(0, 0, W, H, "F");

  // diagonal accent
  doc.setFillColor(RW[0], RW[1], RW[2]);
  doc.setGState(new (doc as any).GState({ opacity: 0.06 }));
  doc.triangle(0, H * 0.55, W, H * 0.25, W, H, "F");
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // logo circle
  doc.setFillColor(RW[0], RW[1], RW[2]);
  doc.setGState(new (doc as any).GState({ opacity: 0.12 }));
  doc.circle(W - 30, 35, 28, "F");
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  doc.setTextColor(RW[0], RW[1], RW[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.text("AFAR", W / 2, 70, { align: "center" });
  doc.setFontSize(16);
  doc.text("MKOPO FASTA", W / 2, 82, { align: "center" });

  doc.setFillColor(RA[0], RA[1], RA[2]);
  doc.rect(40, 88, W - 80, 0.8, "F");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("ANNUAL COMPANY REPORT", W / 2, 100, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("LOANS PERFORMANCE ANALYSIS", W / 2, 110, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(period, W / 2, 130, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Generated: " + generatedAt, W / 2, 142, { align: "center" });

  // stats strip
  doc.setFillColor(RW[0], RW[1], RW[2]);
  doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
  doc.rect(14, 155, W - 28, 28, "F");
  doc.setGState(new (doc as any).GState({ opacity: 1 }));
  const stats = [
    { label: "Total Loans", value: String(totalLoans) },
    { label: "Total Principal", value: _rfmt(totalPrincipal) },
    { label: "Collection Rate", value: collectionRate.toFixed(1) + "%" },
  ];
  stats.forEach((s, i) => {
    const sx = 14 + (W - 28) / 3 * i + (W - 28) / 6;
    doc.setTextColor(RA[0], RA[1], RA[2]);
    doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text(s.value, sx, 167, { align: "center" });
    doc.setTextColor(RW[0], RW[1], RW[2]);
    doc.setFontSize(7); doc.setFont("helvetica", "normal");
    doc.text(s.label.toUpperCase(), sx, 174, { align: "center" });
  });

  // table of contents
  doc.setFillColor(RW[0], RW[1], RW[2]);
  doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
  doc.rect(14, 192, W - 28, 62, "F");
  doc.setGState(new (doc as any).GState({ opacity: 1 }));
  doc.setTextColor(RA[0], RA[1], RA[2]);
  doc.setFontSize(9); doc.setFont("helvetica", "bold");
  doc.text("TABLE OF CONTENTS", W / 2, 201, { align: "center" });
  doc.setTextColor(RW[0], RW[1], RW[2]);
  doc.setFontSize(8); doc.setFont("helvetica", "normal");
  const toc = [
    "Page 2 ......... Executive Summary",
    "Page 3 ......... Active & Pending Loans",
    "Page 4 ......... Overall Financing Statement",
    "Page 5 ......... Defaulted & Rejected Loans",
    "Page 6 ......... Full Loan Register",
    "Page 7 ......... Performance Metrics & Recommendations",
  ];
  toc.forEach((t, i) => doc.text(t, W / 2, 210 + i * 7, { align: "center" }));

  doc.setTextColor(RW[0], RW[1], RW[2]);
  doc.setFontSize(7);
  doc.text("CONFIDENTIAL  FOR INTERNAL USE ONLY", W / 2, H - 10, { align: "center" });
  doc.setTextColor(0, 0, 0);

  // 
  // PAGE 2  EXECUTIVE SUMMARY
  // 
  doc.addPage();
  _hdr(doc, "Executive Summary", period, 2, TotalPages, RP, RW, RL, RS);
  _ftr(doc, generatedAt, RS, RL);

  let y = 30;
  y = _banner(doc, "KEY PERFORMANCE INDICATORS", y, RP, RW);

  const kpiW = (W - 28 - 8) / 3;
  const kpiH = 22;
  _kpi(doc, 14,       y, kpiW, kpiH, "Total Loans",     String(totalLoans),          "All time count",             RP, RW, RL);
  _kpi(doc, 14+kpiW+4, y, kpiW, kpiH, "Total Principal", _rfmt(totalPrincipal),      "Disbursed capital",          RA, RW, RL);
  _kpi(doc, 14+kpiW*2+8, y, kpiW, kpiH, "Outstanding",   _rfmt(outstanding),         "Active portfolio",           [245,158,11] as [number,number,number], RW, RL);
  y += kpiH + 4;
  _kpi(doc, 14,       y, kpiW, kpiH, "Total Repaid",     _rfmt(totalRepaid),          "Collected revenue",          RG, RW, RL);
  _kpi(doc, 14+kpiW+4, y, kpiW, kpiH, "Collection Rate", collectionRate.toFixed(1)+"%","% of repayable",            RG, RW, RL);
  _kpi(doc, 14+kpiW*2+8, y, kpiW, kpiH, "Avg Interest",  avgInterest.toFixed(1)+"%", "Average rate",              RS, RW, RL);
  y += kpiH + 8;

  // status bar chart
  y = _sub(doc, "Loan Status Distribution", y, RD);
  const statuses = ["PENDING", "APPROVED", "DISBURSED", "REPAID", "DEFAULTED", "REJECTED"];
  const statusColors: [number,number,number][] = [RA, RP, [14,165,233], RG, RR, RS];
  const barW = (W - 28) / statuses.length - 3;
  const maxCount = Math.max(1, ...statuses.map(s => byStatus[s] || 0));
  const chartH = 28;
  statuses.forEach((st, i) => {
    const cnt = byStatus[st] || 0;
    const bh = cnt > 0 ? (cnt / maxCount) * chartH : 1;
    const bx = 14 + i * (barW + 3);
    const col = statusColors[i];
    doc.setFillColor(col[0], col[1], col[2]);
    doc.rect(bx, y + chartH - bh, barW, bh, "F");
    doc.setTextColor(col[0], col[1], col[2]);
    doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text(String(cnt), bx + barW / 2, y + chartH - bh - 1.5, { align: "center" });
    doc.setFontSize(6); doc.setFont("helvetica", "normal");
    doc.setTextColor(RS[0], RS[1], RS[2]);
    doc.text(st, bx + barW / 2, y + chartH + 4, { align: "center" });
  });
  doc.setTextColor(0, 0, 0);
  y += chartH + 10;

  // narrative
  y = _banner(doc, "EXECUTIVE NARRATIVE", y, RP, RW);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(RD[0], RD[1], RD[2]);
  const narrative = [
    "During the period " + period + ", AFAR MKOPO FASTA processed a total of " + totalLoans + " loan applications",
    "representing a combined principal of " + _rfmt(totalPrincipal) + ". The portfolio achieved a collection",
    "rate of " + collectionRate.toFixed(1) + "%, with " + repaidLoans.length + " loans fully repaid and " + activeLoans.length + " currently active.",
    "",
    "Outstanding balance stands at " + _rfmt(outstanding) + ". A total of " + defaultedLoans.length + " loans have",
    "been classified as defaulted, requiring immediate recovery action. " + pendingLoans.length + " applications",
    "are pending review and " + approvedLoans.length + " have been approved awaiting disbursement.",
  ];
  narrative.forEach((line, i) => { doc.text(line, 14, y + i * 5.5); });
  doc.setTextColor(0, 0, 0);

  // 
  // PAGE 3  ACTIVE & PENDING LOANS
  // 
  doc.addPage();
  _hdr(doc, "Active & Pending Loans", period, 3, TotalPages, RP, RW, RL, RS);
  _ftr(doc, generatedAt, RS, RL);

  let y3 = 30;
  y3 = _banner(doc, "ACTIVE / DISBURSED LOANS (" + activeLoans.length + ")", y3, RP, RW);
  autoTable(doc, {
    startY: y3,
    margin: { left: 14, right: 14 },
    head: [["#","Client","Phone","Amount","Total Due","Rate","Period","Officer","Date"]],
    body: activeLoans.length === 0
      ? [["","No active loans in this period","","","","","","",""]]
      : activeLoans.map((l, i) => {
          const off = l.staffActions && l.staffActions[0] && l.staffActions[0].staff
            ? l.staffActions[0].staff.firstName + " " + l.staffActions[0].staff.lastName
            : "";
          return [
            i + 1,
            _bname(l),
            l.borrower && l.borrower.phone ? l.borrower.phone : "",
            _rfmt(Number(l.amount)),
            _rfmt(Number(l.totalAmount)),
            Number(l.interestRate) + "%",
            l.repaymentPeriod + "d",
            off,
            new Date(l.createdAt).toLocaleDateString(),
          ];
        }),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [RP[0], RP[1], RP[2]], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [RL[0], RL[1], RL[2]] },
  });

  const y3b = (doc as any).lastAutoTable.finalY + 8;
  _banner(doc, "PENDING LOANS (" + pendingLoans.length + ")", y3b, RP, RW);
  const y3c = y3b + 10;
  autoTable(doc, {
    startY: y3c,
    margin: { left: 14, right: 14 },
    head: [["#","Client","Phone","Requested","Total","Rate","Period","Date"]],
    body: pendingLoans.length === 0
      ? [["","No pending loans","","","","","",""]]
      : pendingLoans.map((l, i) => [
          i + 1,
          _bname(l),
          l.borrower && l.borrower.phone ? l.borrower.phone : "",
          _rfmt(Number(l.amount)),
          _rfmt(Number(l.totalAmount)),
          Number(l.interestRate) + "%",
          l.repaymentPeriod + "d",
          new Date(l.createdAt).toLocaleDateString(),
        ]),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [RA[0], RA[1], RA[2]], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [RL[0], RL[1], RL[2]] },
  });

  // 
  // PAGE 4  OVERALL FINANCING STATEMENT
  // 
  doc.addPage();
  _hdr(doc, "Overall Financing Statement", period, 4, TotalPages, RP, RW, RL, RS);
  _ftr(doc, generatedAt, RS, RL);

  let y4 = 30;
  y4 = _banner(doc, "FINANCIAL SUMMARY", y4, RP, RW);

  const interest = totalRepayable - totalPrincipal;
  const unrealizedInterest = totalRepayable - totalPrincipal - (totalRepaid - repaidLoans.reduce((s, l) => s + (Number(l.amount) || 0), 0));
  autoTable(doc, {
    startY: y4,
    margin: { left: 14, right: 14 },
    head: [["Description", "Amount (TZS)"]],
    body: [
      ["Total Principal Disbursed", _rfmt(totalPrincipal)],
      ["Total Interest Charged", _rfmt(interest)],
      ["Total Repayable (Principal + Interest)", _rfmt(totalRepayable)],
      ["Total Amount Collected", _rfmt(totalRepaid)],
      ["Outstanding Balance (Active Loans)", _rfmt(outstanding)],
      ["Defaulted Amount", _rfmt(defaultedLoans.reduce((s, l) => s + (Number(l.totalAmount) || 0), 0))],
      ["Collection Rate", collectionRate.toFixed(2) + "%"],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [RP[0], RP[1], RP[2]], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [RL[0], RL[1], RL[2]] },
    columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
  });

  const y4b = (doc as any).lastAutoTable.finalY + 10;
  _banner(doc, "STATUS DISTRIBUTION SUMMARY", y4b, RP, RW);
  const y4c = y4b + 10;
  const statusRows = Object.entries(byStatus).map(([st, cnt]) => {
    const stLoans = loans.filter(l => l.status === st);
    const stAmt = stLoans.reduce((s, l) => s + (Number(l.totalAmount) || 0), 0);
    const pct = totalLoans > 0 ? ((cnt as number) / totalLoans * 100).toFixed(1) + "%" : "0%";
    return [st, cnt, _rfmt(stAmt), pct];
  });
  autoTable(doc, {
    startY: y4c,
    margin: { left: 14, right: 14 },
    head: [["Status", "Count", "Total Amount", "% of Portfolio"]],
    body: statusRows.length === 0 ? [["No data", "", "", ""]] : statusRows,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [RP[0], RP[1], RP[2]], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [RL[0], RL[1], RL[2]] },
    columnStyles: { 1: { halign: "center" }, 2: { halign: "right" }, 3: { halign: "center" } },
  });

  // visual status breakdown bars
  const y4d = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(8); doc.setFont("helvetica", "bold");
  doc.setTextColor(RD[0], RD[1], RD[2]);
  doc.text("PORTFOLIO ALLOCATION", 14, y4d);
  doc.setFont("helvetica", "normal"); doc.setTextColor(0,0,0);
  const barTotalW = W - 28;
  const barColors2: Record<string,[number,number,number]> = {
    PENDING: RA, APPROVED: RP, DISBURSED: [14,165,233], REPAID: RG, DEFAULTED: RR, REJECTED: RS
  };
  let bx2 = 14;
  const by2 = y4d + 4;
  Object.entries(byStatus).forEach(([st, cnt]) => {
    const frac = (cnt as number) / Math.max(1, totalLoans);
    const bw2 = frac * barTotalW;
    const col2 = barColors2[st] || RS;
    doc.setFillColor(col2[0], col2[1], col2[2]);
    doc.rect(bx2, by2, bw2, 8, "F");
    if (bw2 > 12) {
      doc.setTextColor(255, 255, 255); doc.setFontSize(6);
      doc.text(st.substring(0,3), bx2 + bw2 / 2, by2 + 5, { align: "center" });
    }
    bx2 += bw2;
  });
  doc.setTextColor(0,0,0);

  // 
  // PAGE 5  DEFAULTED & REJECTED LOANS
  // 
  doc.addPage();
  _hdr(doc, "Defaulted & Rejected Loans", period, 5, TotalPages, RP, RW, RL, RS);
  _ftr(doc, generatedAt, RS, RL);

  let y5 = 30;
  y5 = _banner(doc, "DEFAULTED LOANS (" + defaultedLoans.length + ")", y5, RP, RW);
  autoTable(doc, {
    startY: y5,
    margin: { left: 14, right: 14 },
    head: [["#","Client","Phone","Principal","Total Due","Rate","Period","Date","Days Ago"]],
    body: defaultedLoans.length === 0
      ? [["","No defaulted loans","","","","","","",""]]
      : defaultedLoans.map((l, i) => {
          const daysAgo = Math.floor((Date.now() - new Date(l.createdAt).getTime()) / 86400000);
          return [
            i + 1,
            _bname(l),
            l.borrower && l.borrower.phone ? l.borrower.phone : "",
            _rfmt(Number(l.amount)),
            _rfmt(Number(l.totalAmount)),
            Number(l.interestRate) + "%",
            l.repaymentPeriod + "d",
            new Date(l.createdAt).toLocaleDateString(),
            daysAgo + "d",
          ];
        }),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [RR[0], RR[1], RR[2]], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [RL[0], RL[1], RL[2]] },
  });

  const y5b = (doc as any).lastAutoTable.finalY + 8;
  _banner(doc, "REJECTED LOANS (" + rejectedLoans.length + ")", y5b, RP, RW);
  const y5c = y5b + 10;
  autoTable(doc, {
    startY: y5c,
    margin: { left: 14, right: 14 },
    head: [["#","Client","Phone","Requested","Total","Rate","Period","Officer","Date"]],
    body: rejectedLoans.length === 0
      ? [["","No rejected loans","","","","","","",""]]
      : rejectedLoans.map((l, i) => {
          const off = l.staffActions && l.staffActions[0] && l.staffActions[0].staff
            ? l.staffActions[0].staff.firstName + " " + l.staffActions[0].staff.lastName
            : "";
          return [
            i + 1,
            _bname(l),
            l.borrower && l.borrower.phone ? l.borrower.phone : "",
            _rfmt(Number(l.amount)),
            _rfmt(Number(l.totalAmount)),
            Number(l.interestRate) + "%",
            l.repaymentPeriod + "d",
            off,
            new Date(l.createdAt).toLocaleDateString(),
          ];
        }),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [RS[0], RS[1], RS[2]], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [RL[0], RL[1], RL[2]] },
  });

  // ══════════════════════════════════════════
  // PAGE 6  FULL LOAN REGISTER
  // 
  doc.addPage();
  _hdr(doc, "Full Loan Register", period, 6, TotalPages, RP, RW, RL, RS);
  _ftr(doc, generatedAt, RS, RL);

  let y6 = 30;
  y6 = _banner(doc, "COMPLETE LOAN REGISTER (" + totalLoans + " LOANS)", y6, RP, RW);
  autoTable(doc, {
    startY: y6,
    margin: { left: 14, right: 14 },
    head: [["#","Client","Phone","Principal","Total","Rate","Period","Status","Officer","Date"]],
    body: loans.length === 0
      ? [["","No loans found","","","","","","","",""]]
      : loans.map((l, i) => {
          const off = l.staffActions && l.staffActions[0] && l.staffActions[0].staff
            ? l.staffActions[0].staff.firstName + " " + l.staffActions[0].staff.lastName
            : "";
          return [
            i + 1,
            _bname(l),
            l.borrower && l.borrower.phone ? l.borrower.phone : "",
            _rfmt(Number(l.amount)),
            _rfmt(Number(l.totalAmount)),
            Number(l.interestRate) + "%",
            l.repaymentPeriod + "d",
            l.status,
            off,
            new Date(l.createdAt).toLocaleDateString(),
          ];
        }),
    styles: { fontSize: 6.5, cellPadding: 1.8 },
    headStyles: { fillColor: [RP[0], RP[1], RP[2]], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [RL[0], RL[1], RL[2]] },
    columnStyles: {
      7: {
        fontStyle: "bold",
        textColor: [50, 50, 50],
      },
    },
  });

  // ═════════════════════════════════
  // PAGE 7 — PERFORMANCE METRICS + RECOMMENDATIONS + SIGNATURE
  // 
  doc.addPage();
  _hdr(doc, "Performance Metrics & Recommendations", period, 7, TotalPages, RP, RW, RL, RS);
  _ftr(doc, generatedAt, RS, RL);

  let y7 = 30;
  y7 = _banner(doc, "PERFORMANCE METRICS", y7, RP, RW);
  autoTable(doc, {
    startY: y7,
    margin: { left: 14, right: 14 },
    head: [["Metric", "Value", "Benchmark", "Status"]],
    body: [
      ["Loan Approval Rate",
        (totalLoans > 0 ? ((approvedLoans.length + activeLoans.length + repaidLoans.length) / totalLoans * 100).toFixed(1) : "0") + "%",
        "> 70%",
        (totalLoans > 0 && (approvedLoans.length + activeLoans.length + repaidLoans.length) / totalLoans >= 0.7) ? "GOOD" : "NEEDS IMPROVEMENT"],
      ["Collection Rate", collectionRate.toFixed(1) + "%", "> 85%",
        collectionRate >= 85 ? "GOOD" : collectionRate >= 60 ? "FAIR" : "POOR"],
      ["Default Rate",
        (totalLoans > 0 ? (defaultedLoans.length / totalLoans * 100).toFixed(1) : "0") + "%",
        "< 5%",
        (totalLoans > 0 && defaultedLoans.length / totalLoans < 0.05) ? "GOOD" : "HIGH RISK"],
      ["Average Loan Duration",
        (totalLoans > 0 ? (loans.reduce((s, l) => s + (Number(l.repaymentPeriod) || 0), 0) / totalLoans).toFixed(0) : "0") + " days",
        "30-90 days", "INFO"],
      ["Average Interest Rate", avgInterest.toFixed(2) + "%", "Market Rate", "INFO"],
      ["Portfolio at Risk",
        _rfmt(defaultedLoans.reduce((s, l) => s + (Number(l.totalAmount) || 0), 0)),
        "Minimize", defaultedLoans.length === 0 ? "GOOD" : "MONITOR"],
    ],
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [RP[0], RP[1], RP[2]], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [RL[0], RL[1], RL[2]] },
    columnStyles: {
      2: { textColor: [RS[0], RS[1], RS[2]] },
      3: { fontStyle: "bold", halign: "center" },
    },
  });

  const y7b = (doc as any).lastAutoTable.finalY + 8;
  _banner(doc, "STRATEGIC RECOMMENDATIONS", y7b, RP, RW);
  let y7c = y7b + 14;
  const recs = [
    defaultedLoans.length > 0
      ? "1. IMMEDIATE ACTION: " + defaultedLoans.length + " defaulted loan(s) require urgent recovery. Engage borrowers and explore restructuring."
      : "1. Default portfolio is clean. Maintain rigorous credit scoring to preserve this performance.",
    collectionRate < 80
      ? "2. Collection rate of " + collectionRate.toFixed(1) + "% is below target. Implement automated reminders and field collection drives."
      : "2. Collection rate of " + collectionRate.toFixed(1) + "% is healthy. Continue current collection strategies.",
    pendingLoans.length > 5
      ? "3. " + pendingLoans.length + " loans pending review. Reduce turnaround time to improve client satisfaction."
      : "3. Loan processing pipeline is efficient with " + pendingLoans.length + " pending applications.",
    "4. Maintain adequate liquidity reserves to meet disbursement commitments for approved loans.",
    "5. Conduct quarterly portfolio reviews to identify early warning signs of potential defaults.",
    "6. Consider digital repayment channels (mobile money) to improve collection rates.",
  ];
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(RD[0], RD[1], RD[2]);
  recs.forEach((rec, i) => {
    const lines = doc.splitTextToSize(rec, W - 30);
    doc.text(lines, 14, y7c + i * 12);
  });
  doc.setTextColor(0, 0, 0);

  // signature block
  const y7s = y7c + recs.length * 12 + 10;
  doc.setFillColor(RL[0], RL[1], RL[2]);
  doc.rect(14, y7s, W - 28, 32, "F");
  doc.setFillColor(RP[0], RP[1], RP[2]);
  doc.rect(14, y7s, W - 28, 0.8, "F");
  doc.setTextColor(RD[0], RD[1], RD[2]);
  doc.setFontSize(8); doc.setFont("helvetica", "bold");
  doc.text("AUTHORIZED SIGNATURES", W / 2, y7s + 6, { align: "center" });

  const sigPositions = [
    { x: 28, label: "Chief Executive Officer" },
    { x: W / 2, label: "Finance Director" },
    { x: W - 28, label: "Loan Manager" },
  ];
  sigPositions.forEach(sig => {
    doc.setDrawColor(RS[0], RS[1], RS[2]);
    doc.setLineWidth(0.4);
    doc.line(sig.x - 22, y7s + 22, sig.x + 22, y7s + 22);
    doc.setFontSize(7); doc.setFont("helvetica", "normal");
    doc.setTextColor(RS[0], RS[1], RS[2]);
    doc.text(sig.label, sig.x, y7s + 27, { align: "center" });
  });

  doc.setTextColor(RS[0], RS[1], RS[2]);
  doc.setFontSize(6.5);
  doc.text(
    "This report is computer-generated and confidential. Period: " + period + " | Generated: " + generatedAt,
    W / 2, y7s + 31, { align: "center" }
  );
  doc.setTextColor(0, 0, 0);

  doc.save("AFAR_MKOPO_FASTA_Annual_Report_" + period.replace(/\s+/g, "_") + ".pdf");
}
