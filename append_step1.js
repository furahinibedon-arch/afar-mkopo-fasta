const fs = require("fs");
const content = `

//  Report PDF helpers 

function _rfmt(n) {
  if (isNaN(n) || n == null) return "Tsh 0";
  return new Intl.NumberFormat("en-TZ", {
    style: "currency", currency: "TZS", minimumFractionDigits: 0,
    notation: Math.abs(n) >= 1000000 ? "compact" : "standard", compactDisplay: "short"
  }).format(n);
}

function _bname(loan) {
  const b = loan && loan.borrower;
  if (!b) return "Unknown";
  return ((b.firstName || "") + " " + (b.lastName || "")).trim() || "Unknown";
}

function _hdr(doc, title, period, pageNum, totalPages, RP, RW, RL, RS) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(RP[0], RP[1], RP[2]);
  doc.rect(0, 0, W, 18, "F");
  doc.setTextColor(RW[0], RW[1], RW[2]);
  doc.setFontSize(11); doc.setFont("helvetica", "bold");
  doc.text("AFAR MKOPO FASTA", 14, 11);
  doc.setFontSize(8); doc.setFont("helvetica", "normal");
  doc.text(title, W / 2, 11, { align: "center" });
  doc.text("Page " + pageNum + " / " + totalPages, W - 14, 11, { align: "right" });
  doc.setFillColor(RL[0], RL[1], RL[2]);
  doc.rect(0, 18, W, 6, "F");
  doc.setTextColor(RS[0], RS[1], RS[2]);
  doc.setFontSize(7);
  doc.text(period, 14, 22);
  doc.text("Annual Company Report", W - 14, 22, { align: "right" });
  doc.setTextColor(0, 0, 0);
}

function _ftr(doc, generatedAt, RS, RL) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  doc.setFillColor(RL[0], RL[1], RL[2]);
  doc.rect(0, H - 10, W, 10, "F");
  doc.setTextColor(RS[0], RS[1], RS[2]);
  doc.setFontSize(7);
  doc.text("AFAR MKOPO FASTA  CONFIDENTIAL", 14, H - 3.5);
  doc.text("Generated: " + generatedAt, W - 14, H - 3.5, { align: "right" });
  doc.setTextColor(0, 0, 0);
}

function _banner(doc, text, y, RP, RW) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(RP[0], RP[1], RP[2]);
  doc.rect(14, y, W - 28, 7, "F");
  doc.setTextColor(RW[0], RW[1], RW[2]);
  doc.setFontSize(9); doc.setFont("helvetica", "bold");
  doc.text(text, 17, y + 5);
  doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "normal");
  return y + 10;
}

function _sub(doc, text, y, RD) {
  doc.setTextColor(RD[0], RD[1], RD[2]);
  doc.setFontSize(9); doc.setFont("helvetica", "bold");
  doc.text(text, 14, y);
  doc.setLineWidth(0.3);
  doc.setDrawColor(200, 200, 200);
  const W = doc.internal.pageSize.getWidth();
  doc.line(14, y + 1.5, W - 14, y + 1.5);
  doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "normal");
  return y + 6;
}

function _kpi(doc, x, y, w, h, label, value, sub, color, RW, RL) {
  doc.setFillColor(RL[0], RL[1], RL[2]);
  doc.roundedRect(x, y, w, h, 2, 2, "F");
  doc.setFillColor(color[0], color[1], color[2]);
  doc.rect(x, y, 2.5, h, "F");
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFontSize(7); doc.setFont("helvetica", "bold");
  doc.text(label.toUpperCase(), x + 5, y + 5);
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.text(value, x + 5, y + 12);
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7); doc.setFont("helvetica", "normal");
  doc.text(sub, x + 5, y + 17);
  doc.setTextColor(0, 0, 0);
}
`;
fs.appendFileSync("lib/pdfGenerator.ts", content, "utf8");
console.log("helpers appended");
