import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const all = await prisma.locketProfile.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Group by username
  const byUsername = new Map<string, typeof all>();
  for (const l of all) {
    if (!byUsername.has(l.username)) byUsername.set(l.username, []);
    byUsername.get(l.username)!.push(l);
  }

  let deleted = 0;
  for (const [username, items] of byUsername) {
    if (items.length > 1) {
      // Giữ record mới nhất, xóa các record cũ
      const toDelete = items.slice(1).map((i) => i.id);
      await prisma.locketProfile.deleteMany({ where: { id: { in: toDelete } } });
      console.log(`🗑️  @${username}: xóa ${toDelete.length} record cũ`);
      deleted += toDelete.length;
    }
  }

  console.log(`\n✅ Đã xóa tổng ${deleted} record trùng`);
}
main().finally(() => prisma.$disconnect());
