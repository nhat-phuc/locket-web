import { NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const WEB_URL = "https://locket-web-eight.vercel.app";

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
            [
              { text: "🌐 Mở trang Tài Khoản", url: `${WEB_URL}/tai-khoan` },
            ],
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

    // ============ /link ============
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

      // TODO: Tìm user có telegramLinkCode === code
      // const user = await User.findOne({ telegramLinkCode: code });
      // if (!user) {
      //   await sendMessage(chatId, "❌ Mã không hợp lệ hoặc đã hết hạn. Vui lòng lấy mã mới trên web.");
      //   return NextResponse.json({ ok: true });
      // }
      // user.telegramId = String(chatId);
      // user.telegramLinkCode = null;
      // user.telegramLinkedAt = new Date();
      // await user.save();

      await sendMessage(
        chatId,
        `✅ <b>Liên kết thành công!</b>\n\n` +
          `Tài khoản Telegram của bạn đã được kết nối với web.\n` +
          `Từ giờ bạn sẽ nhận thông báo giao dịch tại đây. 🎉\n\n` +
          `Gõ /me để xem thông tin.`
      );
      return NextResponse.json({ ok: true });
    }

    // ============ /me ============
    if (text === "/me") {
      // TODO: Lấy user theo telegramId
      // const user = await User.findOne({ telegramId: String(chatId) });
      // if (!user) { await sendMessage(chatId, "⚠️ Bạn chưa liên kết tài khoản.\nGõ /link MÃ_CODE để liên kết."); return NextResponse.json({ok:true}); }
      // await sendMessage(chatId, `👤 <b>${user.name || user.email}</b>\n💳 Số dư: ${user.balance}đ`);

      await sendMessage(
        chatId,
        `👤 <b>Thông tin tài khoản</b>\n\n` +
          `(Phần này cần kết nối database để hiển thị)\n\n` +
          `Mở web để xem chi tiết: ${WEB_URL}/tai-khoan`
      );
      return NextResponse.json({ ok: true });
    }

    // ============ /sodu ============
    if (text === "/sodu") {
      // TODO: Lấy balance từ DB
      await sendMessage(chatId, `💳 Số dư của bạn: <b>0đ</b>\n\nNạp tiền tại: ${WEB_URL}/nap-tien`);
      return NextResponse.json({ ok: true });
    }

    // ============ Tin nhắn khác ============
    await sendMessage(
      chatId,
      `🤔 Mình không hiểu lệnh này.\nGõ /help để xem danh sách lệnh.`
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[TELEGRAM WEBHOOK ERROR]", err);
    return NextResponse.json({ ok: true });
  }
}

// Cho phép Telegram gọi GET để verify
export async function GET() {
  return NextResponse.json({ ok: true, message: "Telegram webhook is running" });
}
