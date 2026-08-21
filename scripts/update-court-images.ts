import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function updateCourtImages() {
  const updates = [
    { name: "Futsal Court A", imageUrl: "/futsal_arena_modern.webp" },
    { name: "Futsal Court B", imageUrl: "/futsal2.webp" },
    { name: "Badminton Court 1", imageUrl: "/badminton_court_pro.webp" },
    { name: "Badminton Court 2", imageUrl: "/badminton2.webp" },
    { name: "Badminton Court 3", imageUrl: "/badminton3.webp" },
  ];

  for (const item of updates) {
    await prisma.court.updateMany({
      where: { name: item.name },
      data: { imageUrl: item.imageUrl },
    });
    console.log(`✓ Updated ${item.name} image -> ${item.imageUrl}`);
  }
}

updateCourtImages()
  .catch((e) => {
    console.error('Update failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
