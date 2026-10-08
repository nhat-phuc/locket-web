import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const services = await prisma.service.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      price: true,
      originalPrice: true,
      discount: true,
    },
    orderBy: { sortOrder: "asc" },
  });

  console.log("\n=== GIÁ GỐC TRONG DB ===\n");
  for (const s of services) {
    console.log(`${s.name}`);
    console.log(`  Giá bán:     ${s.price.toLocaleString("vi-VN")}đ`);
    console.log(`  Giá gốc:     ${s.originalPrice ? s.originalPrice.toLocaleString("vi-VN") + "đ" : "❌ CHƯA CÓ"}`);
    console.log(`  Discount:    ${s.discount ? s.discount + "%" : "❌ CHƯA CÓ"}`);
    console.log("");
  }
}

main().finally(() => prisma.$disconnect());
