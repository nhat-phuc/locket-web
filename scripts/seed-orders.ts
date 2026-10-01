import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  const user = await p.user.findFirst();
  if (!user) {
    console.log('❌ Không có user');
    process.exit(1);
  }
  console.log('✅ User:', user.username, '| ID:', user.id);

  // Kiểm tra/tạo Service
  let service = await p.service.findFirst();
  if (!service) {
    console.log('⚠️  Chưa có Service. Đang tạo...');
    service = await p.service.create({
      data: {
        name: 'VIP 1 Tháng',
        slug: 'vip-1-thang',
        description: 'Gói VIP 1 tháng',
        type: 'vip',
        platform: 'locket',
        price: 99000,
        features: 'VIP badge,Tốc độ cao,Không quảng cáo',
        isActive: true,
        isFeatured: true,
      },
    });
    console.log('✅ Đã tạo Service:', service.name, '| ID:', service.id);
  } else {
    console.log('📦 Service có sẵn:', service.name, '| ID:', service.id);
  }

  // Xóa Order cũ (nếu chạy lại script)
  await p.order.deleteMany({
    where: { orderCode: { in: ['ORD001', 'ORD002', 'ORD003', 'ORD004', 'ORD005'] } },
  });

  // Tạo 5 Order test
  const orders = [
    { code: 'ORD001', name: 'VIP 1 Tháng', amount: 99000 },
    { code: 'ORD002', name: 'GOLD 1', amount: 79000 },
    { code: 'ORD003', name: 'LUXURY 1', amount: 149000 },
    { code: 'ORD004', name: 'VIP 1', amount: 99000 },
    { code: 'ORD005', name: 'ADR 1', amount: 79000 },
  ];

  for (const o of orders) {
    try {
      await p.order.create({
        data: {
          orderCode: o.code,
          userId: user.id,
          serviceId: service.id,
          serviceName: o.name,
          amount: o.amount,
          discount: 0,
          finalAmount: o.amount,
          status: 'paid',
          paidAt: new Date(),
          locketUsername: user.username || 'testuser',
        },
      });
      console.log('✅ Tạo Order:', o.code, '-', o.name, '-', o.amount + 'đ');
    } catch (e: any) {
      console.log('❌ Lỗi', o.code, ':', e.message);
    }
  }

  const count = await p.order.count();
  console.log('');
  console.log('📊 Tổng Order trong DB:', count);
  process.exit(0);
}

main();
