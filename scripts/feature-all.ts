import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.service.updateMany({
    where: { isActive: true },
    data: { isFeatured: true },
  });
  console.log(`✅ Đã set isFeatured=true cho ${result.count} services`);
}
main().finally(() => prisma.$disconnect());
