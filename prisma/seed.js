const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const email = 'kaisiroby12@gmail.com';

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    // Just upgrade to ADMIN
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
    console.log('Existing user upgraded to ADMIN:', email);
    return;
  }

  const hashedPassword = await bcrypt.hash('Admin@1234', 10);

  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'AFAR',
      phone: '0700000001',
      role: 'ADMIN',
    },
  });

  console.log('Admin created:', admin.email);
  console.log('Password: Admin@1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });