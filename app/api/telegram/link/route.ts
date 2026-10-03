import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "YourBotUsername";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, telegramId: true, telegramLinkedAt: true },
    });
    if (!user) return NextResponse.json({ success: false, message: "User không tồn tại" }, { status: 404 });

    if (user.telegramId) {
      return NextResponse.json({ success: true, linked: true, telegramId: user.telegramId, linkedAt: user.telegramLinkedAt });
    }

    return NextResponse.json({
      success: true,
      linked: false,
      link: `https://t.me/${BOT_USERNAME}?start=${user.id}`,
      botUsername: BOT_USERNAME,
    });
  } catch (error) {
    console.error("[telegram/link]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
