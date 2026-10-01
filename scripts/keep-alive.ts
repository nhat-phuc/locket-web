import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function ping() {
  try {
    await p.$queryRaw`SELECT 1`;
    console.log(`[${new Date().toISOString()}] Ping OK`);
  } catch (e) {
    console.error("Ping failed:", e);
  }
}

ping().finally(() => p.$disconnect());
