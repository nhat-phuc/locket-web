import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const email = "trannhatphuc1234xx@gmail.com";
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) { console.log("❌ Không tìm thấy user"); return; }

  console.log(`👤 User: ${user.username} | Balance: ${user.balance.toLocaleString("vi-VN")}đ\n`);

  // Test 1: Tạo giao dịch nạp tiền
  const rechargeAmount = 50000;
  const newBalance = user.balance + rechargeAmount;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { balance: newBalance },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: "recharge",
        amount: rechargeAmount,
        balanceBefore: user.balance,
        balanceAfter: newBalance,
        status: "completed",
        method: "bank_transfer",
        description: "Test nạp tiền",
        completedAt: new Date(),
      },
    }),
  ]);

  console.log(`✅ Test 1: Đã tạo giao dịch nạp ${rechargeAmount.toLocaleString("vi-VN")}đ`);
  console.log(`   → Popup "Nạp tiền thành công!" sẽ hiện\n`);

  // Test 2: Tạo đơn hàng đã thanh toán
  const order = await prisma.order.create({
    data: {
      orderCode: `TEST-${Date.now()}`,
      userId: user.id,
      serviceName: "Locket Gold 1 tháng",
      amount: 79000,
      finalAmount: 79000,
      status: "paid",
      paidAt: new Date(),
      paymentMethod: "bank_transfer",
    },
  });

  console.log(`✅ Test 2: Đã tạo đơn hàng ${order.orderCode}`);
  console.log(`   → Popup "Mua gói thành công!" sẽ hiện\n`);

  console.log("📋 BÂY GIỜ:");
  console.log("   1. Mở http://localhost:3000");
  console.log("   2. Đợi 5-10 giây");
  console.log("   3. Popup sẽ hiện (có thể cả 2)");
}
main().finally(() => prisma.$disconnect());
