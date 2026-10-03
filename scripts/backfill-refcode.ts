import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function gen() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function main() {
  const users = await prisma.user.findMany({ where: { referralCode: null } });
  console.log(`Cần sinh code cho ${users.length} user`);

  for (const u of users) {
    let code = gen();
    let dup = await prisma.user.findUnique({ where: { referralCode: code } });
    while (dup) {
      code = gen();
      dup = await prisma.user.findUnique({ where: { referralCode: code } });
    }
    await prisma.user.update({ where: { id: u.id }, data: { referralCode: code } });
    console.log(`  ${u.username} → ${code}`);
  }
  console.log("Done!");
}

main().finally(() => prisma.$disconnect());
