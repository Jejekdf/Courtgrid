import { prisma } from "../lib/prisma";

async function main() {
  console.log("Testing database connection via @prisma/adapter-pg...");
  try {
    const usersCount = await prisma.user.count();
    console.log(`Successfully connected! Number of users: ${usersCount}`);
    
    const lapangans = await prisma.lapangan.findMany({ take: 5 });
    console.log("Lapangans found:", lapangans);
  } catch (error) {
    console.error("Database connection test failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
