import 'dotenv/config';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminNama = process.env.ADMIN_NAMA;

  if (!adminEmail || !adminPassword || !adminNama) {
    throw new Error(
      'Missing required environment variables: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAMA'
    );
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminNama,
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email: adminEmail,
      name: adminNama,
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✓ Admin account synchronized to Supabase PostgreSQL database:', admin.email);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
