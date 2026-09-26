import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const services = [
  { name: "Gói GOLD 1T (3s)", slug: "gold-1t-3s", description: "Gói Gold 3 giây", type: "gold", platform: "ios", price: 79000, duration: "1 tháng", features: "Video 3s, Icon, Theme" },
  { name: "Gói GOLD 1T (15s)", slug: "gold-1t-15s", description: "Gói Gold 15 giây", type: "gold", platform: "ios", price: 129000, duration: "1 tháng", features: "Video 15s, Icon, Theme" },
  { name: "Gói VIP 1", slug: "vip-1", description: "Gói VIP 1 ID", type: "vip", platform: "ios", price: 99000, duration: "Vĩnh viễn", features: "Video 3s, Không quảng cáo" },
  { name: "Gói VIP 2", slug: "vip-2", description: "Gói VIP 2 ID", type: "vip", platform: "ios", price: 148000, duration: "Vĩnh viễn", features: "Video 3s, 2 ID" },
  { name: "LUXURY 1", slug: "luxury-1", description: "LUXURY 1 cá nhân", type: "luxury", platform: "ios", price: 129000, duration: "Vĩnh viễn", features: "Video 15s, Icon, Theme" },
  { name: "ADR 1 - ANDROID", slug: "adr-1-android", description: "Android APK Gold", type: "adr", platform: "android", price: 79000, duration: "Vĩnh viễn", features: "APK Gold, Auto-Renew" },
];

async function main() {
  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: { ...s, isActive: true, isFeatured: true, sold: 0 },
    });
  }
  console.log("✅ Đã tạo", services.length, "dịch vụ mẫu");
}

main().catch(console.error).finally(() => prisma.$disconnect());
