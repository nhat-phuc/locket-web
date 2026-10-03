import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const DEFAULTS = {
  popup_enabled: "true",
  popup_title: "Thông Báo",
  popup_content: "🎉 Chính thức ra mắt gói Siêu VIP (SVIP) Độc Quyền!\n\nTrải nghiệm quyền lợi tối thượng với gói SVIP: Chỉ cần Username, Không cần Nhập DNS. Nâng cấp một mạ, an toàn tuyệt đối và tự động lên Gold trong 1 nốt nhạc!",
  popup_icon: "🌟",
  popup_button: "Đã hiểu",
  popup_close_hours: "24",
};

async function main() {
  for (const [key, value] of Object.entries(DEFAULTS)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log(`✅ Đã tạo ${Object.keys(DEFAULTS).length} setting popup`);
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
