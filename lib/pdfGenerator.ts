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
}

const COMPANY_DETAILS = {
  parentCompany: 'Helder Company',
  tradingName: 'Afar Mkopo Fasta',
  address: 'Mbeya, Tanzania',
  phone: '0741525547'
};

function addHeader(doc: jsPDF, pageNumber: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const marginLeft = 14;
  const marginRight = pageWidth - 14;
  
  // Header background
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  // Company Logo/Branding
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_DETAILS.tradingName.toUpperCase(), pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text(`A division of ${COMPANY_DETAILS.parentCompany}`, pageWidth / 2, 30, { align: 'center' });
  
  // Contact info in header
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`📍 ${COMPANY_DETAILS.address}`, marginLeft, 45);
  doc.text(`📞 ${COMPANY_DETAILS.phone}`, marginRight, 45, { align: 'right' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
}

function addFooter(doc: jsPDF, pageNumber: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const marginLeft = 14;
  const marginRight = pageWidth - 14;
  
  // Footer background
  doc.setFillColor(245, 245, 245);
  doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');
  
  // Footer content
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  
  doc.text(COMPANY_DETAILS.parentCompany, marginLeft, pageHeight - 15);
  doc.text(`Trading as: ${COMPANY_DETAILS.tradingName}`, marginLeft, pageHeight - 8);
  
  doc.text(`Tel: ${COMPANY_DETAILS.phone}`, marginRight, pageHeight - 15, { align: 'right' });
  doc.text(`Address: ${COMPANY_DETAILS.address}`, marginRight, pageHeight - 8, { align: 'right' });
  
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
}

export function generateLoanApplicationPDF(data: LoanApplicationData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 70;

  // Header
  addHeader(doc, 1, 1);
  
  // Document Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 95);
  doc.text('LOAN APPLICATION FORM', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 80, 80);
  doc.text('FOMU YA MAOMBI YA MKOPO', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  doc.setTextColor(0, 0, 0);

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
  const pageHeight = doc.internal.pageSize.height;
  if (yPosition > pageHeight - 100) {
    addFooter(doc, 1, 2);
    doc.addPage();
    yPosition = 70;
    addHeader(doc, 2, 2);
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

  // Add final footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  doc.save(`Loan_Application_${data.firstName || 'Unknown'}_${data.lastName || 'Unknown'}.pdf`);
}
