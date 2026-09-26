import { PrismaClient } from "@prisma/client";
import * as readline from "readline";

const prisma = new PrismaClient();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(q: string): Promise<string> {
  return new Promise((resolve) => rl.question(q, resolve));
}

const c = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m",
  cyan: "\x1b[36m", bgBlue: "\x1b[44m", white: "\x1b[37m",
};

function header(title: string) {
  console.clear();
  console.log(`${c.bgBlue}${c.white}${c.bold}  ${title}  ${c.reset}\n`);
}

async function listServices() {
  header("📋 DANH SÁCH GÓI DỊCH VỤ");
  const services = await prisma.service.findMany({ orderBy: [{ sortOrder: "asc" }, { price: "asc" }] });
  if (services.length === 0) {
    console.log(`${c.yellow}Chưa có gói nào.${c.reset}`);
  } else {
    console.log(`${c.bold}${"STT".padEnd(5)} ${"Tên".padEnd(30)} ${"Loại".padEnd(10)} ${"Giá".padEnd(14)} Active${c.reset}`);
    console.log(`${c.dim}${"─".repeat(75)}${c.reset}`);
    services.forEach((s, i) => {
      const active = s.isActive !== false ? `${c.green}✓${c.reset}` : `${c.red}✗${c.reset}`;
      const price = `${s.price.toLocaleString("vi-VN")}đ`.padEnd(14);
      const name = s.name.length > 28 ? s.name.slice(0, 28) + "…" : s.name.padEnd(30);
      console.log(`${String(i + 1).padEnd(5)} ${name} ${(s.type || "").padEnd(10)} ${price} ${active}`);
    });
    console.log(`\n${c.dim}Tổng: ${services.length} gói${c.reset}`);
  }
  console.log("");
  await ask(`${c.dim}Nhấn Enter để quay lại...${c.reset}`);
}

async function addService() {
  header("➕ THÊM GÓI MỚI");
  const name = await ask("Tên gói: ");
  if (!name) return;
  const slug = await ask("Slug (VD: vip-1): ");
  if (!slug) return;
  const description = await ask("Mô tả ngắn: ");
  console.log(`\nLoại: ${c.cyan}gold, vip, luxury, adr, agent${c.reset}`);
  const type = await ask("Loại: ");
  console.log(`\nNền tảng: ${c.cyan}ios, android, both${c.reset}`);
  const platform = await ask("Nền tảng: ");
  const priceStr = await ask("Giá: ");
  const price = parseInt(priceStr) || 0;
  const originalPriceStr = await ask("Giá gốc (Enter bỏ qua): ");
  const originalPrice = originalPriceStr ? parseInt(originalPriceStr) : null;
  const duration = await ask("Thời hạn (VD: Vĩnh viễn): ");
  console.log(`\n${c.cyan}Nhập tính năng (mỗi dòng 1 cái, gõ END để kết thúc):${c.reset}`);
  const features: string[] = [];
  while (true) {
    const line = await ask("  - ");
    if (line.toUpperCase() === "END" || !line) break;
    features.push(line);
  }
  const badge = await ask("Badge (Enter bỏ qua): ");
  const badgeColor = await ask("Màu badge (Enter bỏ qua): ");
  const isFeaturedStr = await ask("Nổi bật? (y/n): ");
  const isFeatured = isFeaturedStr.toLowerCase() === "y";
  const sortOrderStr = await ask("Thứ tự (Enter = 0): ");
  const sortOrder = parseInt(sortOrderStr) || 0;

  try {
    const service = await prisma.service.create({
      data: {
        name, slug, description, type, platform, price, originalPrice,
        duration: duration || null,
        features: JSON.stringify(features),
        badge: badge || null, badgeColor: badgeColor || null,
        isFeatured, isActive: true, sortOrder,
      },
    });
    console.log(`\n${c.green}✓ Đã thêm "${service.name}"${c.reset}`);
  } catch (e: any) {
    console.log(`\n${c.red}✗ Lỗi: ${e.message}${c.reset}`);
  }
  await ask(`${c.dim}Nhấn Enter...${c.reset}`);
}

async function editService() {
  header("✏️  SỬA GÓI");
  const services = await prisma.service.findMany({ orderBy: [{ sortOrder: "asc" }] });
  services.forEach((s, i) => console.log(`${c.bold}${i + 1}.${c.reset} ${s.name} ${c.dim}(${s.type} - ${s.price.toLocaleString("vi-VN")}đ)${c.reset}`));
  const idxStr = await ask("\nChọn STT: ");
  const idx = parseInt(idxStr) - 1;
  if (idx < 0 || idx >= services.length) { console.log(`${c.red}✗ Không hợp lệ${c.reset}`); await ask("Enter..."); return; }

  const s = services[idx];
  console.log(`\n${c.dim}Đang sửa: ${s.name} (Enter giữ nguyên)${c.reset}\n`);
  const name = (await ask(`Tên [${s.name}]: `)) || s.name;
  const description = (await ask(`Mô tả [${s.description}]: `)) || s.description;
  const type = (await ask(`Loại [${s.type}]: `)) || s.type;
  const platform = (await ask(`Nền tảng [${s.platform}]: `)) || s.platform;
  const priceStr = await ask(`Giá [${s.price}]: `);
  const price = priceStr ? parseInt(priceStr) : s.price;
  const originalPriceStr = await ask(`Giá gốc [${s.originalPrice ?? "trống"}]: `);
  const originalPrice = originalPriceStr ? parseInt(originalPriceStr) : s.originalPrice;
  const duration = (await ask(`Thời hạn [${s.duration ?? "trống"}]: `)) || s.duration;

  let currentFeatures: string[] = [];
  try { currentFeatures = JSON.parse(s.features); } catch { currentFeatures = (s.features || "").split("\n"); }
  console.log(`\n${c.cyan}Tính năng hiện tại:${c.reset}`);
  currentFeatures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  const editFeatures = await ask("\nSửa tính năng? (y/n): ");
  let features = currentFeatures;
  if (editFeatures.toLowerCase() === "y") {
    console.log(`Nhập mới (END để kết thúc):`);
    features = [];
    while (true) {
      const line = await ask("  - ");
      if (line.toUpperCase() === "END" || !line) break;
      features.push(line);
    }
  }

  const badge = (await ask(`Badge [${s.badge ?? "trống"}]: `)) || s.badge;
  const badgeColor = (await ask(`Màu badge [${s.badgeColor ?? "trống"}]: `)) || s.badgeColor;
  const isFeaturedStr = await ask(`Nổi bật? [${s.isFeatured ? "y" : "n"}]: `);
  const isFeatured = isFeaturedStr ? isFeaturedStr.toLowerCase() === "y" : s.isFeatured;
  const sortOrderStr = await ask(`Sort [${s.sortOrder}]: `);
  const sortOrder = sortOrderStr ? parseInt(sortOrderStr) : s.sortOrder;

  try {
    await prisma.service.update({
      where: { id: s.id },
      data: { name, description, type, platform, price, originalPrice, duration,
        features: JSON.stringify(features), badge, badgeColor, isFeatured, sortOrder },
    });
    console.log(`\n${c.green}✓ Đã cập nhật${c.reset}`);
  } catch (e: any) { console.log(`\n${c.red}✗ ${e.message}${c.reset}`); }
  await ask(`${c.dim}Enter...${c.reset}`);
}

async function deleteService() {
  header("🗑️  XÓA GÓI");
  const services = await prisma.service.findMany({ orderBy: [{ sortOrder: "asc" }] });
  services.forEach((s, i) => console.log(`${c.bold}${i + 1}.${c.reset} ${s.name}`));
  const idxStr = await ask("\nChọn STT xóa: ");
  const idx = parseInt(idxStr) - 1;
  if (idx < 0 || idx >= services.length) { console.log(`${c.red}✗ Không hợp lệ${c.reset}`); await ask("Enter..."); return; }
  const s = services[idx];
  const confirm = await ask(`${c.red}XÓA "${s.name}"? (yes/no): ${c.reset}`);
  if (confirm.toLowerCase() === "yes") {
    await prisma.service.delete({ where: { id: s.id } });
    console.log(`\n${c.green}✓ Đã xóa${c.reset}`);
  } else console.log(`${c.yellow}Đã hủy${c.reset}`);
  await ask(`${c.dim}Enter...${c.reset}`);
}

async function toggleService() {
  header("�� BẬT/TẮT GÓI");
  const services = await prisma.service.findMany({ orderBy: [{ sortOrder: "asc" }] });
  services.forEach((s, i) => {
    const st = s.isActive !== false ? `${c.green}ON${c.reset}` : `${c.red}OFF${c.reset}`;
    console.log(`${c.bold}${i + 1}.${c.reset} [${st}] ${s.name}`);
  });
  const idxStr = await ask("\nChọn STT: ");
  const idx = parseInt(idxStr) - 1;
  if (idx < 0 || idx >= services.length) { console.log(`${c.red}✗${c.reset}`); await ask("Enter..."); return; }
  const s = services[idx];
  const newStatus = !(s.isActive !== false);
  await prisma.service.update({ where: { id: s.id }, data: { isActive: newStatus } });
  console.log(`\n${c.green}✓ Đã ${newStatus ? "BẬT" : "TẮT"} "${s.name}"${c.reset}`);
  await ask(`${c.dim}Enter...${c.reset}`);
}

async function seedDemo() {
  header("🌱 TẠO DỮ LIỆU MẪU");
  const confirm = await ask(`${c.yellow}Tạo 6 gói mẫu? (yes/no): ${c.reset}`);
  if (confirm.toLowerCase() !== "yes") return;

  const demos = [
    { name: "Gói GOLD 1T (3s)", slug: "gold-1t-3s", description: "Nâng cấp Locket Gold 3 giây, vĩnh viễn", type: "gold", platform: "both", price: 79000, originalPrice: 120000, duration: "Vĩnh viễn", features: ["Mở khóa toàn bộ tính năng Gold","Quay video Lockets 3 giây","Upload ảnh từ thư viện","Không quảng cáo","Thay đổi icon & theme","Bảo hành 1 đổi 1"], badge: "HOT", badgeColor: "#fbbf24", isFeatured: true, sortOrder: 1 },
    { name: "Gói GOLD 1T (15s)", slug: "gold-1t-15s", description: "Nâng cấp Locket Gold 15 giây, vĩnh viễn", type: "gold", platform: "ios", price: 129000, originalPrice: 199000, duration: "Vĩnh viễn", features: ["Quay video Lockets 15 giây","Toàn bộ tính năng Gold","Upload ảnh từ thư viện","Không quảng cáo","Bảo hành 1 đổi 1"], badge: "BEST", badgeColor: "#a78bfa", isFeatured: true, sortOrder: 2 },
    { name: "Gói VIP 1 (Cá nhân)", slug: "vip-1", description: "Gói VIP cho 1 người dùng", type: "vip", platform: "ios", price: 99000, originalPrice: 149000, duration: "Vĩnh viễn", features: ["Quay video Lockets 3 giây","Toàn bộ tính năng VIP","Upload ảnh từ thư viện","Thay đổi theme","Bảo hành 1 đổi 1"], badge: null, badgeColor: null, isFeatured: false, sortOrder: 3 },
    { name: "Gói VIP 2 (Cặp đôi)", slug: "vip-2", description: "Gói VIP cho 2 người dùng", type: "vip", platform: "ios", price: 148000, originalPrice: 249000, duration: "Vĩnh viễn", features: ["Áp dụng cho 2 tài khoản","Quay video Lockets 3 giây","Toàn bộ tính năng VIP","Bảo hành 1 đổi 1"], badge: null, badgeColor: null, isFeatured: false, sortOrder: 4 },
    { name: "Gói LUXURY 1", slug: "luxury-1", description: "Gói Luxury cao cấp nhất", type: "luxury", platform: "ios", price: 129000, originalPrice: 299000, duration: "Vĩnh viễn", features: ["Quay video Lockets 15 giây","Toàn bộ tính năng LUXURY","Xem người đã xem Lockets","Upload ảnh từ thư viện","Không giới hạn bạn bè","Bảo hành 1 đổi 1"], badge: "PREMIUM", badgeColor: "#f472b6", isFeatured: true, sortOrder: 5 },
    { name: "Android APK - ADR 1", slug: "adr-1", description: "Locket Gold cho Android, không cần root", type: "adr", platform: "android", price: 79000, originalPrice: null, duration: "1 lần tải", features: ["APK Locket Gold độc quyền","Không cần root máy","Tự động bơm Gold","Hỗ trợ mọi dòng Android","Bảo hành 1 đổi 1"], badge: "ANDROID", badgeColor: "#4ade80", isFeatured: false, sortOrder: 6 },
  ];

  let count = 0;
  for (const s of demos) {
    try {
      await prisma.service.upsert({
        where: { slug: s.slug },
        update: {},
        create: { ...s, features: JSON.stringify(s.features), isActive: true },
      });
      count++;
    } catch (e: any) { console.log(`${c.yellow}⚠ ${s.name}: ${e.message}${c.reset}`); }
  }
  console.log(`\n${c.green}✓ Đã tạo ${count}/${demos.length} gói${c.reset}`);
  await ask(`${c.dim}Enter...${c.reset}`);
}

async function menu() {
  while (true) {
    header("🚀 LOCKET GOLD - QUẢN LÝ GÓI DỊCH VỤ");
    console.log(`${c.bold}Chọn chức năng:${c.reset}\n`);
    console.log(`  ${c.cyan}1.${c.reset} 📋 Xem danh sách`);
    console.log(`  ${c.cyan}2.${c.reset} ➕ Thêm gói`);
    console.log(`  ${c.cyan}3.${c.reset} ✏️  Sửa gói`);
    console.log(`  ${c.cyan}4.${c.reset} 🗑️  Xóa gói`);
    console.log(`  ${c.cyan}5.${c.reset} 🔘 Bật/tắt gói`);
    console.log(`  ${c.cyan}6.${c.reset} 🌱 Tạo dữ liệu mẫu`);
    console.log(`  ${c.cyan}0.${c.reset} 🚪 Thoát\n`);

    const choice = await ask(`${c.bold}Nhập lựa chọn: ${c.reset}`);
    switch (choice) {
      case "1": await listServices(); break;
      case "2": await addService(); break;
      case "3": await editService(); break;
      case "4": await deleteService(); break;
      case "5": await toggleService(); break;
      case "6": await seedDemo(); break;
      case "0": console.log(`\n${c.green}Tạm biệt! 👋${c.reset}\n`); rl.close(); await prisma.$disconnect(); process.exit(0);
      default: console.log(`${c.red}Không hợp lệ${c.reset}`); await ask("Enter...");
    }
  }
}

menu().catch((e) => { console.error(e); process.exit(1); });
