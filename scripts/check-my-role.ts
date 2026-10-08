import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, email: true, role: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  console.log(`\n=== ${users.length} users ===\n`);
  users.forEach((u) => {
    console.log(`${u.role === "admin" ? "👑" : "👤"} ${u.username} | ${u.email} | role=${u.role}`);
  });
}
main().finally(() => prisma.$disconnect());
