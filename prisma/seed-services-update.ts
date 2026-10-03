import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const SERVICES = [
  {
    slug: "locket-gold",
    name: "Gói GOLD (iOS)",
    type: "gold",
    platform: "locket",
    description: "Đã bao gồm thuế VAT & Phí duy trì nền tảng",
    price: 79000,
    originalPrice: 109000,
    duration: "1 năm",
    features: JSON.stringify([
      "Mở khóa Locket Gold 1 năm",
      "Không quảng cáo, cực mượt",
      "Sử dụng vĩnh viễn, hỗ trợ 24/7",
    ]),
    badge: "1 NĂM",
    badgeColor: "#e63946",
    sortOrder: 1,
    isActive: true,
    isFeatured: true,
    packages: [
      { name: "1 tài khoản (Quay 3s)", duration: "1 năm", price: 79000, originalPrice: 109000, isPopular: false, order: 0 },
      { name: "1 tài khoản (Quay 15s)", duration: "1 năm", price: 109000, originalPrice: 149000, isPopular: false, order: 1 },
    ],
  },
  {
    slug: "locket-vip",
    name: "Gói VIP 3S (iOS)",
    type: "vip",
    platform: "locket",
    description: "Đã bao gồm thuế VAT & Phí duy trì nền tảng",
    price: 99000,
    originalPrice: 150000,
    duration: "Vĩnh viễn",
    features: JSON.stringify([
      "Mở khóa Locket Gold vĩnh viễn",
      "Không quảng cáo, cực mượt",
      "Sử dụng vĩnh viễn, hỗ trợ 24/7",
    ]),
    badge: "VĨNH VIỄN",
    badgeColor: "#4f46e5",
    sortOrder: 2,
    isActive: true,
    isFeatured: true,
    packages: [
      { name: "1 tài khoản", duration: "Vĩnh viễn", price: 99000, originalPrice: 150000, isPopular: false, order: 0 },
      { name: "2 tài khoản", duration: "Vĩnh viễn", price: 180000, originalPrice: 250000, isPopular: false, order: 1 },
      { name: "3 tài khoản", duration: "Vĩnh viễn", price: 250000, originalPrice: 350000, isPopular: false, order: 2 },
      { name: "5 tài khoản", duration: "Vĩnh viễn", price: 330000, originalPrice: 500000, isPopular: true, order: 3 },
    ],
  },
  {
    slug: "locket-luxury",
    name: "Gói LUXURY 15S (iOS)",
    type: "luxury",
    platform: "locket",
    description: "Đã bao gồm thuế VAT & Phí duy trì nền tảng",
    price: 149000,
    originalPrice: 200000,
    duration: "15S Vĩnh viễn",
    features: JSON.stringify([
      "Mở khóa Locket Luxury",
      "Không quảng cáo, cực mượt",
      "Sử dụng vĩnh viễn, hỗ trợ 24/7",
    ]),
    badge: "15S VĨNH VIỄN",
    badgeColor: "#f59e0b",
    sortOrder: 3,
    isActive: true,
    isFeatured: true,
    packages: [
      { name: "1 tài khoản", duration: "Vĩnh viễn", price: 149000, originalPrice: 200000, isPopular: false, order: 0 },
      { name: "2 tài khoản", duration: "Vĩnh viễn", price: 279000, originalPrice: 380000, isPopular: false, order: 1 },
      { name: "3 tài khoản", duration: "Vĩnh viễn", price: 399000, originalPrice: 550000, isPopular: false, order: 2 },
      { name: "5 tài khoản", duration: "Vĩnh viễn", price: 499000, originalPrice: 700000, isPopular: true, order: 3 },
    ],
  },
  {
    slug: "locket-android",
    name: "Gói ANDROID (ADR)",
    type: "adr",
    platform: "locket",
    description: "Lưu ý: Gói này cần APK và sử dụng bằng APK",
    price: 79000,
    originalPrice: 99000,
    duration: "Vĩnh viễn",
    features: JSON.stringify([
      "Mở khóa Locket Android",
      "Không quảng cáo, cực mượt",
      "Sử dụng vĩnh viễn, hỗ trợ 24/7",
    ]),
    badge: "ANDROID",
    badgeColor: "#10b981",
    sortOrder: 4,
    isActive: true,
    isFeatured: false,
    packages: [
      { name: "1 điện thoại", duration: "Vĩnh viễn", price: 79000, originalPrice: 99000, isPopular: false, order: 0 },
      { name: "2 điện thoại", duration: "Vĩnh viễn", price: 99000, originalPrice: 150000, isPopular: false, order: 1 },
      { name: "3 điện thoại", duration: "Vĩnh viễn", price: 119000, originalPrice: 180000, isPopular: false, order: 2 },
      { name: "4 điện thoại", duration: "Vĩnh viễn", price: 139000, originalPrice: 220000, isPopular: true, order: 3 },
    ],
  },
];

async function main() {
  console.log("🔄 Cập nhật bảng giá...\n");
  for (const s of SERVICES) {
    const { packages, ...serviceData } = s;

    const svc = await prisma.service.upsert({
      where: { slug: s.slug },
      update: serviceData,
      create: serviceData,
    });
    console.log(`✅ ${svc.name} (id: ${svc.id})`);

    await prisma.servicePackage.deleteMany({ where: { serviceId: svc.id } });
    for (const p of packages) {
      await prisma.servicePackage.create({
        data: { ...p, serviceId: svc.id },
      });
    }
    console.log(`   ↳ ${packages.length} gói\n`);
  }
  console.log("🎉 Xong!");
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
