import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const INTERNAL_KEY = process.env.INTERNAL_API_KEY || "locket-internal-secret-2026";

export async function POST(req: Request) {
  try {
    const header = req.headers.get("x-internal-key");
    if (header !== INTERNAL_KEY) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { userId, telegramId } = await req.json();
    if (!userId || !telegramId) {
      return NextResponse.json({ success: false, message: "Thiếu userId hoặc telegramId" }, { status: 400 });
    }

    const tgIdStr = String(telegramId).trim();

    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await prisma.user.findFirst({ where: { username: userId } });
    }
    if (!user) {
      return NextResponse.json({ success: false, message: "User không tồn tại" }, { status: 404 });
    }

    const existing = await prisma.user.findUnique({ where: { telegramId: tgIdStr } });
    if (existing && existing.id !== user.id) {
      return NextResponse.json({
        success: false,
        message: `Telegram này đã liên kết với @${existing.username}`,
      }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { telegramId: tgIdStr, telegramLinkedAt: new Date() },
    });

    await prisma.log.create({
      data: {
        action: "TELEGRAM_LINK_BOT",
        userId: user.id,
        detail: `Liên kết Telegram ID: ${tgIdStr}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Liên kết thành công",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        balance: user.balance,
        bonusBalance: user.bonusBalance,
      },
    });
  } catch (error) {
    console.error("[link-by-userid]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
