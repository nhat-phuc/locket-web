import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const email = "trannhatphuc1234xx@gmail.com";
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) { console.log("❌ Không tìm thấy user"); return; }

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

  console.log(`✅ Đã tạo đơn hàng MUA GÓI`);
  console.log(`   Mã đơn: ${order.orderCode}`);
  console.log(`   Dịch vụ: ${order.serviceName}`);
  console.log(`   Số tiền: ${order.finalAmount.toLocaleString("vi-VN")}đ\n`);
  console.log(`📋 BÂY GIỜ:`);
  console.log(`   1. Mở http://localhost:3000`);
  console.log(`   2. Đợi 5-10 giây`);
  console.log(`   3. Popup "Mua gói thành công!" màu TÍM sẽ hiện`);
}
main().finally(() => prisma.$disconnect());
