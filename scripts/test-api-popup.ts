import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!user) return;

  const { signToken } = await import("../lib/auth");
  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  const res = await fetch("http://localhost:3000/api/live-notifications", {
    headers: { Cookie: `locket_token=${token}` },
  });
  const d = await res.json();

  console.log("\n═══ API RESPONSE ═══\n");
  console.log("myRecentRecharge:", d.myRecentRecharge ? "✅ CÓ" : "❌ NULL");
  if (d.myRecentRecharge) {
    console.log("  → amount:", d.myRecentRecharge.amount.toLocaleString("vi-VN") + "đ");
    console.log("  → createdAt:", d.myRecentRecharge.createdAt);
  }
  console.log("\nmyRecentOrder:", d.myRecentOrder ? "✅ CÓ" : "❌ NULL");
  if (d.myRecentOrder) {
    console.log("  → serviceName:", d.myRecentOrder.serviceName);
    console.log("  → amount:", d.myRecentOrder.amount.toLocaleString("vi-VN") + "đ");
    console.log("  → createdAt:", d.myRecentOrder.createdAt);
  }
}
main().finally(() => prisma.$disconnect());
