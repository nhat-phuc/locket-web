import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

try {
  const count = await prisma.withdrawalRequest.count();
  console.log("✅ Model WithdrawalRequest đã tồn tại");
  console.log("Số yêu cầu rút:", count);
} catch (e) {
  console.error("❌ Lỗi:", e.message);
}

await prisma.$disconnect();
