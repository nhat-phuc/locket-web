import { PrismaClient } from "@prisma/client";
import { signToken } from "../lib/auth";
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!admin) return;

  const token = signToken({
    userId: admin.id,
    email: admin.email,
    role: "admin",
  });

  console.log("\n═══ TEST API ADMIN WITHDRAWALS ═══\n");
  console.log(`Admin: ${admin.username} (role: ${admin.role})`);
  console.log(`Token: ${token.slice(0, 50)}...\n`);

  for (const status of ["pending", "all"]) {
    console.log(`\n--- status=${status} ---`);
    const res = await fetch(`http://localhost:3000/api/admin/withdrawals?status=${status}`, {
      headers: { Cookie: `locket_token=${token}` },
    });
    console.log(`HTTP: ${res.status}`);
    const d = await res.json();
    console.log(`success: ${d.success}`);
    console.log(`list.length: ${d.list?.length || 0}`);
    if (d.list?.[0]) {
      console.log(`First: ${d.list[0].bankName} - ${d.list[0].amount}`);
    }
    if (d.message) console.log(`message: ${d.message}`);
  }
}
main().finally(() => prisma.$disconnect());
