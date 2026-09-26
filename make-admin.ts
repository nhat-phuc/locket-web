import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || "trannhatphuc1234xx@gmail.com";

  console.log(`\n🔍 Đang tìm user: ${email}`);

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log(`❌ Không tìm thấy user với email: ${email}`);
    console.log(`\n💡 Gợi ý: Chạy lệnh sau để xem danh sách user:`);
    console.log(`   npx tsx check-admin.ts\n`);
    process.exit(1);
  }

  console.log(`✓ Tìm thấy: ${user.name || user.username}`);
  console.log(`  Role hiện tại: ${user.role}`);

  if (user.role === "admin") {
    console.log(`\n⚠️  User này ĐÃ LÀ admin rồi. Không cần nâng cấp.\n`);
    process.exit(0);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: "admin" },
  });

  console.log(`\n✅ ĐÃ NÂNG LÊN ADMIN!`);
  console.log(`   Email:    ${updated.email}`);
  console.log(`   Username: ${updated.username}`);
  console.log(`   Role mới: ${updated.role}\n`);
  console.log(`👉 Bây giờ bạn có thể truy cập /admin\n`);
}

main()
  .catch((e) => {
    console.error("❌ Lỗi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
