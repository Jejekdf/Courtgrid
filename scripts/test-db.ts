import { prisma } from "../lib/prisma";

async function main() {
  console.log("Testing database connection via @prisma/adapter-pg...");
  try {
    const usersCount = await prisma.user.count();
    console.log(`Successfully connected! Number of users: ${usersCount}`);
    
    const courts = await prisma.court.findMany({ take: 5 });
    console.log("Courts found:", courts);
  } catch (error) {
    console.error("Database connection test failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
