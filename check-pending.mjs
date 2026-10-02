import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const pendings = await prisma.pendingTransaction.findMany({
  orderBy: { createdAt: 'desc' },
  take: 5,
});
console.log(`📋 PendingTransaction (${pendings.length}):`);
pendings.forEach((p, i) => {
  console.log(`${i+1}. [${p.status}] ${p.orderCode || "—"} | ${p.amount.toLocaleString("vi-VN")}đ | ${p.reason}`);
});

const recentOrders = await prisma.order.findMany({
  where: { status: "pending" },
  orderBy: { createdAt: 'desc' },
  take: 5,
});
console.log(`\n📋 Order pending (${recentOrders.length}):`);
recentOrders.forEach((o, i) => {
  console.log(`${i+1}. ${o.orderCode} | ${o.finalAmount.toLocaleString("vi-VN")}đ | ${o.status}`);
});

await prisma.$disconnect();
