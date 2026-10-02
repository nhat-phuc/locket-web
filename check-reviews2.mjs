import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const total = await prisma.review.count();
const approved = await prisma.review.count({ where: { isApproved: true } });
const featured = await prisma.review.count({ where: { isFeatured: true } });

console.log("📋 Thống kê review:");
console.log(`   Tổng: ${total}`);
console.log(`   Approved: ${approved}`);
console.log(`   Featured: ${featured}`);

console.log("\n📋 5 review mới nhất:");
const recent = await prisma.review.findMany({
  orderBy: { createdAt: 'desc' },
  take: 5,
  select: { name: true, status: true, isApproved: true, image: true, createdAt: true },
});
recent.forEach((r, i) => {
  console.log(`${i+1}. [${r.status}] approved=${r.isApproved} | ${r.name} | ảnh: ${r.image ? 'có' : 'không'}`);
});

await prisma.$disconnect();
