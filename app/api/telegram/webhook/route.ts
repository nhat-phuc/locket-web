import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendMessage(chatId: number, text: string) {
  if (!BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text = (message.text || "").trim();
    const fromId = message.from?.id;
    const firstName = message.from?.first_name || "bạn";

    if (text.startsWith("/start")) {
      const userId = text.split(" ")[1];
      if (!userId) {
        await sendMessage(chatId, `👋 Xin chào <b>${firstName}</b>!\n\nVào web → tài khoản → bấm "Liên kết Telegram".`);
        return NextResponse.json({ ok: true });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, username: true, telegramId: true },
      });
      if (!user) {
        await sendMessage(chatId, `❌ Không tìm thấy tài khoản.`);
        return NextResponse.json({ ok: true });
      }
      if (user.telegramId === String(fromId)) {
        await sendMessage(chatId, `✅ Tài khoản đã liên kết rồi!`);
        return NextResponse.json({ ok: true });
      }

      const existing = await prisma.user.findFirst({
        where: { telegramId: String(fromId) },
        select: { id: true, email: true },
      });
      if (existing && existing.id !== userId) {
        await sendMessage(chatId, `⚠️ Telegram này đã liên kết với ${existing.email}.`);
        return NextResponse.json({ ok: true });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { telegramId: String(fromId), telegramLinkedAt: new Date() },
      });

      const name = user.name || user.username || user.email;
      await sendMessage(chatId, `🎉 <b>Liên kết thành công!</b>\n\n👤 ${name}\n📧 ${user.email}\n\nBạn sẽ nhận thông báo qua Telegram.`);
      return NextResponse.json({ ok: true });
    }

    if (text === "/help") {
      await sendMessage(chatId, `📖 /start - Bắt đầu\n/huy - Hủy liên kết\n/help - Trợ giúp`);
      return NextResponse.json({ ok: true });
    }

    if (text === "/huy") {
      const user = await prisma.user.findFirst({ where: { telegramId: String(fromId) } });
      if (user) {
        await prisma.user.update({ where: { id: user.id }, data: { telegramId: null, telegramLinkedAt: null } });
        await sendMessage(chatId, `✅ Đã hủy liên kết.`);
      } else {
        await sendMessage(chatId, `ℹ️ Chưa liên kết.`);
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[telegram/webhook]", error);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
