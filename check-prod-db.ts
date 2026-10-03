import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

// Đọc DATABASE_URL từ .env.production.local
const envContent = fs.readFileSync(".env.production.local", "utf-8");
const match = envContent.match(/DATABASE_URL="([^"]+)"/);
if (!match) { console.error("Không tìm thấy DATABASE_URL"); process.exit(1); }
process.env.DATABASE_URL = match[1];

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.user.count();
  console.log("🌐 DB PRODUCTION có:", count, "user");

  const users = await prisma.user.findMany({
    select: { email: true, username: true, createdAt: true, balance: true },
    take: 10,
    orderBy: { createdAt: "desc" },
  });
  console.table(users);
}
main().finally(() => prisma.$disconnect());
