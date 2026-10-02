import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const users = await prisma.user.findMany({
  take: 1,
  select: {
    email: true,
    telegramId: true,
    telegramLinkCode: true,
    telegramLinkedAt: true,
  },
});

console.log("✅ Field Telegram đã có trong DB");
console.log("Sample:", users[0]);

await prisma.$disconnect();
