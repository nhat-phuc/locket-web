import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const email = "trannhatphuc1234xx@gmail.com";
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) { console.log("❌ Không tìm thấy user"); return; }

  const amount = 50000;
  const newBalance = user.balance + amount;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { balance: newBalance },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: "recharge",
        amount,
        balanceBefore: user.balance,
        balanceAfter: newBalance,
        status: "completed",
        method: "bank_transfer",
        description: "Test nạp tiền - popup XANH",
        completedAt: new Date(),
      },
    }),
  ]);

  console.log(`✅ Đã tạo giao dịch NẠP ${amount.toLocaleString("vi-VN")}đ`);
  console.log(`💰 Balance: ${newBalance.toLocaleString("vi-VN")}đ\n`);
  console.log(`📋 BÂY GIỜ:`);
  console.log(`   1. Mở http://localhost:3000`);
  console.log(`   2. Đợi 5-10 giây`);
  console.log(`   3. Popup "Nạp tiền thành công!" màu XANH sẽ hiện`);
}
main().finally(() => prisma.$disconnect());
