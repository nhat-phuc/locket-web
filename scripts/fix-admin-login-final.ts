import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("\n═══════════════════════════════════════════");
  console.log("  FIX ADMIN LOGIN — FINAL");
  console.log("═══════════════════════════════════════════\n");

  // 1. Đảm bảo user admin
  const email = "trannhatphuc1234xx@gmail.com";
  const user = await prisma.user.update({
    where: { email },
    data: { role: "admin" },
  });

  console.log(`✅ User: ${user.username}`);
  console.log(`✅ Role: ${user.role}\n`);

  console.log("📋 HƯỚNG DẪN:");
  console.log("═══════════════════════════════════════════");
  console.log("1. Mở http://localhost:3000/dang-nhap");
  console.log("2. Đăng nhập với:");
  console.log(`   Email: ${email}`);
  console.log(`   Password: (mật khẩu của bạn)`);
  console.log("3. Sau khi login, vào http://localhost:3000/admin");
  console.log("═══════════════════════════════════════════\n");
}
main().finally(() => prisma.$disconnect());
