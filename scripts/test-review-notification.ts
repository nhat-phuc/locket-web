import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("\n═══ TEST REVIEW NOTIFICATION ═══\n");

  // Lấy user admin
  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!admin) { console.log("❌ Không có admin"); return; }

  // Xóa review + notification cũ của test
  await prisma.review.deleteMany({
    where: { name: { startsWith: "Test User" } },
  });

  // 1. Tạo review pending cho admin (coi như user A gửi)
  const review = await prisma.review.create({
    data: {
      userId: admin.id,
      name: "Test User A",
      initial: "T",
      text: "Sản phẩm rất tốt!",
      rating: 5,
      time: "Vừa xong",
      status: "pending",
      isApproved: false,
    },
  });

  console.log(`✅ Đã tạo review pending:`);
  console.log(`   ID: ${review.id}`);
  console.log(`   User: ${admin.username}`);
  console.log(`   Status: ${review.status}\n`);

  console.log("📋 BÂY GIỜ:");
  console.log("   1. Vào http://localhost:3000/admin/reviews");
  console.log("   2. Bấm DUYỆT review 'Test User A'");
  console.log("   3. Notification sẽ tạo cho userId = admin.id");
  console.log("   4. Login admin → thấy popup 'Đánh giá được duyệt'");
  console.log("   5. Login user KHÁC → KHÔNG thấy popup");
}
main().finally(() => prisma.$disconnect());
