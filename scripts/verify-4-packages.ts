import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const services = await prisma.service.findMany({
    include: { packages: { orderBy: { order: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  console.log(`\n=== ${services.length} SERVICES ===\n`);
  for (const s of services) {
    console.log(`📦 ${s.name} [${s.type}]`);
    console.log(`   Giá: ${s.price.toLocaleString("vi-VN")}đ (gốc ${(s.originalPrice||0).toLocaleString("vi-VN")}đ, -${s.discount}%)`);
    console.log(`   Duration: ${s.duration} | Badge: ${s.badge}`);
    console.log(`   ${s.packages.length} packages:`);
    s.packages.forEach((p) => {
      console.log(`     • ${p.name} — ${p.price.toLocaleString("vi-VN")}đ`);
    });
    console.log("");
  }
}
main().finally(() => prisma.$disconnect());
