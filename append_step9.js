const fs = require("fs");
const p8 = `
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

  doc.save("AFAR_MKOPO_FASTA_Annual_Report_" + period.replace(/\\s+/g, "_") + ".pdf");
}
`;
fs.appendFileSync("lib/pdfGenerator.ts", p8, "utf8");
console.log("p8 done");
