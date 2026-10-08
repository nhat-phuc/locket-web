import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.service.updateMany({
    where: { isActive: false },
    data: { isActive: true },
  });
  console.log(`✅ Đã kích hoạt ${result.count} services`);
}
main().finally(() => prisma.$disconnect());
