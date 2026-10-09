import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!user) return;

  // Xóa đơn TEST cũ
  await prisma.order.deleteMany({
    where: { userId: user.id, orderCode: { startsWith: "TEST-" } },
  });

  const order = await prisma.order.create({
    data: {
      orderCode: `TEST-LUX-${Date.now()}`,
      userId: user.id,
      serviceName: "Gói LUXURY VĨNH VIỄN",
      amount: 500000,
      finalAmount: 500000,
      status: "paid",
      paidAt: new Date(),
      paymentMethod: "bank_transfer",
    },
  });

  console.log(`✅ Đã tạo đơn MUA LUXURY`);
  console.log(`   Gói: ${order.serviceName}`);
  console.log(`   Tiền: ${order.finalAmount.toLocaleString("vi-VN")}đ\n`);
  console.log(`📋 Mở http://localhost:3000 → Đợi 5-10s`);
  console.log(`   Popup TÍM sẽ hiện: "Mua gói thành công!" + "Gói LUXURY VĨNH VIỄN"`);
}
main().finally(() => prisma.$disconnect());
