import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server-auth";

const JWT_SECRET = process.env.JWT_SECRET || "afar-mkopo-fasta-secret";

async function auth(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "").trim() || "";
  if (!token) throw Object.assign(new Error("No token"), { status: 401 });
  const payload = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  if (!["LOAN_OFFICER","ADMIN","DIRECTOR","CEO"].includes(payload.role)) {
    throw Object.assign(new Error("Access denied"), { status: 403 });
  }
  return payload;
}

/** GET /api/loans/staff-apply?phone=07XX - lookup borrower by phone */
export async function GET(request: NextRequest) {
  try {
    await auth(request);
    const phone = request.nextUrl.searchParams.get("phone");
    if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { phone }, include: { borrowerProfile: true } });
    if (!user) return NextResponse.json({ found: false });
    return NextResponse.json({ found: true, borrower: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, profilePictureUrl: user.profilePictureUrl, borrowerProfile: user.borrowerProfile } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 500 });
  }
}

/** POST /api/loans/staff-apply - staff submits loan on behalf of a customer */
export async function POST(request: NextRequest) {
  try {
    const staff = await auth(request);
    const body = await request.json();
    const {
      borrowerPhone, borrowerEmail, firstName, lastName,
      nin, dateOfBirth, gender, maritalStatus,
      address, country, region, district, houseNumber, spouseName,
      businessName, businessLocation, businessSince,
      loanAmount, amount, interestRate = 20, repaymentPeriod = 30,
      loanPurpose, purpose, repaymentType, ...rest
    } = body;
    if (!borrowerPhone) return NextResponse.json({ error: "borrowerPhone is required" }, { status: 400 });

    let borrower = await prisma.user.findUnique({ where: { phone: borrowerPhone } });
    if (!borrower) {
      if (!firstName || !lastName)
        return NextResponse.json({ error: "Customer not found. Provide name to register them." }, { status: 404 });
      const email = borrowerEmail || `walkin.${borrowerPhone}.${Date.now()}@afarmkopo.placeholder`;
      const password = await bcrypt.hash(`walkin-${borrowerPhone}`, 10);
      borrower = await prisma.user.create({ data: { email, password, firstName, lastName, phone: borrowerPhone, role: "BORROWER", isActive: true } });
    }

    try {
      const p = {
        userId: borrower.id, nin: nin||null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address: address||null, country: country||"Tanzania",
        region: region||null, district: district||null,
        gender: gender||null, maritalStatus: maritalStatus||null,
        houseNumber: houseNumber||null, spouseName: spouseName||null,
        businessName: businessName||null, businessLocation: businessLocation||null,
        businessSince: businessSince||null,
      };
      await prisma.borrowerProfile.upsert({ where: { userId: borrower.id }, update: p, create: p });
    } catch(_) {}

    const amt = Number(loanAmount || amount || 0);
    const rate = Number(interestRate);
    const period = Number(repaymentPeriod);
    const total = amt * (1 + rate / 100);
    const monthly = total / period;
    const purposeField = JSON.stringify({
      purpose: loanPurpose || purpose || "",
      __appData: { ...rest, repaymentType, appliedByStaff: true, staffId: staff.userId },
    });

    const loan = await prisma.loan.create({
      data: { borrowerId: borrower.id, requestedAmount: amt, amount: amt, interestRate: rate, repaymentPeriod: period, totalAmount: total, monthlyPayment: monthly, purpose: purposeField },
    });
    await prisma.staffAction.create({
      data: { loanId: loan.id, staffId: staff.userId, action: "APPLIED_ON_BEHALF",
        notes: `Applied on behalf of ${borrower.firstName} ${borrower.lastName} (${borrowerPhone})` },
    });
    return NextResponse.json({ loan, borrower: { id: borrower.id, firstName: borrower.firstName, lastName: borrower.lastName, phone: borrower.phone, email: borrower.email } }, { status: 201 });
  } catch (e: any) {
    console.error("[staff-apply]", e);
    return NextResponse.json({ error: e.message || "Failed" }, { status: e.status || 500 });
  }
}
