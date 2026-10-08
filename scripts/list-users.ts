import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({
    select: { username: true, email: true, referralCode: true, referredBy: true, totalReferrals: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  if (users.length === 0) {
    console.log("⚠️ KHÔNG CÓ USER NÀO TRONG DB");
    return;
  }
  console.log(`\n=== ${users.length} users ===\n`);
  for (const u of users) {
    console.log(`${u.username} | ${u.email}`);
    console.log(`  code=${JSON.stringify(u.referralCode)} | referredBy=${u.referredBy ?? "—"} | totalRef=${u.totalReferrals}`);
  }
}
main().finally(() => prisma.$disconnect());
