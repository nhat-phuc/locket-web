import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!user) return;

  // Xóa data TEST cũ
  await prisma.transaction.deleteMany({ where: { userId: user.id, description: { contains: "Test" } } });
  await prisma.order.deleteMany({ where: { userId: user.id, orderCode: { startsWith: "TEST-" } } });

  // 1. Nạp tiền
  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: "recharge",
      amount: 100000,
      balanceBefore: user.balance,
      balanceAfter: user.balance + 100000,
      status: "completed",
      method: "bank_transfer",
      description: "Test nạp tiền",
      completedAt: new Date(),
    },
  });

  // 2. Mua gói
  await prisma.order.create({
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

  console.log("✅ Đã tạo 2 giao dịch:");
  console.log("   1. Nạp tiền 100.000đ (🎉 xanh)");
  console.log("   2. Mua gói 79.000đ (🛍️ tím)");
}
main().finally(() => prisma.$disconnect());
