import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const services = [
    {
      name: "Gói GOLD (iOS)",
      slug: "gold-ios",
      description: "Mở khóa Locket Gold 1 năm cho iOS",
      type: "gold",
      platform: "ios",
      price: 79000,
      originalPrice: 99000,
      duration: "1 năm",
      features: JSON.stringify([
        "Mở khóa Locket Gold vĩnh viễn",
        "Không quảng cáo, cực mượt",
        "Upload ảnh trực tiếp từ thư viện",
        "Xem chính xác người đã xem Lockets",
      ]),
      badge: "1 NĂM",
      isActive: true,
      isFeatured: false,
    },
    {
      name: "Gói VIP 3S (iOS)",
      slug: "vip-ios",
      description: "Locket VIP quay video 3s cho iOS",
      type: "vip",
      platform: "ios",
      price: 99000,
      originalPrice: 150000,
      duration: "vĩnh viễn",
      features: JSON.stringify([
        "Mở khóa Locket Gold vĩnh viễn",
        "Không quảng cáo, cực mượt",
        "Upload ảnh trực tiếp từ thư viện",
        "Quay video Lockets 3s",
        "Xem chính xác người đã xem",
        "Thêm bạn bè không giới hạn",
      ]),
      badge: "VĨNH VIỄN",
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Gói LUXURY 15S (iOS)",
      slug: "luxury-ios",
      description: "Locket LUXURY quay video 15s cho iOS",
      type: "luxury",
      platform: "ios",
      price: 149000,
      originalPrice: 250000,
      duration: "15s vĩnh viễn",
      features: JSON.stringify([
        "Mở khóa Locket Gold vĩnh viễn",
        "Không quảng cáo, cực mượt",
        "Upload ảnh trực tiếp từ thư viện",
        "Quay video Lockets 15s",
        "Xem chính xác người đã xem",
        "Thêm bạn bè không giới hạn",
      ]),
      badge: "15S VĨNH VIỄN",
      isActive: true,
      isFeatured: false,
    },
  ];

  for (const svc of services) {
    const existing = await prisma.service.findUnique({ where: { slug: svc.slug } });
    let serviceId;
    if (existing) {
      await prisma.service.update({ where: { slug: svc.slug }, data: svc });
      serviceId = existing.id;
      console.log(`↻ Updated: ${svc.name}`);
    } else {
      const created = await prisma.service.create({ data: svc });
      serviceId = created.id;
      console.log(`✓ Created: ${svc.name} (${created.id})`);
    }

    // Packages
    const pkgs =
      svc.type === "gold"
        ? [
            { name: "1 tài khoản (Quay 3s)", duration: "3s", price: 79000, order: 1 },
            { name: "1 tài khoản (Quay 15s)", duration: "15s", price: 109000, order: 2 },
          ]
        : svc.type === "vip"
        ? [
            { name: "1 tài khoản", duration: "vĩnh viễn", price: 99000, order: 1, isPopular: true },
            { name: "2 tài khoản", duration: "vĩnh viễn", price: 180000, order: 2 },
            { name: "3 tài khoản", duration: "vĩnh viễn", price: 250000, order: 3 },
            { name: "5 tài khoản", duration: "vĩnh viễn", price: 330000, order: 4 },
          ]
        : [
            { name: "1 tài khoản", duration: "15s", price: 149000, order: 1 },
            { name: "2 tài khoản", duration: "15s", price: 279000, order: 2 },
            { name: "3 tài khoản", duration: "15s", price: 399000, order: 3 },
            { name: "5 tài khoản", duration: "15s", price: 499000, order: 4 },
          ];

    for (const pkg of pkgs) {
      await prisma.servicePackage.create({
        data: {
          serviceId,
          name: pkg.name,
          duration: pkg.duration,
          price: pkg.price,
          order: pkg.order,
          isPopular: (pkg as any).isPopular || false,
        },
      });
    }
    console.log(`  → ${pkgs.length} packages`);
  }

  console.log("\n✅ Seed services hoàn tất!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
