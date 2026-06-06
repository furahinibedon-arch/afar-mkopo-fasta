const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const loans = await prisma.loan.findMany({
        include: { borrower: true },
      });
      res.json(loans);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch loans' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        firstName, lastName, dateOfBirth, gender, maritalStatus,
        address, houseNumber, spouseName, phone, businessName,
        businessLocation, businessSince, loanPurpose, loanAmount,
        loanAmountWords, dailyPayment, interestRate,
        guarantor1Name, guarantor1Address, guarantor1HouseNumber,
        guarantor1Business, guarantor1Relationship, guarantor1Phone,
        guarantor1Collateral, guarantor2Name, guarantor2Address,
        guarantor2HouseNumber, guarantor2Business, guarantor2Relationship,
        guarantor2Phone, guarantor2Collateral
      } = req.body;

      const loan = await prisma.loan.create({
        data: {
          amount: Number(loanAmount),
          interestRate: Number(interestRate) || 20,
          repaymentPeriod: 30,
          totalAmount: Number(loanAmount) * 1.2,
          monthlyPayment: Number(dailyPayment) || (Number(loanAmount) * 1.2 / 30),
          status: 'PENDING',
          purpose: loanPurpose || '',
          borrower: {
            connectOrCreate: {
              where: { email: phone + '@example.com' },
              create: {
                email: phone + '@example.com',
                password: '',
                firstName,
                lastName,
                phone,
              },
            },
          },
          borrowerProfile: {
            create: {
              idNumber: '',
              address: address || '',
              dateOfBirth: new Date(dateOfBirth || new Date()),
              kycVerified: false,
              guarantorName: guarantor1Name || '',
              guarantorPhone: guarantor1Phone || '',
              guarantorAddress: guarantor1Address || '',
            },
          },
        },
        include: { borrower: true }
      });

      res.json(loan);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create loan' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
