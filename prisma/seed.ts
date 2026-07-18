import 'dotenv/config';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  // Load from environment variables, fallback to defaults if not set
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sportcenter.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password_default_123';

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
    },
    create: {
      email: adminEmail,
      nama: 'Super Admin',
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
