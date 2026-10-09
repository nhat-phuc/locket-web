import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!user) return;

  // Xóa đơn cũ trong 5 phút để không trùng
  await prisma.order.deleteMany({
    where: { userId: user.id, orderCode: { startsWith: "TEST-" } },
  });

  const order = await prisma.order.create({
    data: {
      orderCode: `TEST-GOLD-${Date.now()}`,
      userId: user.id,
      serviceName: "Gói GOLD (IOS) — 1 tháng",
      amount: 79000,
      finalAmount: 79000,
      status: "paid",
      paidAt: new Date(),
      paymentMethod: "bank_transfer",
    },
  });

  console.log(`✅ Đã tạo đơn MUA GOLD`);
  console.log(`   Mã: ${order.orderCode}`);
  console.log(`   Gói: ${order.serviceName}`);
  console.log(`   Tiền: ${order.finalAmount.toLocaleString("vi-VN")}đ\n`);
  console.log(`📋 Mở http://localhost:3000 → Đợi 5-10s`);
  console.log(`   Popup TÍM sẽ hiện: "Mua gói thành công!" + "Gói GOLD (IOS) — 1 tháng"`);
}
main().finally(() => prisma.$disconnect());
