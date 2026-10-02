import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const email = "trannhatphuc1234xx@gmail.com";

const user = await prisma.user.findUnique({ where: { email } });
if (!user) {
  console.error("❌ Không tìm thấy user");
  console.log("\n📋 Danh sách user:");
  const all = await prisma.user.findMany({ select: { email: true, username: true, role: true } });
  all.forEach((u) => console.log(`   - ${u.email} | ${u.username} | role=${u.role}`));
  process.exit(1);
}

const updated = await prisma.user.update({
  where: { email },
  data: { role: "admin", isActive: true, isBanned: false },
});

console.log("✅ Đã nâng admin:");
console.log("   Email:", updated.email);
console.log("   Username:", updated.username);
console.log("   Role:", updated.role);

await prisma.$disconnect();
