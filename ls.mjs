import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const users = await prisma.user.findMany({
  select: { email: true, username: true, role: true },
});

console.log(`\n📋 Có ${users.length} user:\n`);
users.forEach((u, i) => {
  const icon = u.role === "admin" ? "👑" : "👤";
  console.log(`${i + 1}. ${icon} ${u.email} | ${u.username} | role=${u.role}`);
});

await prisma.$disconnect();
