import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  console.log('ADMIN count:', admins.length);
  admins.forEach(a => console.log(JSON.stringify(a)));
  const totalUsers = await prisma.user.count();
  console.log('Total users:', totalUsers);
}

main().finally(() => prisma.$disconnect());
