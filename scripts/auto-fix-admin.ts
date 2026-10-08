import { PrismaClient } from "@prisma/client";
import { signToken, verifyToken } from "../lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  AUTO FIX ADMIN — Kiểm tra + sửa");
  console.log("═══════════════════════════════════════════\n");

  // 1. Kiểm tra user admin
  const email = "trannhatphuc1234xx@gmail.com";
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log(`❌ Không tìm thấy user: ${email}`);
    return;
  }

  console.log(`👤 User: ${user.username}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role DB: ${user.role}`);

  // 2. Nếu role không phải admin → tự sửa
  if (user.role !== "admin") {
    console.log(`\n⚠️  Role hiện tại là "${user.role}" → ĐANG SỬA...`);
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "admin" },
    });
    console.log(`✅ Đã cập nhật role = "admin" trong DB`);
  } else {
    console.log(`✅ Role DB đã là "admin"`);
  }

  // 3. Tạo token mới cho user
  console.log("\n🔑 Tạo token mới (dùng để test API admin)...");
  const token = signToken({
    userId: user.id,
    email: user.email,
    role: "admin",
  });

  console.log(`\n📋 TOKEN:\n${token}\n`);

  // 4. Verify token
  const decoded = verifyToken(token);
  console.log("🔍 Token decoded:");
  console.log(JSON.stringify(decoded, null, 2));

  // 5. Test API admin với token này
  console.log("\n🌐 Test API admin với token...");
  try {
    const res = await fetch("http://localhost:3000/api/admin/services", {
      headers: { Cookie: `locket_token=${token}` },
    });
    const data = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Response: ${JSON.stringify(data).slice(0, 200)}`);
  } catch (e) {
    console.log(`   ❌ Lỗi: ${(e as Error).message}`);
    console.log(`   → Dev server có đang chạy không?`);
  }

  console.log("\n═══════════════════════════════════════════");
  console.log("  HOÀN THÀNH");
  console.log("═══════════════════════════════════════════");
  console.log("\n💡 Bước tiếp theo:");
  console.log("   1. Copy TOKEN ở trên");
  console.log("   2. Mở browser → F12 → Application → Cookies");
  console.log("   3. Sửa cookie 'locket_token' = TOKEN mới");
  console.log("   4. Refresh trang /admin");
}

main()
  .catch((e) => console.error("❌ Lỗi:", e))
  .finally(() => prisma.$disconnect());
