import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const users: { id: string; email: string; username: string; name: string | null; role: string; }[] = await prisma.user.findMany({
    select: { id: true, email: true, username: true, name: true, role: true },
  });

  console.log("\n📋 DANH SÁCH USER:\n");
  users.forEach((u, i) => {
    console.log(`${i + 1}. ${u.email}`);
    console.log(`   Username: ${u.username}`);
    console.log(`   Name:     ${u.name || "(trống)"}`);
    console.log(`   Role:     ${u.role} ${u.role === "admin" ? "✅ ADMIN" : "⚠️ user"}`);
    console.log("");
  });

  const adminCount = users.filter((u) => u.role === "admin").length;
  console.log(`\n🎯 Tổng: ${users.length} user | ${adminCount} admin\n`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
