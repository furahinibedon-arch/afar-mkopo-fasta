const { authenticateToken, authorizeRole } = require('../_lib/auth');
const prisma = require('../_lib/prisma');

module.exports = async (req, res) => {
  authenticateToken(req, res, async () => {
    if (req.method === 'POST') {
      authorizeRole('BORROWER')(req, res, async () => {
        try {
          const {
            amount,
            interestRate,
            repaymentPeriod,
            purpose,
            firstName,
            lastName,
            dateOfBirth,
            gender,
            maritalStatus,
            address,
            houseNumber,
            spouseName,
            phone,
            businessName,
            businessLocation,
            businessSince,
            loanPurpose,
            loanAmount,
            loanAmountWords,
            dailyPayment,
            guarantor1Name,
            guarantor1Address,
            guarantor1HouseNumber,
            guarantor1Business,
            guarantor1Relationship,
            guarantor1Phone,
            guarantor1Collateral,
            guarantor2Name,
            guarantor2Address,
            guarantor2HouseNumber,
            guarantor2Business,
            guarantor2Relationship,
            guarantor2Phone,
            guarantor2Collateral,
          } = req.body;

          const loanAmt = parseFloat(loanAmount || amount || 0);
          const rate = parseFloat(interestRate || 20);
          const period = parseInt(repaymentPeriod || 30);
          const total = loanAmt * (1 + rate / 100);
          const monthly = total / period;

          const loan = await prisma.loan.create({
            data: {
              borrowerId: req.user.userId,
              amount: loanAmt,
              interestRate: rate,
              repaymentPeriod: period,
              totalAmount: total,
              monthlyPayment: monthly,
              purpose: loanPurpose || purpose || '',
              applicationData: {
                firstName,
                lastName,
                dateOfBirth,
                gender,
                maritalStatus,
                address,
                houseNumber,
                spouseName,
                phone,
                businessName,
                businessLocation,
                businessSince,
                loanAmountWords,
                dailyPayment,
                guarantor1Name,
                guarantor1Address,
                guarantor1HouseNumber,
                guarantor1Business,
                guarantor1Relationship,
                guarantor1Phone,
                guarantor1Collateral,
                guarantor2Name,
                guarantor2Address,
                guarantor2HouseNumber,
                guarantor2Business,
                guarantor2Relationship,
                guarantor2Phone,
                guarantor2Collateral,
              },
            },
          });
          res.status(201).json(loan);
        } catch (error) {
          console.error('Loan creation error:', error);
          res.status(500).json({ error: 'Failed to apply for loan', details: error.message });
        }
      });
    } else if (req.method === 'GET') {
      try {
        const loans = await prisma.loan.findMany({
          where: { borrowerId: req.user.userId },
          orderBy: { createdAt: 'desc' },
        });
        res.json(loans);
      } catch (error) {
        console.error('Fetch loans error:', error);
        res.status(500).json({ error: 'Failed to fetch loans' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  });
};
