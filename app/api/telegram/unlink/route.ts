import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { chatId } = await req.json();
  await prisma.user.updateMany({
    where: { telegramId: String(chatId) },
    data: { telegramId: null, telegramLinkedAt: null },
  });
  return NextResponse.json({ success: true });
}
