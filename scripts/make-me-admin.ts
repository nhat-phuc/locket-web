import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const email = "trannhatphuc1234xx@gmail.com";
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`❌ Không tìm thấy user: ${email}`);
    return;
  }
  console.log(`Tìm thấy: ${user.username} (role hiện tại: ${user.role})`);
  await prisma.user.update({
    where: { email },
    data: { role: "admin" },
  });
  console.log(`✅ Đã cấp quyền ADMIN`);
}
main().finally(() => prisma.$disconnect());
