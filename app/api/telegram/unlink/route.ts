import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { chatId } = await req.json();
    await prisma.user.updateMany({
      where: { telegramId: String(chatId) },
      data: { telegramId: null },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
