import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "trannhatphuc1234xx@gmail.com";
  const password = "admin";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("✅ Admin đã tồn tại:", email);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await prisma.user.create({
    data: {
      email,
      username: "admin",
      password: hashedPassword,
      name: "Phucnesux",
      role: "admin",
      balance: 0,
      isActive: true,
      isBanned: false,
    },
  });

  console.log("✅ Đã tạo admin:");
  console.log("   Email:", admin.email);
  console.log("   Password:", password);
  console.log("   Role:", admin.role);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
