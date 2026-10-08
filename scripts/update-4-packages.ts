import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const SERVICES = [
  {
    service: {
      name: "GÓI GOLD (IOS)",
      slug: "locket-gold",
      description: "Mở khóa Locket Gold 1 năm",
      type: "gold",
      platform: "locket",
      price: 79000,
      originalPrice: 150000,
      discount: 47,
      duration: "1 năm",
      features: JSON.stringify([
        "Mở khóa Locket Gold 1 năm",
        "Giữ gold bằng DNS",
        "Bảo hành hỗ trợ 24/7",
      ]),
      badge: "HOT",
      badgeColor: "#f59e0b",
      sortOrder: 1,
      isActive: true,
      isFeatured: true,
      sold: 0,
    },
    packages: [
      { name: "1 tài khoản (Quay 3s) — 79k", price: 79000, order: 1 },
      { name: "1 tài khoản (Quay 15s) — 109k", price: 109000, order: 2 },
    ],
  },
  {
    service: {
      name: "GÓI VIP 3 THÁNG",
      slug: "locket-vip",
      description: "Gói VIP 3 tháng nhiều ưu đãi",
      type: "vip",
      platform: "locket",
      price: 120000,
      originalPrice: 200000,
      discount: 40,
      duration: "3 tháng",
      features: JSON.stringify([
        "Toàn bộ Gold",
        "Ưu tiên hỗ trợ",
        "Badge VIP",
      ]),
      badge: "BEST",
      badgeColor: "#10b981",
      sortOrder: 2,
      isActive: true,
      isFeatured: true,
      sold: 0,
    },
    packages: [
      { name: "1 tài khoản — 120k", price: 120000, order: 1 },
      { name: "2 tài khoản — 220k", price: 220000, order: 2 },
      { name: "3 tài khoản — 300k", price: 300000, order: 3 },
      { name: "5 tài khoản — 450k", price: 450000, order: 4 },
    ],
  },
  {
    service: {
      name: "GÓI LUXURY VĨNH VIỄN",
      slug: "locket-luxury",
      description: "Gói Luxury vĩnh viễn — không bao giờ hết hạn",
      type: "luxury",
      platform: "locket",
      price: 500000,
      originalPrice: 1000000,
      discount: 50,
      duration: "vĩnh viễn",
      features: JSON.stringify([
        "Toàn bộ VIP",
        "Badge Luxury",
        "Hỗ trợ 24/7",
      ]),
      badge: "LUX",
      badgeColor: "#a78bfa",
      sortOrder: 3,
      isActive: true,
      isFeatured: true,
      sold: 0,
    },
    packages: [
      { name: "1 tài khoản — 500k", price: 500000, order: 1 },
      { name: "2 tài khoản — 900k", price: 900000, order: 2 },
      { name: "3 tài khoản — 1.3tr", price: 1300000, order: 3 },
      { name: "5 tài khoản — 2tr", price: 2000000, order: 4 },
    ],
  },
  {
    service: {
      name: "GÓI PREMIUM 30S",
      slug: "locket-premium",
      description: "Siêu đặc quyền — quay video 30s + DNS Premium",
      type: "premium",
      platform: "locket",
      price: 199000,
      originalPrice: 399000,
      discount: 50,
      duration: "30s",
      features: JSON.stringify([
        "Mở khóa Locket Gold Vĩnh Viễn",
        "Quay video Locket 30s",
        "Sử dụng DNS Premium",
      ]),
      badge: "NEW",
      badgeColor: "#db2777",
      sortOrder: 4,
      isActive: true,
      isFeatured: true,
      sold: 0,
    },
    packages: [
      { name: "1 tài khoản — 199k", price: 199000, order: 1 },
      { name: "2 tài khoản — 349k", price: 349000, order: 2 },
      { name: "3 tài khoản — 499k", price: 499000, order: 3 },
      { name: "5 tài khoản — 799k", price: 799000, order: 4 },
    ],
  },
];

async function main() {
  console.log("🗑  Xóa services cũ...");
  await prisma.servicePackage.deleteMany({});
  await prisma.service.deleteMany({});
  console.log("✅ Đã xóa\n");

  for (const item of SERVICES) {
    const svc = await prisma.service.create({ data: item.service });
    console.log(`📦 ${svc.name} — ${svc.price.toLocaleString("vi-VN")}đ (gốc ${(svc.originalPrice || 0).toLocaleString("vi-VN")}đ)`);

    for (const p of item.packages) {
      await prisma.servicePackage.create({
        data: {
          serviceId: svc.id,
          name: p.name,
          price: p.price,
          duration: item.service.duration,
          order: p.order,
        },
      });
      console.log(`   ✅ ${p.name}`);
    }
    console.log("");
  }

  const count = await prisma.service.count();
  const pkgCount = await prisma.servicePackage.count();
  console.log(`🎉 Hoàn thành: ${count} services, ${pkgCount} packages`);
}

main().finally(() => prisma.$disconnect());
