import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const services = await prisma.service.findMany({
    select: { id: true, name: true, slug: true, type: true, price: true, isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  console.log(`\n=== ${services.length} SERVICES ===\n`);
  for (const s of services) {
    console.log(`✅ ${s.name} | ${s.slug} | ${s.type} | ${s.price}đ`);
  }

  const packages = await prisma.servicePackage.findMany({
    select: { name: true, price: true, duration: true },
  });
  console.log(`\n=== ${packages.length} PACKAGES ===\n`);
  for (const p of packages) {
    console.log(`  • ${p.name} | ${p.duration} | ${p.price}đ`);
  }
}
main().finally(() => prisma.$disconnect());
