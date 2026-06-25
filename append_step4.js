const fs = require("fs");
const p3 = `
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
`;
fs.appendFileSync("lib/pdfGenerator.ts", p3, "utf8");
console.log("p3 done");
