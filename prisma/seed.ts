import 'dotenv/config';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminNama = process.env.ADMIN_NAMA;

  if (!adminEmail || !adminPassword || !adminNama) {
    throw new Error(
      "Missing required environment variables: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAMA"
    );
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // 1) Create Venue first (required for Court.venueId)
  const venue = await prisma.venue.upsert({
    where: { id: 'venue-courtgrid-001' },
    update: {},
    create: {
      id: 'venue-courtgrid-001',
      name: 'CourtGrid Sport Center',
      address: 'Jl. Sport Center No. 1',
      city: 'Jakarta',
    },
  });
  console.log('✓ Venue synchronized:', venue.name);

  // 2) Upsert Super Admin
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
  console.log('✓ Admin account synchronized:', admin.email);

  // 3) Create 5 courts (2 FUTSAL, 3 BADMINTON) with venueId
  const courts = [
    {
      name: "Futsal Court A",
      type: "FUTSAL" as const,
      pricePerHour: 150000,
      isActive: true,
      imageUrl: "/futsal_arena_modern.webp",
    },
    {
      name: "Futsal Court B",
      type: "FUTSAL" as const,
      pricePerHour: 150000,
      isActive: true,
      imageUrl: "/futsal2.webp",
    },
    {
      name: "Badminton Court 1",
      type: "BADMINTON" as const,
      pricePerHour: 50000,
      isActive: true,
      imageUrl: "/badminton_court_pro.webp",
    },
    {
      name: "Badminton Court 2",
      type: "BADMINTON" as const,
      pricePerHour: 50000,
      isActive: true,
      imageUrl: "/badminton2.webp",
    },
    {
      name: "Badminton Court 3",
      type: "BADMINTON" as const,
      pricePerHour: 50000,
      isActive: true,
      imageUrl: "/badminton3.webp",
    },
  ];

  for (const court of courts) {
    const existing = await prisma.court.findFirst({
      where: { name: court.name },
    });

    if (!existing) {
      await prisma.court.create({
        data: {
          ...court,
          venueId: venue.id,
        },
      });
      console.log('✓ Created court:', court.name);
    }
  }

  // 4) Demo rows: gated behind SEED_DEMO=true
  if (process.env.SEED_DEMO === 'true') {
    const wildanPassword = await bcrypt.hash("password123", 10);
    const wildanUser = await prisma.user.upsert({
      where: { email: "wildan@gmail.com" },
      update: {
        name: "Wildan",
        passwordHash: wildanPassword,
        role: "CUSTOMER",
      },
      create: {
        email: "wildan@gmail.com",
        name: "Wildan",
        passwordHash: wildanPassword,
        role: "CUSTOMER",
      },
    });
    console.log('✓ Created/Updated customer user Wildan (wildan@gmail.com)');

    const existingWildanRes = await prisma.reservation.findFirst({
      where: { userId: wildanUser.id },
    });

    if (!existingWildanRes) {
      const futsalCourt = await prisma.court.findFirst({ where: { type: "FUTSAL" } });
      const badmintonCourt = await prisma.court.findFirst({ where: { type: "BADMINTON" } });

      // DM-2: Dates in Asia/Jakarta, stored as UTC timestamptz.
      const jakartaNow = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" });
      const jakartaDateStr = jakartaNow.split(" ")[0]; // "YYYY-MM-DD"
      const jakartaTz = "+07:00";

      const tomorrowDate = new Date(`${jakartaDateStr}T00:00:00${jakartaTz}`);
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const tomorrowDateStr = tomorrowDate.toISOString().split("T")[0];

      if (futsalCourt) {
        const res1 = await prisma.reservation.create({
          data: {
            userId: wildanUser.id,
            courtId: futsalCourt.id,
            date: new Date(`${jakartaDateStr}T00:00:00${jakartaTz}`),
            startTime: new Date(`${jakartaDateStr}T19:00:00${jakartaTz}`),
            endTime: new Date(`${jakartaDateStr}T20:00:00${jakartaTz}`),
            totalPrice: 150000,
            status: "DP_PAID",
            payment: {
              create: {
                dpAmount: 75000,
                status: "VERIFIED",
              },
            },
          },
        });
        console.log("✓ Created dummy reservation 1 for Wildan:", res1.id);
      }

      if (badmintonCourt) {
        const res2 = await prisma.reservation.create({
          data: {
            userId: wildanUser.id,
            courtId: badmintonCourt.id,
            date: new Date(`${tomorrowDateStr}T00:00:00${jakartaTz}`),
            startTime: new Date(`${tomorrowDateStr}T16:00:00${jakartaTz}`),
            endTime: new Date(`${tomorrowDateStr}T17:00:00${jakartaTz}`),
            totalPrice: 50000,
            status: "DP_PAID",
            payment: {
              create: {
                dpAmount: 25000,
                status: "VERIFIED",
              },
            },
          },
        });
        console.log("✓ Created dummy reservation 2 for Wildan:", res2.id);
      }
    }
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
