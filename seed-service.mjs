import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.service.findFirst();
  console.log("=== SERVICE HIỆN CÓ ===");
  console.log(existing);
  console.log("");

  const services = [
    { name: "VIP 1 Tháng", slug: "vip-1-thang", description: "Locket VIP 1 tháng", type: "vip", platform: "locket", price: 99000, duration: "1 tháng", features: "VIP", isActive: true },
    { name: "GOLD 1 Tháng", slug: "gold-1-thang", description: "Locket GOLD 1 tháng", type: "gold", platform: "locket", price: 79000, duration: "1 tháng", features: "GOLD", isActive: true },
    { name: "LUXURY 1 Tháng", slug: "luxury-1-thang", description: "Locket LUXURY 1 tháng", type: "luxury", platform: "locket", price: 149000, duration: "1 tháng", features: "LUXURY", isActive: true },
    { name: "ADR 1 Tháng", slug: "adr-1-thang", description: "Locket ADR 1 tháng", type: "adr", platform: "locket", price: 29000, duration: "1 tháng", features: "ADR", isActive: true },
  ];

  console.log("=== TẠO SERVICE MỚI ===");
  for (const s of services) {
    const exist = await prisma.service.findUnique({ where: { slug: s.slug } });
    if (!exist) {
      const created = await prisma.service.create({ data: s });
      console.log("✅ Tạo:", created.name, "| ID:", created.id, "| Slug:", created.slug);
    } else {
      console.log("⏭️ Đã có:", exist.name, "| ID:", exist.id, "| Slug:", exist.slug);
    }
  }
  await prisma.$disconnect();
  console.log("\n🎉 Xong!");
}

main().catch((e) => { console.error(e); process.exit(1); });
