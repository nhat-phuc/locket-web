import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const all = await prisma.locketProfile.findMany({
    orderBy: { createdAt: "desc" },
  });

  console.log(`\n=== ${all.length} LOCKET PROFILES ===\n`);

  const byUsername = new Map<string, number>();
  for (const l of all) {
    byUsername.set(l.username, (byUsername.get(l.username) || 0) + 1);
    console.log(`${l.id.slice(-6)} | @${l.username} | ${l.displayName || "—"} | ${l.createdAt.toLocaleString("vi-VN")}`);
  }

  console.log(`\n=== UNIQUE USERNAMES: ${byUsername.size} ===\n`);
  for (const [username, count] of byUsername) {
    if (count > 1) {
      console.log(`⚠️  @${username}: ${count} records (TRÙNG)`);
    } else {
      console.log(`✅ @${username}: 1 record`);
    }
  }
}
main().finally(() => prisma.$disconnect());
