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

// ============================================================
// COMPREHENSIVE LOANS REPORT PDF
// ============================================================

export interface LoanReportData {
  loans: any[];
  period: string;
  generatedAt: string;
  companyBalance?: number;
}

function fmtNum(n:number){return new Intl.NumberFormat("en-TZ",{minimumFractionDigits:0}).format(n);}
function fmtTsh(n:number){return "Tsh "+fmtNum(n);}
function sectionHeader(doc:jsPDF,y:number,text:string,pageWidth:number){
  doc.setFillColor(30,58,95);doc.rect(14,y-6,pageWidth-28,22,"F");
  doc.setTextColor(255,255,255);doc.setFontSize(11);doc.setFont("helvetica","bold");
  doc.text(text,20,y+8);doc.setTextColor(0,0,0);return y+26;
}
function subHeader(doc:jsPDF,y:number,text:string){
  doc.setFontSize(10);doc.setFont("helvetica","bold");doc.setTextColor(30,58,95);
  doc.text(text,14,y);doc.setFont("helvetica","normal");doc.setTextColor(0,0,0);
  return y+8;
}
function checkPage(doc:jsPDF,y:number,needed=40):number{
  if(y>doc.internal.pageSize.height-needed){doc.addPage();return 30;}return y;
}

export function generateLoansReportPDF(data:LoanReportData){
  const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const pw=doc.internal.pageSize.width;
  const ph=doc.internal.pageSize.height;
  let y=0;

  const loans:any[]=data.loans||[];
  const active=loans.filter(l=>["DISBURSED"].includes(l.status));
  const pending=loans.filter(l=>["PENDING","APPROVED"].includes(l.status));
  const repaid=loans.filter(l=>l.status==="REPAID");
  const rejected=loans.filter(l=>l.status==="REJECTED");
  const defaulted=loans.filter(l=>l.status==="DEFAULTED");

  const totalPrincipal=loans.reduce((s,l)=>s+Number(l.amount),0);
  const totalOutstanding=active.reduce((s,l)=>s+Number(l.totalAmount),0);
  const totalRepaid=repaid.reduce((s,l)=>s+Number(l.totalAmount),0);
  const totalDisbursed=loans.filter(l=>["DISBURSED","REPAID","DEFAULTED"].includes(l.status)).reduce((s,l)=>s+Number(l.amount),0);
  const totalInterestExpected=loans.reduce((s,l)=>s+(Number(l.totalAmount)-Number(l.amount)),0);
  const avgRate=loans.length?loans.reduce((s,l)=>s+Number(l.interestRate),0)/loans.length:0;
  const collectionRate=totalDisbursed>0?Math.round((totalRepaid/totalDisbursed)*100):0;

  //  COVER PAGE 
  doc.setFillColor(30,58,95);doc.rect(0,0,pw,60,"F");
  doc.setTextColor(255,255,255);
  doc.setFontSize(20);doc.setFont("helvetica","bold");
  doc.text("AFAR MKOPO FASTA",pw/2,22,{align:"center"});
  doc.setFontSize(13);doc.setFont("helvetica","normal");
  doc.text("Comprehensive Loans & Financing Report",pw/2,32,{align:"center"});
  doc.setFontSize(10);
  doc.text("Mbeya, Tanzania  |  0741525547",pw/2,42,{align:"center"});
  doc.text("Period: "+data.period+"   |   Generated: "+data.generatedAt,pw/2,50,{align:"center"});
  doc.setFillColor(245,158,11);doc.rect(0,58,pw,3,"F");

  y=75;
  // Table of contents
  doc.setFontSize(12);doc.setFont("helvetica","bold");doc.setTextColor(30,58,95);
  doc.text("TABLE OF CONTENTS",pw/2,y,{align:"center"});
  y+=8;
  doc.setDrawColor(30,58,95);doc.line(14,y,pw-14,y);y+=6;
  const toc=[
    ["1.","Executive Summary","2"],
    ["2.","Active & Pending Loans Inventory","3"],
    ["3.","Overall Financing Statement","4"],
    ["4.","Financing Initiative Progress","5"],
    ["5.","Financial Performance & Risk Evaluation","6"],
    ["6.","Strategic Recommendations","7"],
  ];
  doc.setFontSize(10);doc.setFont("helvetica","normal");doc.setTextColor(0,0,0);
  toc.forEach(([n,t,p])=>{
    doc.text(n+" "+t,20,y);doc.text("Page "+p,pw-30,y,{align:"right"});
    doc.setDrawColor(180,180,180);doc.line(20,y+1,pw-30,y+1);y+=10;
  });

  //  PAGE 2: EXECUTIVE SUMMARY 
  doc.addPage();y=20;
  y=sectionHeader(doc,y,"SECTION 1  EXECUTIVE SUMMARY",pw);y+=4;

  // KPI boxes - 3 per row
  const kpis=[
    {l:"Total Loans",v:String(loans.length),c:[219,234,254]},
    {l:"Total Principal Issued",v:fmtTsh(totalPrincipal),c:[220,252,231]},
    {l:"Total Outstanding",v:fmtTsh(totalOutstanding),c:[254,243,199]},
    {l:"Total Repaid",v:fmtTsh(totalRepaid),c:[220,252,231]},
    {l:"Collection Rate",v:collectionRate+"%",c:[219,234,254]},
    {l:"Avg Interest Rate",v:avgRate.toFixed(1)+"%",c:[254,243,199]},
  ];
  const bw=56;const bh=22;const bx=14;let bi=0;
  kpis.forEach(k=>{
    const col=bi%3;const row=Math.floor(bi/3);
    const bxp=bx+(col*(bw+5));const byp=y+(row*(bh+5));
    doc.setFillColor(k.c[0],k.c[1],k.c[2]);doc.roundedRect(bxp,byp,bw,bh,3,3,"F");
    doc.setFontSize(7);doc.setFont("helvetica","bold");doc.setTextColor(30,58,95);
    doc.text(k.l.toUpperCase(),bxp+4,byp+7);
    doc.setFontSize(11);doc.setFont("helvetica","bold");doc.setTextColor(0,0,0);
    doc.text(k.v,bxp+4,byp+17);bi++;
  });
  y+=60;

  // Status breakdown bar chart (manual bars)
  y=subHeader(doc,y,"Loan Portfolio Status Breakdown");
  const statuses=[
    {s:"ACTIVE",n:active.length,c:[34,197,94]},
    {s:"PENDING/APPROVED",n:pending.length,c:[234,179,8]},
    {s:"REPAID",n:repaid.length,c:[59,130,246]},
    {s:"REJECTED",n:rejected.length,c:[239,68,68]},
    {s:"DEFAULTED",n:defaulted.length,c:[156,163,175]},
  ];
  const maxN=Math.max(...statuses.map(s=>s.n),1);
  const barMaxW=pw-80;
  statuses.forEach(({s,n,c})=>{
    const bw2=Math.max((n/maxN)*barMaxW,n>0?4:0);
    doc.setFillColor(c[0],c[1],c[2]);doc.rect(50,y,bw2,7,"F");
    doc.setFontSize(8);doc.setFont("helvetica","bold");doc.setTextColor(0,0,0);
    doc.text(s,14,y+6);
    doc.setFont("helvetica","normal");
    if(n>0)doc.text(String(n),52+bw2,y+6);
    y+=12;
  });
  y+=6;

  // Summary narrative
  doc.setFontSize(9);doc.setFont("helvetica","normal");doc.setTextColor(60,60,60);
  const narrative=[
    "This report provides a comprehensive overview of AFAR MKOPO FASTA loan portfolio for the period: "+data.period+".",
    "The organization has issued "+loans.length+" loans totalling "+fmtTsh(totalPrincipal)+" in principal.",
    "Currently "+active.length+" loans are active with "+fmtTsh(totalOutstanding)+" outstanding.",
    "Collection efficiency stands at "+collectionRate+"% with "+fmtTsh(totalRepaid)+" successfully recovered.",
    "Average portfolio interest rate: "+avgRate.toFixed(1)+"%. Expected total interest income: "+fmtTsh(totalInterestExpected)+".",
  ];
  narrative.forEach(line=>{
    const lines=doc.splitTextToSize(" "+line,pw-30);
    doc.text(lines,14,y);y+=lines.length*6;
  });

  //  PAGE 3: ACTIVE & PENDING LOANS INVENTORY 
  doc.addPage();y=20;
  y=sectionHeader(doc,y,"SECTION 2  ACTIVE & PENDING LOANS INVENTORY",pw);y+=4;

  if(active.length>0){
    y=subHeader(doc,y,"2.1 Active Loans (DISBURSED  "+active.length+")");
    autoTable(doc,{
      startY:y,
      head:[["#","Borrower","Phone","Principal","Rate","Period","Total Owed","Date"]],
      body:active.map((l,i)=>[
        i+1,
        (l.borrower?.firstName||"")+" "+(l.borrower?.lastName||""),
        l.borrower?.phone||"",
        fmtTsh(Number(l.amount)),
        Number(l.interestRate)+"%",
        l.repaymentPeriod+"d",
        fmtTsh(Number(l.totalAmount)),
        new Date(l.createdAt).toLocaleDateString(),
      ]),
      theme:"striped",
      styles:{fontSize:7,cellPadding:2},
      headStyles:{fillColor:[30,58,95],textColor:255,fontStyle:"bold",fontSize:7},
      alternateRowStyles:{fillColor:[245,249,255]},
    });
    y=(doc as any).lastAutoTable.finalY+10;
  }

  y=checkPage(doc,y,60);
  if(pending.length>0){
    y=subHeader(doc,y,"2.2 Pending / Approved Loans ("+pending.length+")");
    autoTable(doc,{
      startY:y,
      head:[["#","Borrower","Phone","Amount Requested","Rate","Status","Purpose","Submitted"]],
      body:pending.map((l,i)=>[
        i+1,
        (l.borrower?.firstName||"")+" "+(l.borrower?.lastName||""),
        l.borrower?.phone||"",
        fmtTsh(Number(l.amount)),
        Number(l.interestRate)+"%",
        l.status,
        l.purpose||"",
        new Date(l.createdAt).toLocaleDateString(),
      ]),
      theme:"striped",
      styles:{fontSize:7,cellPadding:2},
      headStyles:{fillColor:[180,120,0],textColor:255,fontStyle:"bold",fontSize:7},
      alternateRowStyles:{fillColor:[255,251,235]},
    });
    y=(doc as any).lastAutoTable.finalY+10;
  }

  //  PAGE 4: OVERALL FINANCING STATEMENT 
  doc.addPage();y=20;
  y=sectionHeader(doc,y,"SECTION 3  OVERALL FINANCING STATEMENT ASSESSMENT",pw);y+=4;

  const fundAllocData=[
    ["Working Capital Loans","Active portfolio capital",fmtTsh(totalPrincipal),"Ongoing"],
    ["Interest Income (Expected)","Revenue from lending",fmtTsh(totalInterestExpected),"Accruing"],
    ["Capital Recovered","Repaid principal+interest",fmtTsh(totalRepaid),"Collected"],
    ["Outstanding Obligations","Active loan balances",fmtTsh(totalOutstanding),"Due"],
    ["Pending Disbursement","Approved, not yet disbursed",fmtTsh(pending.filter(l=>l.status==="APPROVED").reduce((s:number,l:any)=>s+Number(l.amount),0)),"Pending"],
  ];
  autoTable(doc,{
    startY:y,
    head:[["Category","Description","Amount (TZS)","Status"]],
    body:fundAllocData,
    theme:"grid",
    styles:{fontSize:8,cellPadding:3},
    headStyles:{fillColor:[30,58,95],textColor:255,fontStyle:"bold"},
    columnStyles:{2:{halign:"right"},3:{halign:"center"}},
  });
  y=(doc as any).lastAutoTable.finalY+12;

  y=checkPage(doc,y,60);
  y=subHeader(doc,y,"Fund Allocation Overview");
  // Pie chart simulation using arc text labels
  const pieData=[
    {l:"Principal Issued",v:totalPrincipal,c:[30,58,95]},
    {l:"Interest Expected",v:totalInterestExpected,c:[245,158,11]},
    {l:"Repaid to Date",v:totalRepaid,c:[34,197,94]},
    {l:"Outstanding",v:totalOutstanding,c:[239,68,68]},
  ];
  const total=pieData.reduce((s,p)=>s+p.v,0)||1;
  const cx=pw/2;const cy=y+30;const r=25;
  let startAngle=0;
  pieData.forEach(p=>{
    const slice=(p.v/total)*Math.PI*2;
    // Draw colored arc segment as filled sector
    doc.setFillColor(p.c[0],p.c[1],p.c[2]);
    doc.circle(cx+(r+2)*Math.cos(startAngle+slice/2),cy+(r+2)*Math.sin(startAngle+slice/2),r*(slice/(Math.PI*2))*2+2,"F");
    startAngle+=slice;
  });
  // Legend
  let lx=14;let ly=y;
  pieData.forEach(p=>{
    doc.setFillColor(p.c[0],p.c[1],p.c[2]);doc.rect(lx,ly,5,5,"F");
    doc.setFontSize(8);doc.setFont("helvetica","normal");doc.setTextColor(0,0,0);
    doc.text(p.l+": "+fmtTsh(p.v)+" ("+Math.round(p.v/total*100)+"%)",lx+7,ly+4);
    ly+=10;
  });
  y+=80;

  //  PAGE 5: FINANCING INITIATIVE PROGRESS 
  doc.addPage();y=20;
  y=sectionHeader(doc,y,"SECTION 4  FINANCING INITIATIVE PROGRESS ANALYSIS",pw);y+=4;

  autoTable(doc,{
    startY:y,
    head:[["Initiative","Count","Total Value","Milestone","Status","Action Required"]],
    body:[
      ["Loan Applications Received",String(loans.length),fmtTsh(totalPrincipal),"Applications received","Ongoing","Continue processing"],
      ["Approved & Disbursed",String(active.length+repaid.length),fmtTsh(totalDisbursed),"Funds disbursed","Active","Monitor repayment"],
      ["Pending Review",String(pending.filter((l:any)=>l.status==="PENDING").length),fmtTsh(pending.filter((l:any)=>l.status==="PENDING").reduce((s:number,l:any)=>s+Number(l.amount),0)),"Under review","Pending","Complete assessment"],
      ["Approved - Awaiting Disbursement",String(pending.filter((l:any)=>l.status==="APPROVED").length),fmtTsh(pending.filter((l:any)=>l.status==="APPROVED").reduce((s:number,l:any)=>s+Number(l.amount),0)),"Approved","Ready","Disburse funds"],
      ["Fully Repaid",String(repaid.length),fmtTsh(totalRepaid),"Completed","Closed","Archive records"],
      ["Rejected Applications",String(rejected.length),fmtTsh(rejected.reduce((s:number,l:any)=>s+Number(l.amount),0)),"Assessed","Closed","File documentation"],
      ["Defaulted Loans",String(defaulted.length),fmtTsh(defaulted.reduce((s:number,l:any)=>s+Number(l.amount),0)),"Defaulted","High Risk","Initiate recovery"],
    ],
    theme:"grid",
    styles:{fontSize:7.5,cellPadding:3},
    headStyles:{fillColor:[30,58,95],textColor:255,fontStyle:"bold",fontSize:8},
    columnStyles:{1:{halign:"center"},2:{halign:"right"}},
  });
  y=(doc as any).lastAutoTable.finalY+12;

  y=checkPage(doc,y,50);
  y=subHeader(doc,y,"Monthly Trend  Loans Submitted");
  // Monthly breakdown table
  const monthlyMap:Record<string,{count:number,amount:number}>={}; 
  loans.forEach(l=>{
    const key=new Date(l.createdAt).toLocaleDateString("en-TZ",{year:"numeric",month:"short"});
    if(!monthlyMap[key])monthlyMap[key]={count:0,amount:0};
    monthlyMap[key].count++;monthlyMap[key].amount+=Number(l.amount);
  });
  const monthlyRows=Object.entries(monthlyMap).slice(-12).map(([m,v])=>[m,String(v.count),fmtTsh(v.amount)]);
  if(monthlyRows.length>0){
    autoTable(doc,{
      startY:y,
      head:[["Month","Loans Submitted","Total Amount"]],
      body:monthlyRows,
      theme:"striped",
      styles:{fontSize:8,cellPadding:3},
      headStyles:{fillColor:[59,130,246],textColor:255,fontStyle:"bold"},
      columnStyles:{1:{halign:"center"},2:{halign:"right"}},
    });
    y=(doc as any).lastAutoTable.finalY+12;
  }

  //  PAGE 6: FINANCIAL PERFORMANCE & RISK 
  doc.addPage();y=20;
  y=sectionHeader(doc,y,"SECTION 5  FINANCIAL PERFORMANCE & RISK EVALUATION",pw);y+=4;

  y=subHeader(doc,y,"5.1 Repayment Performance Metrics");
  const totalLoansEverActive=loans.filter(l=>!["PENDING","APPROVED","REJECTED"].includes(l.status)).length||1;
  const dscr=totalOutstanding>0?(totalRepaid/totalOutstanding).toFixed(2):"N/A";
  autoTable(doc,{
    startY:y,
    head:[["KPI","Value","Benchmark","Assessment"]],
    body:[
      ["Collection Rate",collectionRate+"%",">80%",collectionRate>=80?" Healthy":" Needs Attention"],
      ["Debt Service Coverage Ratio (DSCR)",String(dscr),">1.2",parseFloat(String(dscr))>=1.2?" Adequate":" Review Required"],
      ["Default Rate",(defaulted.length/Math.max(totalLoansEverActive,1)*100).toFixed(1)+"%","<5%",defaulted.length/totalLoansEverActive*100<5?" Low":" High Risk"],
      ["Average Interest Rate",avgRate.toFixed(1)+"%","Market Rate","Competitive"],
      ["Active Loan Ratio",(active.length/Math.max(loans.length,1)*100).toFixed(1)+"%",">30%","Monitoring"],
    ],
    theme:"grid",
    styles:{fontSize:8,cellPadding:3},
    headStyles:{fillColor:[30,58,95],textColor:255,fontStyle:"bold"},
  });
  y=(doc as any).lastAutoTable.finalY+12;

  y=checkPage(doc,y,80);
  y=subHeader(doc,y,"5.2 Risk Assessment Matrix");
  autoTable(doc,{
    startY:y,
    head:[["Risk Type","Description","Severity","Likelihood","Mitigation Strategy"]],
    body:[
      ["Credit Risk","Borrower inability to repay",defaulted.length>0?"HIGH":"MEDIUM","Medium","Stricter KYC, guarantor requirements"],
      ["Concentration Risk","Over-reliance on few borrowers",loans.length<10?"HIGH":"LOW","Low","Diversify borrower base"],
      ["Liquidity Risk","Insufficient capital for new loans",pending.length>active.length?"HIGH":"LOW","Low","Maintain capital reserves"],
      ["Interest Rate Risk","Fixed rate exposure to market shifts","LOW","Low","Review rates quarterly"],
      ["Operational Risk","Manual processing errors","MEDIUM","Medium","Implement audit trails"],
      ["Regulatory Risk","Compliance with Tanzanian MFI regulations","MEDIUM","Low","Regular compliance reviews"],
    ],
    theme:"grid",
    styles:{fontSize:7.5,cellPadding:3},
    headStyles:{fillColor:[239,68,68],textColor:255,fontStyle:"bold",fontSize:8},
    columnStyles:{
      2:{halign:"center"},
      3:{halign:"center"},
    },
  });
  y=(doc as any).lastAutoTable.finalY+12;

  //  PAGE 7: STRATEGIC RECOMMENDATIONS 
  doc.addPage();y=20;
  y=sectionHeader(doc,y,"SECTION 6  EXECUTIVE SUMMARY & STRATEGIC RECOMMENDATIONS",pw);y+=4;

  y=subHeader(doc,y,"Organizational Strengths");
  const strengths=[
    "Established loan portfolio with "+loans.length+" total loan records",
    "Average interest rate of "+avgRate.toFixed(1)+"% is competitive within Tanzania MFI sector",
    "Collection rate of "+collectionRate+"% demonstrates effective recovery processes",
    "Total capital mobilized: "+fmtTsh(totalPrincipal)+" across all lending activities",
  ];
  strengths.forEach(s=>{doc.setFontSize(8.5);doc.setFont("helvetica","normal");doc.setTextColor(34,197,94);doc.text("",14,y);doc.setTextColor(0,0,0);const lines=doc.splitTextToSize(s,pw-35);doc.text(lines,22,y);y+=lines.length*6;});
  y+=4;

  y=subHeader(doc,y,"Key Vulnerabilities");
  const vulns=[
    defaulted.length>0?"Defaulted loans ("+defaulted.length+") require immediate recovery action":"No defaults recorded  maintain monitoring",
    pending.length>0?pending.length+" loans pending review  processing delays may affect borrower trust":"All pending applications are being processed",
    "Concentration in short-term loans increases portfolio rollover frequency",
    totalOutstanding>0?"Outstanding obligations of "+fmtTsh(totalOutstanding)+" require continuous monitoring":"",
  ].filter(Boolean);
  vulns.forEach(v=>{doc.setFontSize(8.5);doc.setFont("helvetica","normal");doc.setTextColor(239,68,68);doc.text("",14,y);doc.setTextColor(0,0,0);const lines=doc.splitTextToSize(v,pw-35);doc.text(lines,22,y);y+=lines.length*6;});
  y+=6;

  y=checkPage(doc,y,80);
  y=subHeader(doc,y,"Strategic Recommendations");
  autoTable(doc,{
    startY:y,
    head:[["Priority","Recommendation","Expected Impact","Timeline"]],
    body:[
      ["HIGH","Implement automated repayment reminders","Reduce default rate by 30%","Immediate"],
      ["HIGH","Establish loan recovery task force for defaulted accounts","Recover "+fmtTsh(defaulted.reduce((s:number,l:any)=>s+Number(l.totalAmount),0)),"30 days"],
      ["MEDIUM","Expand borrower screening to include business site visits","Improve credit quality","60 days"],
      ["MEDIUM","Introduce tiered interest rates based on credit history","Reward reliable borrowers","90 days"],
      ["LOW","Diversify loan products (group lending, asset-backed loans)","Broaden market reach","6 months"],
      ["LOW","Pursue microfinance certification to access wholesale funding","Lower cost of capital","12 months"],
    ],
    theme:"grid",
    styles:{fontSize:8,cellPadding:3},
    headStyles:{fillColor:[30,58,95],textColor:255,fontStyle:"bold"},
    columnStyles:{0:{halign:"center"},3:{halign:"center"}},
  });
  y=(doc as any).lastAutoTable.finalY+12;

  //  FOOTER ON ALL PAGES 
  const totalPages=doc.getNumberOfPages();
  for(let i=1;i<=totalPages;i++){
    doc.setPage(i);
    doc.setFillColor(30,58,95);doc.rect(0,ph-12,pw,12,"F");
    doc.setTextColor(255,255,255);doc.setFontSize(7);doc.setFont("helvetica","normal");
    doc.text("AFAR MKOPO FASTA  CONFIDENTIAL | Page "+i+" of "+totalPages,pw/2,ph-4,{align:"center"});
    doc.text("Generated: "+data.generatedAt,14,ph-4);
    doc.text(data.period,pw-14,ph-4,{align:"right"});
  }

  doc.save("AFAR_Loans_Report_"+data.period.replace(/[^a-zA-Z0-9]/g,"_")+".pdf");
}
