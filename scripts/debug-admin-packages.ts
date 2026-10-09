import { PrismaClient } from "@prisma/client";
import { signToken } from "../lib/auth";
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!admin) { console.log("❌ Không có admin"); return; }

  const token = signToken({
    userId: admin.id,
    email: admin.email,
    role: "admin",
  });

  console.log("\n═══ TEST API ADMIN/PACKAGES ═══\n");

  for (const url of [
    "/api/admin/packages",
    "/api/admin/services",
    "/api/admin/users",
    "/api/admin/orders",
    "/api/admin/withdrawals",
  ]) {
    try {
      const res = await fetch(`http://localhost:3000${url}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      console.log(`${res.status} ${url} → success: ${d.success} | length: ${d.packages?.length ?? d.services?.length ?? d.users?.length ?? d.orders?.length ?? d.list?.length ?? "—"}`);
      if (!d.success) console.log(`   message: ${d.message || d.error}`);
    } catch (e) {
      console.log(`❌ ${url} → ${(e as Error).message}`);
    }
  }
}
main().finally(() => prisma.$disconnect());
