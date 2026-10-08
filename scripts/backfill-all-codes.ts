import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

function gen(seed: string) {
  const clean = (seed || "user").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 6).toUpperCase() || "USER";
  const rand = randomBytes(2).toString("hex").toUpperCase();
  return (clean + rand).slice(0, 12);
}

async function main() {
  const users = await prisma.user.findMany({
    where: { OR: [{ referralCode: null }, { referralCode: "" }] },
    select: { id: true, username: true, email: true },
  });
  console.log(`Found ${users.length} users thiếu mã\n`);
  for (const u of users) {
    let code = gen(u.username || u.email);
    for (let i = 0; i < 10; i++) {
      const exists = await prisma.user.findUnique({ where: { referralCode: code }, select: { id: true } });
      if (!exists) break;
      code = gen(u.username || u.email);
    }
    await prisma.user.update({ where: { id: u.id }, data: { referralCode: code } });
    console.log(`✅ ${u.username || u.email} → "${code}"`);
  }
  console.log("\nDone");
}
main().finally(() => prisma.$disconnect());
