import { prisma } from '../lib/prisma';

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sportcenter.com' },
    update: {},
    create: {
      email: 'admin@sportcenter.com',
      nama: 'Super Admin',
      password: 'password_rahasia', 
      role: 'ADMIN',
    },
  });

  console.log('Admin account secured:', admin.email);
}

main()
  .catch((e) => {
    console.error("Failed to create admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
