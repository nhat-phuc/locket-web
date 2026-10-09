import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const all = await prisma.withdrawalRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { username: true, email: true } } },
  });

  console.log(`\n=== ${all.length} WITHDRAWALS TRONG DB ===\n`);
  for (const w of all) {
    console.log(`ID: ${w.id}`);
    console.log(`  User: ${w.user.username} (${w.user.email})`);
    console.log(`  Số tiền: ${w.amount.toLocaleString("vi-VN")}đ`);
    console.log(`  Ngân hàng: ${w.bankName} - ${w.bankAccount}`);
    console.log(`  Status: ${w.status}`);
    console.log(`  Created: ${w.createdAt.toLocaleString("vi-VN")}`);
    console.log("");
  }
}
main().finally(() => prisma.$disconnect());
