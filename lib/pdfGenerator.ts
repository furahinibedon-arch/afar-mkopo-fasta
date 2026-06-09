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
  
  // Header background
  doc.setFillColor(245, 247, 250);
  doc.rect(0, 0, pageWidth, 120, 'F');

  // Company Logo (try to load /logo.png)
  const logoX = 20;
  const logoY = 25;
  const logoSize = 70;
  let yPos = logoY;

  // Try to add logo with proper aspect ratio handling
  try {
    // Add logo at a bigger size, aspect ratio will be preserved if we use the same width/height ratio
    doc.addImage('/logo.png', 'PNG', logoX, logoY, logoSize, logoSize);
  } catch (e) {
    // Fallback if logo file not found - create a nice branded circle
    doc.setFillColor(30, 58, 95);
    doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 'F');
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11); // Brand color
    doc.text('AF', logoX + logoSize/2, logoY + logoSize/2 + 12, { align: 'center' });
  }

  // Company Name (Centered, with better spacing)
  yPos = 35;
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 95);
  doc.text(COMPANY_DETAILS.tradingName.toUpperCase(), pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 20;
  
  // Parent company
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`A division of ${COMPANY_DETAILS.parentCompany}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 18;
  
  // 2. Physical Address
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('📍 Location:', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text(COMPANY_DETAILS.address, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 16;
  
  // 3. Contact Phone Number
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('📞 Contact:', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text(COMPANY_DETAILS.phone, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 14;
  
  // 4. Company Motto
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 95);
  doc.text(COMPANY_DETAILS.motto, pageWidth / 2, yPos, { align: 'center' });
  
  yPosition = yPos + 10;
  
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
