import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const users = await prisma.user.findMany({
  where: { role: "admin" },
  select: { email: true, username: true, role: true, isActive: true, isBanned: true },
});

console.log("👑 Admins trong DB:");
users.forEach((u) => {
  console.log(`   - ${u.email} | active=${u.isActive} | banned=${u.isBanned}`);
});

await prisma.$disconnect();
