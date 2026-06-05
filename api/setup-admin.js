const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  try {
    const email = 'kaisiroby12@gmail.com';
    const password = await bcrypt.hash('Admin@1234', 10);

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      // Already exists  just make sure role is ADMIN
      await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
      return res.json({ message: 'Admin role confirmed', email, password: 'Admin@1234' });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password,
        firstName: 'Admin',
        lastName: 'AFAR',
        phone: '0700000001',
        role: 'ADMIN',
      },
    });

    res.json({ message: 'Admin created successfully', email: user.email, password: 'Admin@1234' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await prisma.$disconnect();
  }
};