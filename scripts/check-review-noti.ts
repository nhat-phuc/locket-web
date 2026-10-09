import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 1. Lấy notifications về đánh giá
  const notis = await prisma.notification.findMany({
    where: { title: { contains: "Đánh giá" } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  console.log(`\n=== ${notis.length} NOTIFICATIONS VỀ ĐÁNH GIÁ ===\n`);

  for (const n of notis) {
    console.log(`📢 "${n.title}"`);
    console.log(`   userId: ${n.userId || "NULL (broadcast)"}`);
    console.log(`   content: ${n.content.slice(0, 60)}...`);
    console.log(`   createdAt: ${n.createdAt.toLocaleString("vi-VN")}`);

    // Query user riêng
    if (n.userId) {
      const user = await prisma.user.findUnique({
        where: { id: n.userId },
        select: { username: true, email: true },
      });
      console.log(`   → Gửi cho: ${user?.username || user?.email || "(user không tồn tại)"}`);
    } else {
      console.log(`   → BROADCAST (mọi user đều thấy)`);
    }
    console.log("");
  }
}
main().finally(() => prisma.$disconnect());
