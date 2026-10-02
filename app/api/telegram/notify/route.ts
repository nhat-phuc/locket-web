import { NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendTelegram(chatId: string, text: string) {
  if (!BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });
  } catch (e) {
    console.error("[telegram/notify]", e);
  }
}

export async function POST(req: Request) {
  try {
    const { telegramId, message } = await req.json();
    if (!telegramId || !message) {
      return NextResponse.json({ success: false }, { status: 400 });
    }
    await sendTelegram(telegramId, message);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[telegram/notify]", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
