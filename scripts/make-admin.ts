import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const username = process.argv[3];

  if (!email && !username) {
    console.log("Usage: npx tsx scripts/make-admin.ts <email> [username]");
    console.log("Example: npx tsx scripts/make-admin.ts trannhatphuc1234xx@gmail.com");
    process.exit(1);
  }

  const user = await prisma.user.findFirst({
    where: email ? { email } : { username },
  });

  if (!user) {
    console.log("❌ Không tìm thấy user");
    process.exit(1);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "admin" },
  });

  console.log(`✅ Đã nâng @${user.username} (${user.email}) lên admin`);
}

main().finally(() => prisma.$disconnect());
