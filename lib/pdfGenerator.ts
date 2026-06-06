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

export function generateLoanApplicationPDF(data: LoanApplicationData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('AFAR MKOPO FASTA', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('FOMU YA MAOMBI YA MKOPO', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;

  // Section 1: Borrower Information
  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('01. TAARIFA ZA MKOPAJI', 14, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const tableData1 = [
    ['Majina kamili:', `${data.firstName || ''} ${data.lastName || ''}`],
    ['NIDA Number (NIN):', data.nin || ''],
    ['Tarehe ya kuzaliwa:', data.dateOfBirth || ''],
    ['Jinsia:', data.gender || ''],
    ['Halya ndoa:', data.maritalStatus || ''],
    ['Nchi:', data.country || ''],
    ['Mkoa:', data.region || ''],
    ['Wilaya:', data.district || ''],
    ['Sehemu ya makazi/mtaa:', data.address || ''],
    ['Nyumba no:', data.houseNumber || ''],
    ['Jina kamili la mwenzi:', data.spouseName || ''],
    ['Namba za simu:', data.phone || ''],
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: tableData1,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Section 2: Business Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('02. TAARIFA ZA BIASHARA YA MKOPAJI', 14, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const tableData2 = [
    ['Aina/jina la biashara:', data.businessName || ''],
    ['Mahali pa biashara:', data.businessLocation || ''],
    ['Umefanya biashara tangu lini:', data.businessSince || ''],
    ['Dhumuni la mkopo:', data.loanPurpose || ''],
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: tableData2,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Section 3: Loan Amount
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('03. KIASI CHA MKOPO KWA ASILIMIA TATU POINT TANO TU.', 14, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const tableData3 = [
    ['Mimi Nakubali kupokea:', ''],
    ['Kiasi kwa tarakimu:', data.loanAmount ? `Tsh ${data.loanAmount.toLocaleString()}` : ''],
    ['Kiasi kwa maneno:', data.loanAmountWords || ''],
    ['Kiasi cha kurejesha kwa siku:', data.dailyPayment ? `Tsh ${data.dailyPayment.toLocaleString()}` : ''],
    ['Riba ya mkopo:', data.interestRate ? `${data.interestRate}%` : ''],
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: tableData3,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Section 4: Loan Terms
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TAARIFA YA MKOPO', 14, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Gharama ya fomu (10% ya mkopo): Tsh ' + (data.loanAmount ? (data.loanAmount * 0.1).toLocaleString() : '0'), 14, yPosition);
  yPosition += 7;
  doc.text('Riba ya mkopo itakuwa asilimia ishirini (20%)', 14, yPosition);
  yPosition += 7;
  doc.text('Maarejesho ni ya kila siku', 14, yPosition);
  yPosition += 7;
  doc.text('Faini ni shilingi 1000/=', 14, yPosition);
  yPosition += 10;

  // Section 5: First Guarantor
  if (data.guarantor1Name) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('06. TAARIFA ZA WADHAMINI - MDHAMINI WA KWANZA', 14, yPosition);
    
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const tableData4 = [
      ['Majina ya mdhamini:', data.guarantor1Name],
      ['Sehemu ya makazi:', data.guarantor1Address || ''],
      ['Nyumba no:', data.guarantor1HouseNumber || ''],
      ['Sehemu ya biashara:', data.guarantor1Business || ''],
      ['Uhusiano wake na mkopaji:', data.guarantor1Relationship || ''],
      ['Namba za simu:', data.guarantor1Phone || ''],
      ['Dhamana anazoandikisha:', data.guarantor1Collateral || ''],
    ];
    
    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: tableData4,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
      },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Section 6: Second Guarantor
  if (data.guarantor2Name) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('08. MDHAMINI WA PILI', 14, yPosition);
    
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const tableData5 = [
      ['Majina ya mdhamini:', data.guarantor2Name],
      ['Sehemu ya makazi:', data.guarantor2Address || ''],
      ['Nyumba no:', data.guarantor2HouseNumber || ''],
      ['Sehemu ya biashara:', data.guarantor2Business || ''],
      ['Uhusiano wake na mkopaji:', data.guarantor2Relationship || ''],
      ['Namba za simu:', data.guarantor2Phone || ''],
      ['Dhamana anazoandikisha:', data.guarantor2Collateral || ''],
    ];
    
    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: tableData5,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
      },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Footer with payment schedule
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RUTIBA YA MAREJESHO', 14, yPosition);
  
  yPosition += 8;
  const scheduleData = [];
  for (let i = 1; i <= 30; i++) {
    scheduleData.push([i, '', 'INSTALMENT', '']);
  }
  
  autoTable(doc, {
    startY: yPosition,
    head: [['NO', 'TAREHE', 'REJESHO', 'SAHIHI']],
    body: scheduleData,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 153, 225], textColor: 255 },
  });

  doc.save(`Loan_Application_${data.firstName || 'Unknown'}_${data.lastName || 'Unknown'}.pdf`);
}
