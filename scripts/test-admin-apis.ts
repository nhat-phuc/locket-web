import { PrismaClient } from "@prisma/client";
import { signToken } from "../lib/auth";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!user) { console.log("❌ Không có admin"); return; }

  const token = signToken({ userId: user.id, email: user.email, role: "admin" });

  const apis = [
    "/api/admin/stats",
    "/api/admin/users",
    "/api/admin/services",
    "/api/admin/orders",
    "/api/admin/referral/users",
    "/api/admin/withdrawals",
    "/api/admin/transactions",
  ];

  console.log("\n═══════════ TEST ADMIN APIs ═══════════\n");
  for (const path of apis) {
    try {
      const res = await fetch(`http://localhost:3000${path}`, {
        headers: { Cookie: `locket_token=${token}` },
      });
      const data = await res.json();
      const status = res.status === 200 && data.success ? "✅" : "❌";
      const info = data.success
        ? `OK (${data.users?.length ?? data.services?.length ?? data.orders?.length ?? data.referrals?.length ?? data.stats?.totalUsers ?? "—"} items)`
        : data.message || data.error || "fail";
      console.log(`${status} ${path} → ${res.status} ${info}`);
    } catch (e) {
      console.log(`❌ ${path} → ${(e as Error).message}`);
    }
  }
  console.log("\n═══════════════════════════════════════");
}
main().finally(() => prisma.$disconnect());
