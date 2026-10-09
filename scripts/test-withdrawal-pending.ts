import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!user) { console.log("❌ Không có user"); return; }

  console.log(`👤 User: ${user.username} | Balance: ${user.balance.toLocaleString("vi-VN")}đ`);

  // Xóa yêu cầu cũ của user này
  await prisma.withdrawalRequest.deleteMany({
    where: { userId: user.id, status: "pending" },
  });

  // Tạo yêu cầu pending mới
  const w = await prisma.withdrawalRequest.create({
    data: {
      userId: user.id,
      amount: 50000,
      bankName: "Vietcombank",
      bankAccount: "1234567890",
      accountName: user.name || user.username,
      status: "pending",
    },
  });

  console.log(`\n✅ Đã tạo yêu cầu rút tiền:`);
  console.log(`   ID: ${w.id}`);
  console.log(`   Số tiền: ${w.amount.toLocaleString("vi-VN")}đ`);
  console.log(`   Ngân hàng: ${w.bankName}`);
  console.log(`   Trạng thái: ${w.status}`);

  // Đếm tất cả withdrawal
  const all = await prisma.withdrawalRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
  console.log(`\n📊 Tổng ${all.length} yêu cầu rút tiền trong DB:`);
  all.forEach((x) => {
    console.log(`   ${x.status} | ${x.amount.toLocaleString("vi-VN")}đ | ${x.bankName}`);
  });
}
main().finally(() => prisma.$disconnect());
