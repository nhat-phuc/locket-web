import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const admins = await prisma.user.findMany({
  where: { role: "admin" },
  select: { email: true, username: true, role: true, isActive: true, isBanned: true },
});

console.log(`👑 ${admins.length} admins trong DB:`);
admins.forEach((a) => console.log(`   - ${a.email} | active=${a.isActive} | banned=${a.isBanned}`));

await prisma.$disconnect();
