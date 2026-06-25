const fs = require("fs");
const p5 = `
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
`;
fs.appendFileSync("lib/pdfGenerator.ts", p5, "utf8");
console.log("p5 done");
