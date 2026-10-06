import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

async function notifyGroup(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_GROUP_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (e) {
    console.error("[ping] notify error:", e);
  }
}

export async function POST() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true, username: true, email: true, name: true,
        role: true, balance: true, bonusBalance: true,
        telegramId: true, lastActiveAt: true, createdAt: true,
      },
    });
    if (!user) return NextResponse.json({ success: false });

    const now = new Date();
    const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt).getTime() : 0;
    const diffMinutes = (now.getTime() - lastActive) / 60000;

    // Coi là "session mới" nếu > 30 phút không active
    const isNewSession = diffMinutes > 30;

    // Cập nhật lastActiveAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: now },
    });

    // Chỉ thông báo khi session mới
    if (isNewSession) {
      // Lưu log
      await prisma.log.create({
        data: {
          action: "USER_VISIT",
          userId: user.id,
          detail: `@${user.username} truy cập web`,
        },
      });

      const roleEmoji = user.role === "admin" ? "👑" : "👤";
      const isFirstTime = !user.lastActiveAt;
      const timeAgo = isFirstTime ? "lần đầu" : `${Math.floor(diffMinutes / 60)}h trước`;

      const msg = [
        isFirstTime
          ? "🌟 <b>USER LẦN ĐẦU TRUY CẬP</b>"
          : "👋 <b>USER QUAY LẠI</b>",
        "",
        `${roleEmoji} Username: <code>@${user.username}</code>`,
        `📧 Email: ${user.email}`,
        user.name ? `📛 Tên: ${user.name}` : "",
        `💰 Số dư: <b>${(user.balance || 0).toLocaleString("vi-VN")}đ</b>`,
        `🎁 Ví quay: <b>${(user.bonusBalance || 0).toLocaleString("vi-VN")}đ</b>`,
        user.telegramId ? `✅ Telegram: đã liên kết` : `⚠️ Telegram: chưa liên kết`,
        `🕐 Truy cập: ${now.toLocaleString("vi-VN")}`,
        !isFirstTime ? `⏱ Lần cuối: ${timeAgo}` : "",
      ].filter(Boolean).join("\n");

      await notifyGroup(msg);
    }

    return NextResponse.json({
      success: true,
      isNewSession,
      diffMinutes: Math.round(diffMinutes),
    });
  } catch (error) {
    console.error("[ping]", error);
    return NextResponse.json({ success: false });
  }
}
