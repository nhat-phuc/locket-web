import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, referralCode: true },
  });

  const codes = users.map((u) => u.referralCode).filter(Boolean);
  const uniqueCodes = new Set(codes);

  console.log(`Total users: ${users.length}`);
  console.log(`Users có mã: ${codes.length}`);
  console.log(`Mã unique: ${uniqueCodes.size}`);

  if (codes.length === uniqueCodes.size) {
    console.log("✅ Tất cả mã đều unique — không trùng");
  } else {
    console.log(`❌ Có ${codes.length - uniqueCodes.size} mã bị trùng!`);
  }

  // Hiện mã của từng user
  console.log("\nMã từng user:");
  users.forEach((u) => {
    console.log(`  ${u.username}: ${u.referralCode || "THIẾU"}`);
  });
}
main().finally(() => prisma.$disconnect());
