import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * POST body: { telegramId: string }
 * Gán telegramId vào user đang đăng nhập
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }

    const { telegramId } = await req.json();
    if (!telegramId) {
      return NextResponse.json({ success: false, message: "Thiếu telegramId" }, { status: 400 });
    }

    const idStr = String(telegramId).trim();

    // Check telegramId chưa bị user khác dùng
    const existing = await prisma.user.findUnique({
      where: { telegramId: idStr },
      select: { id: true, username: true },
    });
    if (existing && existing.id !== session.userId) {
      return NextResponse.json({
        success: false,
        message: `Telegram này đã liên kết với @${existing.username}`,
      }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        telegramId: idStr,
        telegramLinkedAt: new Date(),
      },
    });

    await prisma.log.create({
      data: {
        action: "TELEGRAM_LINK_BOT",
        userId: session.userId,
        detail: `Liên kết Telegram ID: ${idStr}`,
      },
    });

    return NextResponse.json({ success: true, message: "Đã liên kết Telegram" });
  } catch (error) {
    console.error("[telegram/link-bot]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
