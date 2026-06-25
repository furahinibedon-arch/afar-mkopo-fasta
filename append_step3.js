const fs = require("fs");
const p2 = `
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
`;
fs.appendFileSync("lib/pdfGenerator.ts", p2, "utf8");
console.log("p2 done");
