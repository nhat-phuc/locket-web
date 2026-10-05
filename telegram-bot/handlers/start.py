from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from telegram.ext import ContextTypes
import httpx
from config import API_URL
import html


INTERNAL_KEY = "locket-internal-secret-2026"


async def cmd_start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tg_id = str(update.effective_user.id)
    first_name = update.effective_user.first_name or "bạn"

    # Lấy tham số sau /start (userId)
    args = ctx.args
    user_id = args[0] if args else None

    # Nếu có userId → tự động liên kết
    if user_id:
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                r = await client.post(
                    f"{API_URL}/api/telegram/link-by-userid",
                    json={"userId": user_id, "telegramId": tg_id},
                    headers={"x-internal-key": INTERNAL_KEY, "Content-Type": "application/json"},
                )
                d = r.json()

            if d.get("success"):
                u = d.get("user", {})
                text = (
                    f"✅ <b>LIÊN KẾT THÀNH CÔNG!</b>\n\n"
                    f"👤 Xin chào <b>{html.escape(u.get('name') or u.get('username') or first_name)}</b>\n"
                    f"📧 Email: {u.get('email', '—')}\n"
                    f"💰 Số dư: <b>{u.get('balance', 0):,}đ</b>\n"
                    f"🎁 Ví vòng quay: <b>{u.get('bonusBalance', 0):,}đ</b>\n\n"
                    f"👇 Nhấn /help để xem tất cả lệnh"
                )
                await update.message.reply_html(text)
                return
            else:
                await update.message.reply_text(
                    f"❌ Liên kết thất bại: {d.get('message', 'Lỗi không xác định')}\n\n"
                    f"Vui lòng thử lại từ web."
                )
                return
        except Exception as e:
            await update.message.reply_text(f"❌ Lỗi kết nối server: {e}")
            return

    # Không có userId → hướng dẫn
    text = (
        f"👋 Chào <b>{html.escape(first_name)}</b>!\n\n"
        f"🔗 Để sử dụng bot, bạn cần <b>liên kết tài khoản</b>.\n\n"
        f"<b>Cách làm:</b>\n"
        f"1. Đăng nhập web Locket Gold\n"
        f"2. Vào <b>Tài khoản → Cài đặt</b>\n"
        f"3. Nhấn nút <b>🔗 Liên kết Telegram</b>\n\n"
        f"Hệ thống sẽ tự động liên kết."
    )
    await update.message.reply_html(text)
