import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function gen(username: string, id: string): string {
  const base = (username || id).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 6);
  const rand = Math.random().toString(36).slice(2, 6);
  return (base + rand).toUpperCase().slice(0, 12);
}

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [{ referralCode: null }, { referralCode: "" }],
    },
    select: { id: true, username: true, email: true },
  });

  console.log(`\n🔍 Tìm thấy ${users.length} users thiếu mã\n`);

  for (const u of users) {
    let code = gen(u.username, u.id);
    for (let i = 0; i < 10; i++) {
      const exists = await prisma.user.findUnique({ where: { referralCode: code } });
      if (!exists) break;
      code = gen(u.username, u.id);
    }
    await prisma.user.update({
      where: { id: u.id },
      data: { referralCode: code },
    });
    console.log(`  ✅ ${u.username} → ${code}`);
  }

  console.log(`\n🎉 Đã backfill ${users.length} users`);
}
main().finally(() => prisma.$disconnect());
