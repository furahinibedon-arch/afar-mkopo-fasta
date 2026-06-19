import { NextRequest, NextResponse } from "next/server";
import { prisma, getCurrentUser } from "@/lib/server-auth";

function getPeriodRange(period, year, month, quarter) {
  const y = parseInt(year || String(new Date().getFullYear()));
  let start, end;
  if (period === "monthly" && month) {
    const m = parseInt(month) - 1;
    start = new Date(y, m, 1);
    end   = new Date(y, m + 1, 0, 23, 59, 59, 999);
  } else if (period === "quarterly" && quarter) {
    const q = parseInt(quarter);
    const sm = (q - 1) * 3;
    start = new Date(y, sm, 1);
    end   = new Date(y, sm + 3, 0, 23, 59, 59, 999);
  } else {
    start = new Date(y, 0, 1);
    end   = new Date(y, 11, 31, 23, 59, 59, 999);
  }
  return { start, end };
}


// Parse purpose field stored as JSON {purpose: "...", __appData: {...}}
function parseLoanPurpose(loan) {
  try {
    const parsed = JSON.parse(loan.purpose || "{}");
    if (parsed.__appData) return { ...loan, purpose: parsed.purpose || "", applicationData: parsed.__appData };
  } catch(_) {}
  return loan;
}

export async function GET(req) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await getCurrentUser(req as any); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = req.nextUrl;
    const type    = searchParams.get("type")    || "loans";
    const period  = searchParams.get("period")  || "yearly";
    const year    = searchParams.get("year")    || String(new Date().getFullYear());
    const month   = searchParams.get("month")   || undefined;
    const quarter = searchParams.get("quarter") || undefined;
    const id      = searchParams.get("id")      || undefined;
    const { start, end } = getPeriodRange(period, year, month, quarter);

    if (type === "loans") {
      const loans = await prisma.loan.findMany({
        where: { createdAt: { gte: start, lte: end } },
        include: {
          borrower: { select: { firstName: true, lastName: true, phone: true, email: true } },
          staffActions: { include: { staff: { select: { firstName: true, lastName: true, role: true } } }, orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
      });
      const totalAmount    = loans.reduce((s, l) => s + Number(l.amount), 0);
      const totalDisbursed = loans.filter(l => ["DISBURSED","REPAID"].includes(l.status)).reduce((s, l) => s + Number(l.amount), 0);
      const totalRepaid    = loans.filter(l => l.status === "REPAID").reduce((s, l) => s + Number(l.totalAmount), 0);
      const byStatus       = loans.reduce((acc, l) => { acc[l.status] = (acc[l.status]||0)+1; return acc; }, {});
      const parsedLoans = loans.map(parseLoanPurpose);
      return NextResponse.json({ type, period, year, month, quarter, start, end, loans: parsedLoans, summary: { total: loans.length, totalAmount, totalDisbursed, totalRepaid, byStatus } });
    }

    if (type === "client") {
      if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
      const borrower = await prisma.user.findUnique({
        where: { id },
        select: { id: true, firstName: true, lastName: true, phone: true, email: true, createdAt: true,
          borrowerProfile: { select: { nin: true, region: true, district: true, businessName: true } } },
      });
      if (!borrower) return NextResponse.json({ error: "Borrower not found" }, { status: 404 });
      const loans = await prisma.loan.findMany({
        where: { borrowerId: id, createdAt: { gte: start, lte: end } },
        include: {
          staffActions: { include: { staff: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: "desc" }, take: 1 },
          repayments: true,
        },
        orderBy: { createdAt: "desc" },
      });
      const totalBorrowed = loans.reduce((s, l) => s + Number(l.amount), 0);
      const totalRepaid   = loans.filter(l => l.status === "REPAID").reduce((s, l) => s + Number(l.totalAmount), 0);
      const outstanding   = loans.filter(l => !["REPAID","REJECTED"].includes(l.status)).reduce((s, l) => s + Number(l.totalAmount), 0);
      const byStatus      = loans.reduce((acc, l) => { acc[l.status] = (acc[l.status]||0)+1; return acc; }, {});
      const parsedClientLoans = loans.map(parseLoanPurpose);
      return NextResponse.json({ type, period, year, month, quarter, start, end, borrower, loans: parsedClientLoans, summary: { total: loans.length, totalBorrowed, totalRepaid, outstanding, byStatus } });
    }

    if (type === "officer") {
      if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
      const officer = await prisma.user.findUnique({ where: { id }, select: { id: true, firstName: true, lastName: true, phone: true, email: true, role: true } });
      if (!officer) return NextResponse.json({ error: "Officer not found" }, { status: 404 });
      const actions = await prisma.staffAction.findMany({
        where: { staffId: id, createdAt: { gte: start, lte: end } },
        include: { loan: { include: { borrower: { select: { firstName: true, lastName: true, phone: true } } } } },
        orderBy: { createdAt: "desc" },
      });
      const seenLoans = new Map();
      actions.forEach(a => { if (!seenLoans.has(a.loanId)) seenLoans.set(a.loanId, a.loan); });
      const loans    = Array.from(seenLoans.values());
      const approved = actions.filter(a => a.action === "APPROVED").length;
      const rejected = actions.filter(a => a.action === "REJECTED").length;
      const totalValue = loans.reduce((s, l) => s + Number(l?.amount||0), 0);
      return NextResponse.json({ type, period, year, month, quarter, start, end, officer, actions, loans, summary: { totalActions: actions.length, totalLoans: loans.length, approved, rejected, totalValue } });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
