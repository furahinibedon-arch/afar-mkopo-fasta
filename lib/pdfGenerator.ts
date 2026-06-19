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
// COMPREHENSIVE LOANS REPORT PDF  v2  Professional Layout
// ============================================================

export interface LoanReportData { loans: any[]; period: string; generatedAt: string; companyBalance?: number; }

const _P:[number,number,number]=[13,71,161];
const _A:[number,number,number]=[245,158,11];
const _W:[number,number,number]=[255,255,255];
const _G:[number,number,number]=[22,163,74];
const _R:[number,number,number]=[220,38,38];
const _S:[number,number,number]=[100,116,139];
const _L:[number,number,number]=[241,245,249];
const _D:[number,number,number]=[30,41,59];

function rN(n:number){return new Intl.NumberFormat("en-US",{minimumFractionDigits:0}).format(Math.round(n));}
function rT(n:number){return "TZS "+rN(n);}

function phHdr(doc:jsPDF,pw:number,right:string){
  doc.setFillColor(..._P);doc.rect(0,0,pw,11,"F");
  doc.setFillColor(..._A);doc.rect(0,11,pw,1.5,"F");
  doc.setFontSize(7);doc.setFont("helvetica","bold");doc.setTextColor(..._W);
  doc.text("AFAR MKOPO FASTA",14,7.5);
  doc.text(right,pw-14,7.5,{align:"right"});
}

function phFtr(doc:jsPDF,pw:number,ph:number,pg:number,tot:number,pd:string){
  doc.setFillColor(..._L);doc.rect(0,ph-10,pw,10,"F");
  doc.setDrawColor(203,213,225);doc.line(0,ph-10,pw,ph-10);
  doc.setFontSize(7);doc.setFont("helvetica","normal");doc.setTextColor(..._S);
  doc.text("AFAR MKOPO FASTA  Mbeya, Tanzania  0741525547",14,ph-3.5);
  doc.text(pd,pw/2,ph-3.5,{align:"center"});
  doc.text("Page "+pg+" of "+tot,pw-14,ph-3.5,{align:"right"});
}

function secBnr(doc:jsPDF,y:number,pw:number,label:string):number{
  doc.setFillColor(..._P);doc.roundedRect(14,y,pw-28,10,2,2,"F");
  doc.setFillColor(..._A);doc.roundedRect(14,y,4,10,2,2,"F");doc.rect(16,y,2,10,"F");
  doc.setFontSize(9);doc.setFont("helvetica","bold");doc.setTextColor(..._W);
  doc.text(label,22,y+7);doc.setTextColor(0,0,0);
  return y+16;
}

function subHd(doc:jsPDF,y:number,pw:number,label:string):number{
  doc.setFillColor(..._L);doc.rect(14,y,pw-28,8,"F");
  doc.setDrawColor(148,163,184);doc.setLineWidth(0.3);doc.line(14,y+8,pw-14,y+8);
  doc.setFontSize(8);doc.setFont("helvetica","bold");doc.setTextColor(..._D);
  doc.text(label,18,y+5.5);doc.setTextColor(0,0,0);doc.setFont("helvetica","normal");
  return y+14;
}

function chkPg(doc:jsPDF,y:number,ph:number,need:number):number{
  if(y+need>ph-14){doc.addPage();return 24;}return y;
}

function kpiBox(doc:jsPDF,x:number,y:number,w2:number,h:number,lbl:string,val:string,bg:[number,number,number],ac:[number,number,number]):void{
  doc.setFillColor(...bg);doc.roundedRect(x,y,w2,h,2,2,"F");
  doc.setFillColor(...ac);doc.roundedRect(x,y,w2,2.5,2,0,"F");doc.rect(x+2,y,w2-4,2.5,"F");
  const lb=doc.splitTextToSize(lbl.toUpperCase(),w2-5);
  doc.setFontSize(6);doc.setFont("helvetica","bold");doc.setTextColor(..._S);
  doc.text(lb,x+3,y+7);
  doc.setFontSize(9.5);doc.setFont("helvetica","bold");doc.setTextColor(..._D);
  doc.text(val,x+3,y+h-5);
}
export function generateLoansReportPDF(data:LoanReportData){
  const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const pw=doc.internal.pageSize.width;   // 210
  const ph_=doc.internal.pageSize.height; // 297
  const loans:any[]=data.loans||[];
  const active  =loans.filter(l=>l.status==="DISBURSED");
  const pending =loans.filter(l=>["PENDING","APPROVED"].includes(l.status));
  const repaid  =loans.filter(l=>l.status==="REPAID");
  const rejected=loans.filter(l=>l.status==="REJECTED");
  const defaulted=loans.filter(l=>l.status==="DEFAULTED");

  const totPrincipal   =loans.reduce((s,l)=>s+Number(l.amount),0);
  const totOutstanding =active.reduce((s,l)=>s+Number(l.totalAmount),0);
  const totRepaid      =repaid.reduce((s,l)=>s+Number(l.totalAmount),0);
  const totDisbursed   =loans.filter(l=>["DISBURSED","REPAID","DEFAULTED"].includes(l.status)).reduce((s,l)=>s+Number(l.amount),0);
  const totInterest    =loans.reduce((s,l)=>s+(Number(l.totalAmount)-Number(l.amount)),0);
  const avgRate        =loans.length?loans.reduce((s,l)=>s+Number(l.interestRate),0)/loans.length:0;
  const colRate        =totDisbursed>0?Math.round((totRepaid/totDisbursed)*100):0;

  //  PAGE 1: COVER 
  // Dark header band
  doc.setFillColor(..._P);doc.rect(0,0,pw,80,"F");
  doc.setFillColor(..._A);doc.rect(0,80,pw,2,"F");
  // Company name
  doc.setFontSize(22);doc.setFont("helvetica","bold");doc.setTextColor(..._W);
  doc.text("AFAR MKOPO FASTA",pw/2,34,{align:"center"});
  // Tag line
  doc.setFontSize(11);doc.setFont("helvetica","normal");
  doc.text("Comprehensive Loans & Financing Report",pw/2,44,{align:"center"});
  // Divider line in accent
  doc.setDrawColor(..._A);doc.setLineWidth(0.5);doc.line(40,50,pw-40,50);
  // Period and date
  doc.setFontSize(9);doc.setFont("helvetica","normal");doc.setTextColor(200,215,235);
  doc.text("Period: "+data.period,pw/2,58,{align:"center"});
  doc.text("Generated: "+data.generatedAt,pw/2,65,{align:"center"});
  doc.text("Mbeya, Tanzania   0741525547",pw/2,72,{align:"center"});

  // White section below header
  doc.setFillColor(..._W);doc.rect(0,82,pw,ph_-82,"F");

  // Table of contents box
  const tocX=20,tocY=95,tocW=pw-40;
  doc.setFillColor(..._L);doc.roundedRect(tocX,tocY,tocW,90,3,3,"F");
  doc.setDrawColor(148,163,184);doc.setLineWidth(0.4);doc.roundedRect(tocX,tocY,tocW,90,3,3,"S");
  doc.setFontSize(10);doc.setFont("helvetica","bold");doc.setTextColor(..._P);
  doc.text("TABLE OF CONTENTS",tocX+tocW/2,tocY+10,{align:"center"});
  doc.setDrawColor(148,163,184);doc.line(tocX+8,tocY+13,tocX+tocW-8,tocY+13);

  const toc=[
    ["1","Executive Summary & KPIs","2"],
    ["2","Active & Pending Loans Inventory","3"],
    ["3","Overall Financing Statement","4"],
    ["4","Financing Initiative Progress","5"],
    ["5","Financial Performance & Risk Evaluation","6"],
    ["6","Strategic Recommendations","7"],
  ];
  let ty=tocY+20;
  toc.forEach(([n,title,pg])=>{
    doc.setFontSize(9);doc.setFont("helvetica","bold");doc.setTextColor(..._P);
    doc.text(n+".",tocX+8,ty);
    doc.setFont("helvetica","normal");doc.setTextColor(..._D);
    doc.text(title,tocX+16,ty);
    doc.setFont("helvetica","bold");doc.setTextColor(..._S);
    doc.text("pg "+pg,tocX+tocW-10,ty,{align:"right"});
    doc.setDrawColor(226,232,240);doc.setLineWidth(0.2);doc.line(tocX+8,ty+2,tocX+tocW-8,ty+2);
    ty+=12;
  });
  phFtr(doc,pw,ph_,1,7,data.period);
  //  PAGE 2: EXECUTIVE SUMMARY 
  doc.addPage();
  let y=24;
  phHdr(doc,pw,"SECTION 1 OF 6");
  y=secBnr(doc,y,pw,"SECTION 1  EXECUTIVE SUMMARY & KEY PERFORMANCE INDICATORS");

  // 6 KPI cards in 2 rows of 3
  const KW=55,KH=22,KG=4,KY=y;
  const kpis=[
    {l:"Total Loans Issued",     v:String(loans.length),     bg:[219,234,254] as [number,number,number], ac:_P},
    {l:"Total Principal",        v:rT(totPrincipal),          bg:[220,252,231] as [number,number,number], ac:_G},
    {l:"Total Outstanding",      v:rT(totOutstanding),        bg:[254,243,199] as [number,number,number], ac:_A},
    {l:"Total Repaid",           v:rT(totRepaid),             bg:[220,252,231] as [number,number,number], ac:_G},
    {l:"Collection Rate",        v:colRate+"%",               bg:[219,234,254] as [number,number,number], ac:_P},
    {l:"Avg Interest Rate",      v:avgRate.toFixed(1)+"%",    bg:[254,243,199] as [number,number,number], ac:_A},
  ];
  kpis.forEach((k,i)=>{
    const col=i%3, row=Math.floor(i/3);
    kpiBox(doc, 14+col*(KW+KG), KY+row*(KH+KG), KW, KH, k.l, k.v, k.bg, k.ac);
  });
  y+=KH*2+KG+12;

  // Status breakdown bar chart
  y=subHd(doc,y,pw,"Portfolio Status Breakdown");
  const statuses=[
    {s:"Active (Disbursed)",  n:active.length,   c:_G},
    {s:"Pending / Approved",  n:pending.length,  c:_A},
    {s:"Fully Repaid",        n:repaid.length,   c:_P},
    {s:"Rejected",            n:rejected.length, c:_R},
    {s:"Defaulted",           n:defaulted.length,c:_S},
  ];
  const maxN=Math.max(...statuses.map(s=>s.n),1);
  const barMax=pw-75;
  statuses.forEach(({s,n,c})=>{
    const bw=n>0?Math.max((n/maxN)*barMax,3):0;
    doc.setFontSize(7.5);doc.setFont("helvetica","normal");doc.setTextColor(..._D);
    doc.text(s,14,y+4);
    if(bw>0){doc.setFillColor(...(statuses.find(x=>x.s===s)!.c));doc.roundedRect(58,y,bw,5,1,1,"F");}
    doc.setFontSize(7);doc.setTextColor(..._S);
    doc.text(String(n),60+bw,y+4);
    y+=9;
  });
  y+=6;

  // Narrative summary in a box
  const narr=[
    "This report covers the AFAR MKOPO FASTA loan portfolio for period: "+data.period+".",
    loans.length+" loans totalling "+rT(totPrincipal)+" in principal have been issued.",
    active.length+" loans are currently active with "+rT(totOutstanding)+" outstanding.",
    "Collection efficiency: "+colRate+"%. Recovered: "+rT(totRepaid)+". Expected interest income: "+rT(totInterest)+".",
    "Average portfolio interest rate: "+avgRate.toFixed(1)+"%. Default count: "+defaulted.length+".",
  ];
  const narrH=narr.length*9+10;
  doc.setFillColor(..._L);doc.roundedRect(14,y,pw-28,narrH,2,2,"F");
  doc.setDrawColor(148,163,184);doc.setLineWidth(0.3);doc.roundedRect(14,y,pw-28,narrH,2,2,"S");
  let ny=y+8;
  narr.forEach(line=>{
    const wrapped=doc.splitTextToSize(line,pw-34);
    doc.setFontSize(8);doc.setFont("helvetica","normal");doc.setTextColor(..._D);
    doc.text(wrapped,18,ny);
    ny+=wrapped.length*5.5;
  });
  y+=narrH+4;
  phFtr(doc,pw,ph_,2,7,data.period);
  //  PAGE 3: ACTIVE & PENDING LOANS 
  doc.addPage();
  y=24;
  phHdr(doc,pw,"SECTION 2 OF 6");
  y=secBnr(doc,y,pw,"SECTION 2  ACTIVE & PENDING LOANS INVENTORY");

  if(active.length>0){
    y=subHd(doc,y,pw,"2.1  Active Loans  (Status: DISBURSED  Count: "+active.length+")");
    autoTable(doc,{
      startY:y,
      margin:{left:14,right:14},
      head:[["#","Borrower Name","Phone","Principal (TZS)","Rate","Days","Total Owed (TZS)","Issued"]],
      body:active.map((l,i)=>[
        i+1,
        ((l.borrower?.firstName||"")+" "+(l.borrower?.lastName||"")).trim(),
        l.borrower?.phone||"",
        rT(Number(l.amount)),
        Number(l.interestRate).toFixed(1)+"%",
        l.repaymentPeriod,
        rT(Number(l.totalAmount)),
        new Date(l.createdAt).toLocaleDateString("en-GB"),
      ]),
      theme:"striped",
      styles:{fontSize:7,cellPadding:2.5,overflow:"linebreak"},
      headStyles:{fillColor:[13,71,161],textColor:255,fontStyle:"bold",fontSize:7.5},
      alternateRowStyles:{fillColor:[245,249,255]},
      columnStyles:{0:{cellWidth:6,halign:"center"},3:{halign:"right"},6:{halign:"right"}},
    });
    y=(doc as any).lastAutoTable.finalY+8;
  } else {
    doc.setFontSize(8.5);doc.setFont("helvetica","italic");doc.setTextColor(..._S);
    doc.text("No active disbursed loans in this period.",18,y+6);
    y+=14;
  }

  y=chkPg(doc,y,ph_,60);
  if(y===24){phHdr(doc,pw,"SECTION 2 OF 6 (cont.)");}

  if(pending.length>0){
    y=subHd(doc,y,pw,"2.2  Pending & Approved Loans  (Count: "+pending.length+")");
    autoTable(doc,{
      startY:y,
      margin:{left:14,right:14},
      head:[["#","Borrower Name","Phone","Amount (TZS)","Rate","Status","Purpose","Submitted"]],
      body:pending.map((l,i)=>[
        i+1,
        ((l.borrower?.firstName||"")+" "+(l.borrower?.lastName||"")).trim(),
        l.borrower?.phone||"",
        rT(Number(l.amount)),
        Number(l.interestRate).toFixed(1)+"%",
        l.status,
        l.purpose||"",
        new Date(l.createdAt).toLocaleDateString("en-GB"),
      ]),
      theme:"striped",
      styles:{fontSize:7,cellPadding:2.5,overflow:"linebreak"},
      headStyles:{fillColor:[180,83,9],textColor:255,fontStyle:"bold",fontSize:7.5},
      alternateRowStyles:{fillColor:[255,251,235]},
      columnStyles:{0:{cellWidth:6,halign:"center"},3:{halign:"right"}},
    });
    y=(doc as any).lastAutoTable.finalY+8;
  } else {
    doc.setFontSize(8.5);doc.setFont("helvetica","italic");doc.setTextColor(..._S);
    doc.text("No pending loans in this period.",18,y+6);
    y+=14;
  }
  phFtr(doc,pw,ph_,3,7,data.period);
  //  PAGE 4: FINANCING STATEMENT 
  doc.addPage();
  y=24;
  phHdr(doc,pw,"SECTION 3 OF 6");
  y=secBnr(doc,y,pw,"SECTION 3  OVERALL FINANCING STATEMENT");
  y=subHd(doc,y,pw,"3.1  Portfolio Financial Summary");
  const finRows=[
    ["Total Loans Issued",String(loans.length),"count"],
    ["Total Principal",rT(totPrincipal),"TZS"],
    ["Total Interest",rT(totInterest),"TZS"],
    ["Total Receivable",rT(totPrincipal+totInterest),"TZS"],
    ["Total Recovered",rT(totRepaid),"TZS"],
    ["Outstanding Balance",rT(totOutstanding),"TZS"],
    ["Collection Rate",colRate+"%","%"],
    ["Active Loans",String(active.length),"count"],
    ["Defaulted Loans",String(defaulted.length),"count"],
    ["Rejected Loans",String(rejected.length),"count"],
  ];
  autoTable(doc,{
    startY:y,margin:{left:14,right:14},
    head:[["Metric","Value","Unit"]],
    body:finRows,
    theme:"grid",
    styles:{fontSize:9,cellPadding:3.5},
    headStyles:{fillColor:_P,textColor:255,fontStyle:"bold"},
    columnStyles:{0:{fontStyle:"bold",cellWidth:100},1:{halign:"right",cellWidth:55},2:{cellWidth:25,halign:"center"}},
    alternateRowStyles:{fillColor:[245,250,255]},
    didAddPage:()=>{phHdr(doc,pw,"SECTION 3 OF 6 (cont.)")},
  });
  y=(doc as any).lastAutoTable.finalY+12;
  if(y<ph_-80){
    y=subHd(doc,y,pw,"3.2  Status Distribution");
    autoTable(doc,{
      startY:y,margin:{left:14,right:14},
      head:[["Status","Count","Total Principal"]],
      body:[
        ["Active (DISBURSED)",String(active.length),rT(active.reduce((s:number,l:any)=>s+Number(l.amount),0))],
        ["Fully Repaid",String(repaid.length),rT(repaid.reduce((s:number,l:any)=>s+Number(l.amount),0))],
        ["Pending / Approved",String(pending.length),rT(pending.reduce((s:number,l:any)=>s+Number(l.amount),0))],
        ["Defaulted",String(defaulted.length),rT(defaulted.reduce((s:number,l:any)=>s+Number(l.amount),0))],
        ["Rejected",String(rejected.length),rT(rejected.reduce((s:number,l:any)=>s+Number(l.amount),0))],
      ],
      theme:"striped",
      styles:{fontSize:9,cellPadding:3},
      headStyles:{fillColor:_P,textColor:255,fontStyle:"bold"},
      columnStyles:{1:{halign:"center",cellWidth:30},2:{halign:"right"}},
      alternateRowStyles:{fillColor:[245,250,255]},
      didAddPage:()=>{phHdr(doc,pw,"SECTION 3 OF 6 (cont.)")},
    });
    y=(doc as any).lastAutoTable.finalY+10;
  }
  phFtr(doc,pw,ph_,4,7,data.period);

  //  PAGE 5: DEFAULTED & REJECTED 
  doc.addPage();
  y=24;
  phHdr(doc,pw,"SECTION 4 OF 6");
  y=secBnr(doc,y,pw,"SECTION 4  DEFAULTED & REJECTED LOANS");
  if(defaulted.length>0){
    y=subHd(doc,y,pw,"4.1  Defaulted Loans ("+defaulted.length+")");
    autoTable(doc,{
      startY:y,margin:{left:14,right:14},
      head:[["#","Borrower","Phone","Principal","Total Owed","Days","Issued"]],
      body:defaulted.map((l:any,i:number)=>[
        i+1,
        ((l.borrower?.firstName||"")+" "+(l.borrower?.lastName||"")).trim(),
        l.borrower?.phone||"",
        rT(Number(l.amount)),
        rT(Number(l.totalAmount)),
        l.repaymentPeriod,
        new Date(l.createdAt).toLocaleDateString("en-GB"),
      ]),
      theme:"striped",styles:{fontSize:7.5,cellPadding:2.5,overflow:"linebreak",minCellHeight:8},
      headStyles:{fillColor:_R,textColor:255,fontStyle:"bold",fontSize:7.5},
      alternateRowStyles:{fillColor:[255,241,241]},
      columnStyles:{0:{cellWidth:8,halign:"center"},3:{halign:"right"},4:{halign:"right"}},
      didAddPage:()=>{phHdr(doc,pw,"SECTION 4 OF 6 (cont.)")},
    });
    y=(doc as any).lastAutoTable.finalY+10;
  } else {
    doc.setFontSize(8.5);doc.setFont("helvetica","italic");doc.setTextColor(..._S);
    doc.text("No defaulted loans in this period.",18,y+6);y+=16;
  }
  y=chkPg(doc,y,ph_,60);
  if(y===24){phHdr(doc,pw,"SECTION 4 OF 6 (cont.)");}
  if(rejected.length>0){
    y=subHd(doc,y,pw,"4.2  Rejected Loans ("+rejected.length+")");
    autoTable(doc,{
      startY:y,margin:{left:14,right:14},
      head:[["#","Borrower","Phone","Amount","Rate","Purpose","Date"]],
      body:rejected.map((l:any,i:number)=>[
        i+1,
        ((l.borrower?.firstName||"")+" "+(l.borrower?.lastName||"")).trim(),
        l.borrower?.phone||"",
        rT(Number(l.amount)),
        Number(l.interestRate).toFixed(1)+"%",
        l.purpose||"",
        new Date(l.createdAt).toLocaleDateString("en-GB"),
      ]),
      theme:"striped",styles:{fontSize:7.5,cellPadding:2.5,overflow:"linebreak",minCellHeight:8},
      headStyles:{fillColor:_S,textColor:255,fontStyle:"bold",fontSize:7.5},
      alternateRowStyles:{fillColor:[248,248,252]},
      columnStyles:{0:{cellWidth:8,halign:"center"},3:{halign:"right"}},
      didAddPage:()=>{phHdr(doc,pw,"SECTION 4 OF 6 (cont.)")},
    });
    y=(doc as any).lastAutoTable.finalY+10;
  } else {
    doc.setFontSize(8.5);doc.setFont("helvetica","italic");doc.setTextColor(..._S);
    doc.text("No rejected loans in this period.",18,y+6);y+=16;
  }
  phFtr(doc,pw,ph_,5,7,data.period);

  //  PAGE 6: FULL LOAN REGISTER 
  doc.addPage();
  y=24;
  phHdr(doc,pw,"SECTION 5 OF 6");
  y=secBnr(doc,y,pw,"SECTION 5  FULL LOAN REGISTER ("+loans.length+" loans)");
  y=subHd(doc,y,pw,"Complete listing of all loans in this period");
  autoTable(doc,{
    startY:y,margin:{left:14,right:14},
    head:[["#","Borrower","Phone","Principal","Total","Rate","Days","Status","Date"]],
    body:loans.map((l:any,i:number)=>[
      i+1,
      ((l.borrower?.firstName||"")+" "+(l.borrower?.lastName||"")).trim(),
      l.borrower?.phone||"",
      rT(Number(l.amount)),
      rT(Number(l.totalAmount)),
      Number(l.interestRate).toFixed(1)+"%",
      l.repaymentPeriod,
      l.status,
      new Date(l.createdAt).toLocaleDateString("en-GB"),
    ]),
    theme:"striped",styles:{fontSize:6.5,cellPadding:2,overflow:"linebreak",minCellHeight:7},
    headStyles:{fillColor:_P,textColor:255,fontStyle:"bold",fontSize:7},
    alternateRowStyles:{fillColor:[245,249,255]},
    columnStyles:{0:{cellWidth:8,halign:"center"},3:{halign:"right"},4:{halign:"right"},5:{halign:"center"},6:{halign:"center"}},
    didAddPage:()=>{phHdr(doc,pw,"SECTION 5 OF 6 (cont.)")},
  });
  phFtr(doc,pw,ph_,6,7,data.period);

  //  PAGE 7: RECOMMENDATIONS 
  doc.addPage();
  y=24;
  phHdr(doc,pw,"SECTION 6 OF 6");
  y=secBnr(doc,y,pw,"SECTION 6  FINANCIAL PERFORMANCE & STRATEGIC RECOMMENDATIONS");
  y=subHd(doc,y,pw,"6.1  Key Performance Metrics");
  autoTable(doc,{
    startY:y,margin:{left:14,right:14},
    head:[["Metric","Value","Notes"]],
    body:[
      ["Disbursement Rate",(totDisbursed>0?Math.round((totDisbursed/totPrincipal)*100):0)+"%","% of principal disbursed"],
      ["Collection Efficiency",colRate+"%","recovered vs disbursed"],
      ["Default Rate",(loans.length>0?((defaulted.length/loans.length)*100).toFixed(1):0)+"%","defaulted vs total"],
      ["Approval Rate",(loans.length>0?(((loans.length-rejected.length)/loans.length)*100).toFixed(1):0)+"%","approved vs applied"],
      ["Average Loan Size",rT(loans.length>0?totPrincipal/loans.length:0),"per loan"],
      ["Expected Interest Income",rT(totInterest),"total"],
    ],
    theme:"grid",styles:{fontSize:9,cellPadding:3.5},
    headStyles:{fillColor:_P,textColor:255,fontStyle:"bold"},
    columnStyles:{0:{fontStyle:"bold",cellWidth:80},1:{halign:"right",cellWidth:45}},
    alternateRowStyles:{fillColor:[245,250,255]},
  });
  y=(doc as any).lastAutoTable.finalY+12;
  y=subHd(doc,y,pw,"6.2  Strategic Recommendations");
  const recs=[
    {n:"1",t:"Improve Collections",d:"Follow up actively on the "+active.length+" active loans. Target weekly collection reviews to maintain above 80% collection rate."},
    {n:"2",t:"Risk Management",d:"With "+defaulted.length+" default(s), implement early-warning triggers on missed payments and escalation protocols."},
    {n:"3",t:"Portfolio Growth",d:"Current portfolio: "+loans.length+" loans / "+rT(totPrincipal)+". Target new verified borrowers to grow the book."},
    {n:"4",t:"Officer Accountability",d:"Track officer disbursement targets and recovery rates monthly and tie to performance reviews."},
    {n:"5",t:"Digital Records",d:"Ensure all loan agreements and guarantor documents are scanned and stored in the system."},
  ];
  recs.forEach(({n,t,d}:{n:string,t:string,d:string})=>{
    if(y>ph_-30){doc.addPage();y=24;phHdr(doc,pw,"SECTION 6 OF 6 (cont.)");}
    doc.setFillColor(..._L);doc.roundedRect(14,y,pw-28,18,2,2,"F");
    doc.setFillColor(..._P);doc.roundedRect(14,y,6,18,2,2,"F");doc.rect(18,y,2,18,"F");
    doc.setFontSize(8);doc.setFont("helvetica","bold");doc.setTextColor(..._P);
    doc.text(n+". "+t,24,y+7);
    const dw=doc.splitTextToSize(d,pw-36);
    doc.setFontSize(7.5);doc.setFont("helvetica","normal");doc.setTextColor(..._D);
    doc.text(dw,24,y+13);
    y+=20+Math.max(0,(dw.length-1)*4);
  });
  y+=8;
  if(y>ph_-50){doc.addPage();y=24;phHdr(doc,pw,"SECTION 6 OF 6 (cont.)");}
  doc.setDrawColor(180,190,200);doc.setLineWidth(0.4);
  doc.line(14,y+20,80,y+20);doc.line(110,y+20,pw-14,y+20);
  doc.setFontSize(8);doc.setFont("helvetica","normal");doc.setTextColor(..._S);
  doc.text("Authorized Signature",14,y+26);doc.text("Date: _______________",110,y+26);
  doc.text("AFAR MKOPO FASTA  |  Mbeya, Tanzania  |  0741525547",pw/2,y+36,{align:"center"});
  phFtr(doc,pw,ph_,7,7,data.period);

  doc.save("AFAR_Loans_Report_"+data.period.replace(/\s+/g,"_")+".pdf");
}