import { PrismaClient } from "@prisma/client";
import { signToken } from "../lib/auth";
const prisma = new PrismaClient();

async function main() {
  console.log("\n═══ TEST NOTIFICATION — TỰ ĐỘNG ═══\n");

  // 1. Lấy admin
  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!admin) { console.log("❌ Không có admin"); return; }

  // 2. Tạo review pending cho admin
  const review = await prisma.review.create({
    data: {
      userId: admin.id,
      name: "Test User",
      initial: "T",
      text: "Sản phẩm tốt!",
      rating: 5,
      time: "Vừa xong",
      status: "pending",
    },
  });
  console.log(`✅ Tạo review: ${review.id}`);

  // 3. Giả lập admin duyệt review (giống API PATCH)
  await prisma.review.update({
    where: { id: review.id },
    data: {
      status: "approved",
      isApproved: true,
      approvedBy: admin.id,
      approvedAt: new Date(),
    },
  });
  console.log(`✅ Đã duyệt review`);

  // 4. Tạo notification — giống API
  const noti = await prisma.notification.create({
    data: {
      userId: admin.id,
      title: "✅ Đánh giá được duyệt",
      content: "Đánh giá của bạn đã được hiển thị trên trang chủ!",
      type: "success",
    },
  });
  console.log(`✅ Tạo notification: ${noti.id}`);
  console.log(`   → userId: ${noti.userId}`);
  console.log(`   → Gửi riêng cho: ${admin.username}\n`);

  // 5. Test API với token admin
  const token = signToken({
    userId: admin.id,
    email: admin.email,
    role: admin.role,
  });

  const res = await fetch("http://localhost:3000/api/notifications/latest", {
    headers: { Cookie: `locket_token=${token}` },
  });
  const data = await res.json();

  console.log(`📋 API Response:`);
  console.log(`   success: ${data.success}`);
  console.log(`   notification.title: ${data.notification?.title || "null"}`);
  console.log(`   notification.id: ${data.notification?.id || "null"}\n`);

  if (data.notification?.id === noti.id) {
    console.log(`✅ THÀNH CÔNG: API trả ĐÚNG notification của admin`);
  } else {
    console.log(`⚠️ API trả notification khác (có thể đã có noti cũ hơn)`);
  }

  console.log(`\n📋 BÂY GIỜ:`);
  console.log(`   1. Mở http://localhost:3000 (đăng nhập admin)`);
  console.log(`   2. Popup "✅ Đánh giá được duyệt" sẽ hiện`);
  console.log(`   3. Bấm "Đã hiểu" để đóng`);
  console.log(`   4. Đăng nhập user KHÁC → KHÔNG thấy popup này`);
}
main().finally(() => prisma.$disconnect());
