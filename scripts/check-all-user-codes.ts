import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, email: true, referralCode: true, role: true },
    orderBy: { createdAt: "desc" },
  });

  console.log(`\n=== ${users.length} USERS ===\n`);
  let missing = 0;
  for (const u of users) {
    const s = u.referralCode ? "✅" : "❌";
    console.log(`${s} ${u.username} | ${u.email} | code=${u.referralCode || "THIẾU"} | role=${u.role}`);
    if (!u.referralCode) missing++;
  }
  console.log(`\n${missing === 0 ? "✅ Tất cả có mã" : `❌ ${missing} user thiếu mã`}`);
}
main().finally(() => prisma.$disconnect());
