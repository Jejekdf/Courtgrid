import 'dotenv/config';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminNama = process.env.ADMIN_NAMA;

  if (!adminEmail || !adminPassword || !adminNama) {
    throw new Error(
      '❌ ADMIN_EMAIL, ADMIN_PASSWORD, dan ADMIN_NAMA harus diisi di file .env'
    );
  }

  // Hapus admin lama jika ada
  await prisma.user.deleteMany({
    where: {
      email: { not: adminEmail }, 
      role: 'ADMIN',
    },
  });

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      nama: adminNama,
      password: hashedPassword,
    },
    create: {
      email: adminEmail,
      nama: adminNama,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin account secured and seeded for:', admin.email);
}

main()
  .catch((e) => {
    console.error("❌ Failed to create admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
