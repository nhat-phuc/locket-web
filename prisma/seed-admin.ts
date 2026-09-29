import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@locketgold.app";
  const password = "admin123";  // ⚠️ ĐỔI SAU KHI LOGIN

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { role: "admin", password: await bcrypt.hash(password, 10) },
    });
    console.log(`↻ Updated admin: ${email}`);
  } else {
    await prisma.user.create({
      data: {
        email,
        username: "admin",
        password: await bcrypt.hash(password, 10),
        role: "admin",
        balance: 0,
      },
    });
    console.log(`✓ Created admin: ${email}`);
  }

  console.log(`\n📧 Email:    ${email}`);
  console.log(`🔑 Password: ${password}`);
  console.log(`\n⚠️  Đổi mật khẩu sau khi login!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
