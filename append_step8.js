const fs = require("fs");
const p7 = `
  // ══════════════════════════════════════════
  // PAGE 6  FULL LOAN REGISTER
  // 
  doc.addPage();
  _hdr(doc, "Full Loan Register", period, 6, TotalPages, RP, RW, RL, RS);
  _ftr(doc, generatedAt, RS, RL);

  let y6 = 30;
  y6 = _banner(doc, "COMPLETE LOAN REGISTER (" + totalLoans + " LOANS)", y6, RP, RW);
  autoTable(doc, {
    startY: y6,
    margin: { left: 14, right: 14 },
    head: [["#","Client","Phone","Principal","Total","Rate","Period","Status","Officer","Date"]],
    body: loans.length === 0
      ? [["","No loans found","","","","","","","",""]]
      : loans.map((l, i) => {
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
            l.status,
            off,
            new Date(l.createdAt).toLocaleDateString(),
          ];
        }),
    styles: { fontSize: 6.5, cellPadding: 1.8 },
    headStyles: { fillColor: [RP[0], RP[1], RP[2]], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [RL[0], RL[1], RL[2]] },
    columnStyles: {
      7: {
        fontStyle: "bold",
        textColor: [50, 50, 50],
      },
    },
  });
`;
fs.appendFileSync("lib/pdfGenerator.ts", p7, "utf8");
console.log("p7 done");
