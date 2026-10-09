import { PrismaClient } from "@prisma/client";
import { signToken, verifyToken } from "../lib/auth";
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!admin) return;

  console.log("Admin:", admin.username, "| Role:", admin.role);

  const token = signToken({
    userId: admin.id,
    email: admin.email,
    role: "admin",
  });

  console.log("\nToken decoded:");
  const decoded = verifyToken(token);
  console.log(JSON.stringify(decoded, null, 2));

  console.log("\nCall API với Bearer:");
  const res = await fetch("http://localhost:3000/api/admin/withdrawals?status=all", {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("HTTP:", res.status);
  const text = await res.text();
  console.log("Body:", text.slice(0, 200));
}
main().finally(() => prisma.$disconnect());
