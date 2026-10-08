import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, username: true, role: true, referralCode: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  console.log(`\n=== ${users.length} USERS ===\n`);
  for (const u of users) {
    console.log(`${u.role === "admin" ? "👑" : "👤"} ${u.username} | ${u.email} | role=${u.role} | code=${u.referralCode || "—"}`);
  }
  if (users.length === 0) {
    console.log("⚠️  DB TRỐNG — Cần đăng ký user mới");
  }
}
main().finally(() => prisma.$disconnect());
