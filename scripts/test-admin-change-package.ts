import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!user) { console.log("❌ Không tìm thấy admin"); return; }

  // 1. Sửa tên + giá gói GOLD trong DB
  const oldService = await prisma.service.findFirst({
    where: { slug: "locket-gold" },
  });

  if (!oldService) {
    console.log("❌ Không tìm thấy service locket-gold");
    return;
  }

  console.log(`📦 Trước khi sửa:`);
  console.log(`   Tên: ${oldService.name}`);
  console.log(`   Giá: ${oldService.price.toLocaleString("vi-VN")}đ\n`);

  // Admin sửa
  const updated = await prisma.service.update({
    where: { id: oldService.id },
    data: {
      name: "Gói GOLD VIP PRO",
      price: 99000,
      originalPrice: 199000,
    },
  });

  console.log(`✅ Admin đã sửa gói:`);
  console.log(`   Tên mới: ${updated.name}`);
  console.log(`   Giá mới: ${updated.price.toLocaleString("vi-VN")}đ\n`);

  // 2. Tạo đơn hàng mới với tên + giá MỚI
  await prisma.order.deleteMany({
    where: { userId: user.id, orderCode: { startsWith: "TEST-" } },
  });

  const order = await prisma.order.create({
    data: {
      orderCode: `TEST-NEWPRICE-${Date.now()}`,
      userId: user.id,
      serviceName: updated.name,           // ← Tên mới
      amount: updated.price,
      finalAmount: updated.price,          // ← Giá mới
      status: "paid",
      paidAt: new Date(),
      paymentMethod: "bank_transfer",
    },
  });

  console.log(`🛍️ Đã tạo đơn mua gói với tên + giá MỚI:`);
  console.log(`   Gói: ${order.serviceName}`);
  console.log(`   Tiền: ${order.finalAmount.toLocaleString("vi-VN")}đ\n`);
  console.log(`📋 BÂY GIỜ:`);
  console.log(`   1. Mở http://localhost:3000`);
  console.log(`   2. Đợi 5-10 giây`);
  console.log(`   3. Popup TÍM phải hiện:`);
  console.log(`      🛍️ Mua gói thành công!`);
  console.log(`      +99.000đ`);
  console.log(`      Gói GOLD VIP PRO     ← Tên MỚI`);
}
main().finally(() => prisma.$disconnect());
