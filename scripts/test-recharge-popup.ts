import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const email = "trannhatphuc1234xx@gmail.com";
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) { console.log("❌ Không tìm thấy user"); return; }

  console.log(`👤 User: ${user.username} | Balance: ${user.balance.toLocaleString("vi-VN")}đ\n`);

  // Cộng 50.000đ
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
        type: "admin_recharge",  // ← Đúng type popup đọc
        amount,
        balanceBefore: user.balance,
        balanceAfter: newBalance,
        status: "completed",
        method: "admin",
        description: "Test nạp tiền cho popup",
        completedAt: new Date(),
      },
    }),
  ]);

  console.log(`✅ Đã cộng ${amount.toLocaleString("vi-VN")}đ`);
  console.log(`💰 Số dư mới: ${newBalance.toLocaleString("vi-VN")}đ`);
  console.log(`\n📋 BÂY GIỜ:`);
  console.log(`   1. Mở http://localhost:3000`);
  console.log(`   2. Đợi 5-10 giây`);
  console.log(`   3. Popup "Nạp tiền thành công!" sẽ hiện góc phải`);
  console.log(`   4. Tự ẩn sau 6 giây`);
}
main().finally(() => prisma.$disconnect());
