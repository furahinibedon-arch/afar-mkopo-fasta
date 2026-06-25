const fs = require("fs");
const p6 = `
  // 
  // PAGE 5  DEFAULTED & REJECTED LOANS
  // 
  doc.addPage();
  _hdr(doc, "Defaulted & Rejected Loans", period, 5, TotalPages, RP, RW, RL, RS);
  _ftr(doc, generatedAt, RS, RL);

  let y5 = 30;
  y5 = _banner(doc, "DEFAULTED LOANS (" + defaultedLoans.length + ")", y5, RP, RW);
  autoTable(doc, {
    startY: y5,
    margin: { left: 14, right: 14 },
    head: [["#","Client","Phone","Principal","Total Due","Rate","Period","Date","Days Ago"]],
    body: defaultedLoans.length === 0
      ? [["","No defaulted loans","","","","","","",""]]
      : defaultedLoans.map((l, i) => {
          const daysAgo = Math.floor((Date.now() - new Date(l.createdAt).getTime()) / 86400000);
          return [
            i + 1,
            _bname(l),
            l.borrower && l.borrower.phone ? l.borrower.phone : "",
            _rfmt(Number(l.amount)),
            _rfmt(Number(l.totalAmount)),
            Number(l.interestRate) + "%",
            l.repaymentPeriod + "d",
            new Date(l.createdAt).toLocaleDateString(),
            daysAgo + "d",
          ];
        }),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [RR[0], RR[1], RR[2]], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [RL[0], RL[1], RL[2]] },
  });

  const y5b = (doc as any).lastAutoTable.finalY + 8;
  _banner(doc, "REJECTED LOANS (" + rejectedLoans.length + ")", y5b, RP, RW);
  const y5c = y5b + 10;
  autoTable(doc, {
    startY: y5c,
    margin: { left: 14, right: 14 },
    head: [["#","Client","Phone","Requested","Total","Rate","Period","Officer","Date"]],
    body: rejectedLoans.length === 0
      ? [["","No rejected loans","","","","","","",""]]
      : rejectedLoans.map((l, i) => {
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
    headStyles: { fillColor: [RS[0], RS[1], RS[2]], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [RL[0], RL[1], RL[2]] },
  });
`;
fs.appendFileSync("lib/pdfGenerator.ts", p6, "utf8");
console.log("p6 done");
