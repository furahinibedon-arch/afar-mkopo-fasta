
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const logError = (error, context = {}) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, {
    message: error.message,
    stack: error.stack,
    context
  });
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logError(err, { endpoint: req.path });
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.sendStatus(403);
    }
    next();
  };
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AFAR MKOPO FASTA API is running!' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, firstName, lastName, phone },
    });
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { ...user, password: undefined } });
  } catch (error) {
    logError(error, { endpoint: '/api/auth/register', body: req.body });
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { ...user, password: undefined } });
  } catch (error) {
    logError(error, { endpoint: '/api/auth/login', body: req.body });
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { borrowerProfile: true, loans: true },
    });
    res.json({ ...user, password: undefined });
  } catch (error) {
    logError(error, { endpoint: '/api/me', userId: req.user.userId });
    res.status(500).json({ error: 'Failed to fetch user', details: error.message });
  }
});

app.post('/api/borrower/profile', authenticateToken, authorizeRole('BORROWER'), async (req, res) => {
  try {
    const profile = await prisma.borrowerProfile.upsert({
      where: { userId: req.user.userId },
      update: req.body,
      create: { ...req.body, userId: req.user.userId },
    });
    res.json(profile);
  } catch (error) {
    logError(error, { endpoint: '/api/borrower/profile', userId: req.user.userId, body: req.body });
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

app.post('/api/loans', authenticateToken, authorizeRole('BORROWER'), async (req, res) => {
  try {
    const { amount, requestedAmount, interestRate, repaymentPeriod, purpose } = req.body;
    const finalRequestedAmount = requestedAmount || amount;
    const totalAmount = Number(finalRequestedAmount) * (1 + Number(interestRate) / 100);
    const monthlyPayment = totalAmount / Number(repaymentPeriod);
    const loan = await prisma.loan.create({
      data: {
        borrowerId: req.user.userId,
        requestedAmount: finalRequestedAmount,
        amount: finalRequestedAmount,
        interestRate,
        repaymentPeriod,
        totalAmount,
        monthlyPayment,
        purpose,
      },
    });
    res.json(loan);
  } catch (error) {
    logError(error, { endpoint: '/api/loans', userId: req.user.userId, body: req.body });
    res.status(500).json({ error: 'Failed to apply for loan', details: error.message });
  }
});

app.get('/api/loans', authenticateToken, async (req, res) => {
  try {
    let loans;
    if (req.user.role === 'BORROWER') {
      loans = await prisma.loan.findMany({
        where: { borrowerId: req.user.userId },
        include: { borrower: true, repayments: true },
      });
    } else {
      loans = await prisma.loan.findMany({
        include: { borrower: true, repayments: true },
      });
    }
    res.json(loans);
  } catch (error) {
    logError(error, { endpoint: '/api/loans', userId: req.user.userId });
    res.status(500).json({ error: 'Failed to fetch loans', details: error.message });
  }
});

app.patch('/api/loans/:id/status', authenticateToken, authorizeRole('LOAN_OFFICER', 'ADMIN'), async (req, res) => {
  try {
    const { status } = req.body;
    const loan = await prisma.loan.update({
      where: { id: req.params.id },
      data: { status, disbursedAt: status === 'DISBURSED' ? new Date() : null },
    });
    res.json(loan);
  } catch (error) {
    logError(error, { endpoint: '/api/loans/:id/status', loanId: req.params.id, userId: req.user.userId, body: req.body });
    res.status(500).json({ error: 'Failed to update loan status', details: error.message });
  }
});

app.get('/api/dashboard/analytics', authenticateToken, authorizeRole('ADMIN', 'LOAN_OFFICER'), async (req, res) => {
  try {
    const totalDisbursed = await prisma.transaction.aggregate({
      where: { type: 'DISBURSEMENT' },
      _sum: { amount: true },
    });
    const totalRepaid = await prisma.transaction.aggregate({
      where: { type: 'REPAYMENT' },
      _sum: { amount: true },
    });
    const loans = await prisma.loan.findMany({ include: { borrower: true, repayments: true } });
    const overdueRepayments = await prisma.repayment.findMany({
      where: { status: 'OVERDUE' },
      include: { loan: { include: { borrower: true } } },
    });
    res.json({
      totalDisbursed: totalDisbursed._sum.amount || 0,
      totalRepaid: totalRepaid._sum.amount || 0,
      totalBalance: (totalDisbursed._sum.amount || 0) - (totalRepaid._sum.amount || 0),
      loans,
      overdueRepayments,
    });
  } catch (error) {
    logError(error, { endpoint: '/api/dashboard/analytics', userId: req.user.userId });
    res.status(500).json({ error: 'Failed to fetch analytics', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
