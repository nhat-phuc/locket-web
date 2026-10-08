import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  await prisma.service.deleteMany({});
  console.log("🗑 Đã xóa toàn bộ service cũ");

  const services = [
    {
      name: "Locket Gold 1 tháng",
      slug: "locket-gold-1t",
      description: "Mở khóa toàn bộ tính năng Gold trong 1 tháng",
      type: "gold",
      platform: "locket",
      price: 50000,
      originalPrice: 100000,
      discount: 50,
      duration: "1 tháng",
      features: JSON.stringify(["Không quảng cáo", "Tải ảnh HD", "Sticker VIP"]),
      badge: "HOT",
      badgeColor: "#fbbf24",
      sortOrder: 1,
      isActive: true,
      isFeatured: true,
      stock: 100,
      sold: 0,
    },
    {
      name: "Locket VIP 3 tháng",
      slug: "locket-vip-3t",
      description: "Gói VIP 3 tháng nhiều ưu đãi",
      type: "vip",
      platform: "locket",
      price: 120000,
      originalPrice: 200000,
      discount: 40,
      duration: "3 tháng",
      features: JSON.stringify(["Toàn bộ Gold", "Ưu tiên hỗ trợ", "Badge VIP"]),
      badge: "BEST",
      badgeColor: "#10b981",
      sortOrder: 2,
      isActive: true,
      isFeatured: true,
      stock: 50,
      sold: 0,
    },
    {
      name: "Locket Luxury vĩnh viễn",
      slug: "locket-lux-vv",
      description: "Gói Luxury vĩnh viễn",
      type: "luxury",
      platform: "locket",
      price: 500000,
      originalPrice: 1000000,
      discount: 50,
      duration: "vĩnh viễn",
      features: JSON.stringify(["Toàn bộ VIP", "Badge Luxury", "Hỗ trợ 24/7"]),
      badge: "LUX",
      badgeColor: "#a78bfa",
      sortOrder: 3,
      isActive: true,
      isFeatured: true,
      stock: 20,
      sold: 0,
    },
  ];

  for (const s of services) {
    await prisma.service.create({ data: s });
    console.log(`✅ ${s.name}`);
  }
}
main().finally(() => prisma.$disconnect());
