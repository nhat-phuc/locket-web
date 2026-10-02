import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Kiểm tra có service "Nạp tiền" chưa
let service = await prisma.service.findFirst({
  where: { slug: "nap-tien" },
});

if (!service) {
  service = await prisma.service.create({
    data: {
      name: "Nạp tiền vào ví",
      slug: "nap-tien",
      description: "Nạp tiền vào ví Locket Gold",
      type: "recharge",
      platform: "wallet",
      price: 0,
      duration: "instant",
      features: "Nạp tiền tự động qua VietQR",
      isActive: true,
      sortOrder: -1, // Ưu tiên đầu tiên
    },
  });
  console.log("✅ Đã tạo Service 'Nạp tiền':", service.id);
} else {
  console.log("⏭️ Đã có Service 'Nạp tiền':", service.id);
}

// In tất cả service active
const all = await prisma.service.findMany({
  where: { isActive: true },
  select: { id: true, name: true, slug: true },
});
console.log("\n📋 Tất cả Service active:");
all.forEach((s) => console.log(`  - ${s.name} (${s.slug})`));

await prisma.$disconnect();
