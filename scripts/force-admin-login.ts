import { PrismaClient } from "@prisma/client";
import { signToken } from "../lib/auth";
const prisma = new PrismaClient();

async function main() {
  const email = "trannhatphuc1234xx@gmail.com";
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log(`❌ Không tìm thấy user: ${email}`);
    return;
  }

  if (user.role !== "admin") {
    await prisma.user.update({
      where: { email },
      data: { role: "admin" },
    });
    console.log(`✅ Đã cập nhật role = admin`);
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: "admin",
  });

  console.log("\n═══════════════════════════════════════════");
  console.log("  FORCE ADMIN LOGIN");
  console.log("═══════════════════════════════════════════\n");
  console.log("📋 COPY LỆNH NÀY VÀO BROWSER CONSOLE (F12):\n");
  console.log(`document.cookie = "locket_token=${token}; path=/; max-age=604800"; location.href="/admin";`);
  console.log("\n═══════════════════════════════════════════");
  console.log("\n�� HƯỚNG DẪN:");
  console.log("   1. Mở http://localhost:3000");
  console.log("   2. Nhấn F12 → tab Console");
  console.log("   3. COPY dòng lệnh document.cookie = ...");
  console.log("   4. PASTE vào Console → Enter");
  console.log("   5. Browser tự chuyển vào /admin");
  console.log("\n═══════════════════════════════════════════");
}

main().finally(() => prisma.$disconnect());
