import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const ITEMS = [
  { label: "5.000đ",   value: 5000,   type: "money",   color: "#fbbf24", weight: 30, sortOrder: 0 },
  { label: "10.000đ",  value: 10000,  type: "money",   color: "#f472b6", weight: 25, sortOrder: 1 },
  { label: "20.000đ",  value: 20000,  type: "money",   color: "#a78bfa", weight: 15, sortOrder: 2 },
  { label: "50.000đ",  value: 50000,  type: "money",   color: "#34d399", weight: 5,  sortOrder: 3 },
  { label: "Chúc may mắn", value: 0,  type: "none",    color: "#64748b", weight: 15, sortOrder: 4 },
  { label: "Voucher 10k",  value: 10000, type: "voucher", color: "#f59e0b", weight: 5, sortOrder: 5 },
  { label: "100.000đ", value: 100000, type: "money",   color: "#ec4899", weight: 2,  sortOrder: 6 },
  { label: "Chúc may mắn", value: 0,  type: "none",    color: "#475569", weight: 3,  sortOrder: 7 },
];

async function main() {
  const count = await prisma.wheelItem.count();
  if (count > 0) { console.log(`Đã có ${count} ô quay`); return; }
  for (const item of ITEMS) await prisma.wheelItem.create({ data: item });
  console.log(`Đã tạo ${ITEMS.length} ô quay`);
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
