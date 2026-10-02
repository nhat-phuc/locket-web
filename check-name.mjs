import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const users = await prisma.user.findMany({
  select: { email: true, username: true, name: true, role: true },
});

console.log("📋 User trong DB:\n");
users.forEach((u) => {
  console.log(`📧 ${u.email}`);
  console.log(`   username: ${u.username}`);
  console.log(`   name: ${u.name || "(trống)"}`);
  console.log(`   role: ${u.role}\n`);
});

await prisma.$disconnect();
