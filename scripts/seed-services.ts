import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  const services = [
    {
      slug: 'vip',
      name: 'VIP 1 Tháng',
      description: 'Gói VIP Locket 1 tháng - Badge VIP, tốc độ cao',
      type: 'vip',
      platform: 'locket',
      price: 99000,
      originalPrice: 149000,
      features: 'VIP badge,Tốc độ cao,Không quảng cáo',
      isActive: true,
      isFeatured: true,
    },
    {
      slug: 'gold',
      name: 'GOLD 1 Tháng',
      description: 'Gói GOLD Locket 1 tháng - Badge GOLD, ưu đãi đặc biệt',
      type: 'gold',
      platform: 'locket',
      price: 79000,
      originalPrice: 119000,
      features: 'GOLD badge,Tốc độ cao,Ưu đãi đặc biệt',
      isActive: true,
      isFeatured: true,
    },
    {
      slug: 'luxury',
      name: 'LUXURY 1 Tháng',
      description: 'Gói LUXURY Locket 1 tháng - Badge LUXURY cao cấp',
      type: 'luxury',
      platform: 'locket',
      price: 149000,
      originalPrice: 199000,
      features: 'LUXURY badge,Tốc độ cao,Ưu đãi VIP',
      isActive: true,
      isFeatured: true,
    },
    {
      slug: 'adr',
      name: 'ADR 1 Tháng',
      description: 'Gói Android (ADR) Locket 1 tháng',
      type: 'adr',
      platform: 'locket',
      price: 79000,
      originalPrice: 99000,
      features: 'ADR badge,Hỗ trợ Android,Tốc độ cao',
      isActive: true,
      isFeatured: true,
    },
  ];

  for (const s of services) {
    const existing = await p.service.findUnique({ where: { slug: s.slug } });
    if (existing) {
      await p.service.update({ where: { slug: s.slug }, data: s });
      console.log('🔄 Cập nhật:', s.name);
    } else {
      await p.service.create({ data: s });
      console.log('✅ Tạo mới:', s.name);
    }
  }

  const count = await p.service.count();
  console.log('');
  console.log('📦 Tổng services trong DB:', count);
  process.exit(0);
}

main();
