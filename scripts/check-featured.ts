import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const services = await prisma.service.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      isActive: true,
      isFeatured: true,
      badge: true,
    },
  });
  console.log(`\n=== ${services.length} services ===\n`);
  for (const s of services) {
    console.log(`${s.name}`);
    console.log(`  isActive=${s.isActive} | isFeatured=${s.isFeatured} | badge=${s.badge || "—"}`);
    console.log(`  price=${s.price.toLocaleString("vi-VN")}đ`);
  }
}
main().finally(() => prisma.$disconnect());
