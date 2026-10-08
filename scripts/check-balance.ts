import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({
    select: { username: true, balance: true, bonusBalance: true, commission: true, totalReferrals: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  console.log("\n=== BALANCE ===\n");
  for (const u of users) {
    console.log(`${u.username} | balance=${u.balance} | bonus=${u.bonusBalance} | commission=${u.commission} | refs=${u.totalReferrals}`);
  }

  const txs = await prisma.transaction.findMany({
    where: { type: "referral_bonus" },
    include: { user: { select: { username: true } } },
  });
  console.log(`\n=== ${txs.length} REFERRAL TXS ===\n`);
  for (const t of txs) {
    console.log(`${t.user.username} | +${t.amount} | ${t.description}`);
  }
}
main().finally(() => prisma.$disconnect());
