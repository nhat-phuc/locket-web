import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const reviews = await prisma.review.findMany({
  orderBy: { createdAt: 'desc' },
  take: 10,
  select: {
    id: true,
    name: true,
    text: true,
    image: true,
    status: true,
    isApproved: true,
    createdAt: true,
  },
});

console.log(`\n📋 Có ${reviews.length} review gần nhất:\n`);
reviews.forEach((r, i) => {
  console.log(`${i+1}. [${r.status}] ${r.name}`);
  console.log(`   Text: ${r.text.substring(0, 60)}...`);
  console.log(`   Image: ${r.image}`);
  console.log(`   Approved: ${r.isApproved}`);
  console.log(`   Time: ${r.createdAt.toLocaleString('vi-VN')}\n`);
});

await prisma.$disconnect();
