import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "trannhatphuc1234xx@gmail.com" },
    select: { id: true, email: true, username: true, name: true, role: true },
  });

  if (!user) {
    console.log("❌ KHÔNG TÌM THẤY USER trong database!");
    console.log("→ Cần đăng ký tài khoản trước tại /dang-ky");
    return;
  }

  console.log("📋 THÔNG TIN USER:\n");
  console.log("ID:       ", user.id);
  console.log("Email:    ", user.email);
  console.log("Username: ", user.username);
  console.log("Name:     ", user.name);
  console.log("Role:     ", user.role, user.role === "admin" ? "✅ ADMIN" : "❌ USER (cần nâng cấp)");
}

main().catch((e) => {
  console.error("❌ Lỗi:", e.message);
}).finally(() => prisma.$disconnect());
