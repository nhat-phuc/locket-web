import { PrismaClient } from "@prisma/client";
import { signToken, verifyToken } from "../lib/auth";
const prisma = new PrismaClient();

async function main() {
  const email = "trannhatphuc1234xx@gmail.com";

  // 1. Kiểm tra user trong DB
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`❌ Không tìm thấy user: ${email}`);
    return;
  }

  console.log(`\n═══ 1. USER TRONG DB ═══`);
  console.log(`Username: ${user.username}`);
  console.log(`Email: ${user.email}`);
  console.log(`Role: ${user.role}`);

  // 2. Tạo token mới
  console.log(`\n═══ 2. TOKEN MỚI ═══`);
  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  console.log(`Token: ${token.slice(0, 60)}...`);

  // 3. Decode token
  const decoded = verifyToken(token);
  console.log(`\n═══ 3. TOKEN DECODED ═══`);
  console.log(JSON.stringify(decoded, null, 2));

  // 4. Test API admin
  console.log(`\n═══ 4. TEST API /api/admin/services ═══`);
  try {
    const res = await fetch("http://localhost:3000/api/admin/services", {
      headers: { Cookie: `locket_token=${token}` },
    });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log(`Response: ${JSON.stringify(data).slice(0, 150)}...`);
  } catch (e) {
    console.log(`❌ ${(e as Error).message}`);
    console.log(`→ Dev server chưa chạy? Chạy: npm run dev`);
  }
}
main().finally(() => prisma.$disconnect());
