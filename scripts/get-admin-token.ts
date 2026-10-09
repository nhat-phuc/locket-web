import { PrismaClient } from "@prisma/client";
import { signToken } from "../lib/auth";
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!admin) { console.log("❌ Không có admin"); return; }

  const token = signToken({
    userId: admin.id,
    email: admin.email,
    role: "admin",
  });

  console.log("\n📋 COPY DÒNG NÀY VÀO BROWSER CONSOLE (F12):\n");
  console.log(`document.cookie = "locket_token=${token}; path=/; max-age=604800"; location.href = "/admin/withdrawals";`);
  console.log("\n✅ Sau khi paste → browser tự vào admin withdrawals");
}
main().finally(() => prisma.$disconnect());
