/**
 * Gửi thông báo qua Telegram Bot
 * Docs: https://core.telegram.org/bots/api#sendmessage
 */

interface TelegramResult {
  success: boolean;
  error?: string;
}

export async function sendTelegram(
  message: string,
  options?: { chatId?: string; parseMode?: "HTML" | "Markdown" }
): Promise<TelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = options?.chatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("⚠️ TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID chưa cấu hình");
    return { success: false, error: "Missing config" };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: options?.parseMode || "HTML",
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error("❌ Telegram error:", data.description);
      return { success: false, error: data.description };
    }

    console.log("✅ Telegram sent:", data.result.message_id);
    return { success: true };
  } catch (error) {
    console.error("❌ Telegram fetch error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Format tin nhắn thông báo thanh toán thành công
 */
export function formatPaymentNotification(order: {
  orderCode: string;
  serviceName: string;
  finalAmount: number;
  locketUsername: string;
  userEmail?: string;
}): string {
  return `
🎉 <b>THANH TOÁN THÀNH CÔNG</b>

📦 <b>Mã đơn:</b> <code>${order.orderCode}</code>
🎁 <b>Gói:</b> ${order.serviceName}
💰 <b>Số tiền:</b> ${order.finalAmount.toLocaleString("vi-VN")}đ
👤 <b>Username Locket:</b> ${order.locketUsername}
${order.userEmail ? `📧 <b>Email:</b> ${order.userEmail}` : ""}

⏰ <b>Thời gian:</b> ${new Date().toLocaleString("vi-VN")}
  `.trim();
}
