import { PrismaClient } from "@prisma/client";
import { signToken } from "../lib/auth";
const prisma = new PrismaClient();

async function main() {
  const email = "trannhatphuc1234xx@gmail.com";

  // 1. Đảm bảo role = admin trong DB
  const user = await prisma.user.update({
    where: { email },
    data: { role: "admin" },
  });

  console.log(`\n✅ User: ${user.username}`);
  console.log(`✅ Email: ${user.email}`);
  console.log(`✅ Role: ${user.role}\n`);

  // 2. Sinh token mới có role admin
  const token = signToken({
    userId: user.id,
    email: user.email,
    role: "admin",
  });

  console.log("═══════════════════════════════════════════");
  console.log("  COPY ĐOẠN NÀY VÀO BROWSER CONSOLE (F12)");
  console.log("═══════════════════════════════════════════\n");
  console.log(`document.cookie = "locket_token=${token}; path=/; max-age=604800"; location.href = "/admin/referral/users";`);
  console.log("\n═══════════════════════════════════════════\n");
  console.log("HƯỚNG DẪN:");
  console.log("1. Mở https://locket-web-eight.vercel.app (hoặc localhost:3000)");
  console.log("2. F12 → tab Console");
  console.log("3. Copy dòng 'document.cookie = ...' ở trên");
  console.log("4. Paste vào Console → Enter");
  console.log("5. Browser tự chuyển vào /admin/referral/users");
  console.log("\n═══════════════════════════════════════════");
}

main().finally(() => prisma.$disconnect());
