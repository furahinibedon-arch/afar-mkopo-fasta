const fs = require("fs");
const p4 = `
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
`;
fs.appendFileSync("lib/pdfGenerator.ts", p4, "utf8");
console.log("p4 done");
