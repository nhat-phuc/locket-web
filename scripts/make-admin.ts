import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const email = process.argv[2];
  if (!email) { console.log("Usage: npx tsx scripts/make-admin.ts <email>"); return; }
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) { console.log("❌ Không tìm thấy user"); return; }
  await prisma.user.update({ where: { id: user.id }, data: { role: "admin" } });
  console.log(`✅ Đã nâng @${user.username} lên admin`);
}
main().finally(() => prisma.$disconnect());
