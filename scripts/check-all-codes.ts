import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      username: true,
      email: true,
      referralCode: true,
      totalReferrals: true,
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`\n=== ${users.length} USERS ===\n`);
  
  let missing = 0;
  for (const u of users) {
    const status = u.referralCode ? "✅" : "❌";
    console.log(
      `${status} ${u.username} | ${u.email} | code=${u.referralCode || "THIẾU"} | refs=${u.totalReferrals}`
    );
    if (!u.referralCode) missing++;
  }

  console.log(`\n${missing === 0 ? "✅ Tất cả user có mã" : `❌ ${missing} user thiếu mã`}`);
}
main().finally(() => prisma.$disconnect());
