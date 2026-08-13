import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function updateCourtImages() {
  const updates = [
    { name: "Futsal Court A", imageUrl: "/futsal_arena_modern.jpg" },
    { name: "Futsal Court B", imageUrl: "/futsal2.png" },
    { name: "Badminton Court 1", imageUrl: "/badminton_court_pro.jpg" },
    { name: "Badminton Court 2", imageUrl: "/badminton2.png" },
    { name: "Badminton Court 3", imageUrl: "/badminton3.png" },
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
