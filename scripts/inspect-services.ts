import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const services = await prisma.service.findMany({
    include: {
      packages: { select: { id: true, name: true, price: true } },
    },
  });
  console.log(`\n=== ${services.length} services ===\n`);
  for (const s of services) {
    console.log(`📦 ${s.name}`);
    console.log(`   slug: ${s.slug} | type: ${s.type} | platform: ${s.platform}`);
    console.log(`   isActive: ${s.isActive} | isFeatured: ${s.isFeatured}`);
    console.log(`   price: ${s.price} | stock: ${s.stock} | sold: ${s.sold}`);
    console.log(`   packages: ${s.packages.length}`);
    console.log("");
  }
}
main().finally(() => prisma.$disconnect());
