import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const WEB_URL = process.env.NEXT_PUBLIC_APP_URL || "https://locket-web-eight.vercel.app";

async function sendMessage(chatId: number, text: string, extra: any = {}) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      ...extra,
    }),
  });
}

export async function POST(req: Request) {
  try {
    const update = await req.json();
    const message = update.message;
    if (!message || !message.text) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text.trim();
    const from = message.from || {};
    const name = from.first_name || from.username || "bạn";

    // ============ /start ============
    if (text === "/start" || text.startsWith("/start ")) {
      // Xử lý deep link: /start <token>
      const parts = text.split(/\s+/);
      const token = parts[1];

      if (token) {
        // Tự động liên kết nếu có token
        const user = await prisma.user.findFirst({
          where: { telegramLinkCode: token },
        });

        if (!user) {
          await sendMessage(
            chatId,
            `❌ <b>Mã liên kết không hợp lệ hoặc đã hết hạn.</b>\n\n` +
              `Vui lòng lấy mã mới tại: ${WEB_URL}/tai-khoan`
          );
          return NextResponse.json({ ok: true });
        }

        // Cập nhật user
        await prisma.user.update({
          where: { id: user.id },
          data: {
            telegramId: String(chatId),
            telegramLinkCode: null,
            telegramLinkedAt: new Date(),
          },
        });

        await sendMessage(
          chatId,
          `✅ <b>Liên kết thành công!</b>\n\n` +
            `👤 Tài khoản: <b>${user.name || user.username || user.email}</b>\n` +
            `💳 Số dư: <b>${user.balance.toLocaleString("vi-VN")}đ</b>\n\n` +
            `Từ giờ bạn sẽ nhận thông báo giao dịch tại đây. 🎉\n\n` +
            `Gõ /help để xem các lệnh.`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "🌐 Mở trang Tài Khoản", url: `${WEB_URL}/tai-khoan` }],
                [
                  { text: "💰 Nạp tiền", url: `${WEB_URL}/nap-tien` },
                  { text: "📖 Bảng giá", url: `${WEB_URL}/bang-gia` },
                ],
              ],
            },
          }
        );
        return NextResponse.json({ ok: true });
      }

      // Không có token → menu chào mừng
      const welcomeText =
        `👋 <b>Xin chào ${name}!</b>\n\n` +
        `🤖 Đây là Bot chính thức của <b>Locket Gold</b>.\n\n` +
        `📌 <b>Các lệnh có thể dùng:</b>\n` +
        `• /link <code>MÃ_CODE</code> — Liên kết tài khoản web với Telegram\n` +
        `• /me — Xem thông tin tài khoản đã liên kết\n` +
        `• /sodu — Kiểm tra số dư\n` +
        `• /help — Trợ giúp\n\n` +
        `🔗 <b>Chưa có mã?</b> Vào trang Tài Khoản trên web để lấy:\n` +
        `${WEB_URL}/tai-khoan`;

      await sendMessage(chatId, welcomeText, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🌐 Mở trang Tài Khoản", url: `${WEB_URL}/tai-khoan` }],
            [
              { text: "📖 Hướng dẫn", url: `${WEB_URL}/huong-dan` },
              { text: "💰 Bảng giá", url: `${WEB_URL}/bang-gia` },
            ],
          ],
        },
      });

      return NextResponse.json({ ok: true });
    }

    // ============ /help ============
    if (text === "/help") {
      await sendMessage(
        chatId,
        `🆘 <b>Trợ giúp</b>\n\n` +
          `• /start — Bắt đầu lại\n` +
          `• /link MÃ_CODE — Liên kết tài khoản\n` +
          `• /me — Xem tài khoản\n` +
          `• /sodu — Số dư\n\n` +
          `📞 Liên hệ admin nếu cần hỗ trợ.`
      );
      return NextResponse.json({ ok: true });
    }

    // ============ /link <code> ============
    if (text.startsWith("/link")) {
      const parts = text.split(/\s+/);
      const code = parts[1];

      if (!code) {
        await sendMessage(
          chatId,
          `⚠️ <b>Thiếu mã liên kết</b>\n\nCú pháp đúng:\n<code>/link LINK-XXXXXX</code>\n\nMã lấy từ trang Tài Khoản trên web:\n${WEB_URL}/tai-khoan`
        );
        return NextResponse.json({ ok: true });
      }

      const user = await prisma.user.findFirst({
        where: { telegramLinkCode: code },
      });

      if (!user) {
        await sendMessage(
          chatId,
          `❌ <b>Mã không hợp lệ hoặc đã hết hạn.</b>\n\nVui lòng lấy mã mới tại: ${WEB_URL}/tai-khoan`
        );
        return NextResponse.json({ ok: true });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          telegramId: String(chatId),
          telegramLinkCode: null,
          telegramLinkedAt: new Date(),
        },
      });

      await sendMessage(
        chatId,
        `✅ <b>Liên kết thành công!</b>\n\n` +
          `👤 Tài khoản: <b>${user.name || user.username || user.email}</b>\n` +
          `💳 Số dư: <b>${user.balance.toLocaleString("vi-VN")}đ</b>\n\n` +
          `Gõ /me để xem thông tin.`
      );
      return NextResponse.json({ ok: true });
    }

    // ============ /me ============
    if (text === "/me") {
      const user = await prisma.user.findFirst({
        where: { telegramId: String(chatId) },
      });

      if (!user) {
        await sendMessage(
          chatId,
          `⚠️ Bạn chưa liên kết tài khoản.\nGõ /link MÃ_CODE để liên kết.\n\nLấy mã tại: ${WEB_URL}/tai-khoan`
        );
        return NextResponse.json({ ok: true });
      }

      await sendMessage(
        chatId,
        `👤 <b>${user.name || user.username || user.email}</b>\n` +
          `📧 ${user.email}\n` +
          `💳 Số dư: <b>${user.balance.toLocaleString("vi-VN")}đ</b>\n` +
          `📅 Tham gia: ${new Date(user.createdAt).toLocaleDateString("vi-VN")}`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "💰 Nạp tiền", url: `${WEB_URL}/nap-tien` }],
              [{ text: "🌐 Trang Tài Khoản", url: `${WEB_URL}/tai-khoan` }],
            ],
          },
        }
      );
      return NextResponse.json({ ok: true });
    }

    // ============ /sodu ============
    if (text === "/sodu") {
      const user = await prisma.user.findFirst({
        where: { telegramId: String(chatId) },
      });

      if (!user) {
        await sendMessage(chatId, `⚠️ Bạn chưa liên kết tài khoản.\nGõ /link MÃ_CODE để liên kết.`);
        return NextResponse.json({ ok: true });
      }

      await sendMessage(
        chatId,
        `💳 Số dư của bạn: <b>${user.balance.toLocaleString("vi-VN")}đ</b>\n\n` +
          `Nạp thêm tại: ${WEB_URL}/nap-tien`
      );
      return NextResponse.json({ ok: true });
    }

    // ============ Tin nhắn khác ============
    await sendMessage(chatId, `🤔 Mình không hiểu lệnh này.\nGõ /help để xem danh sách lệnh.`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[TELEGRAM WEBHOOK ERROR]", err);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Telegram webhook is running" });
}
