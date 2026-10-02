#!/usr/bin/env python3
import os
import logging
from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    CallbackQueryHandler,
    MessageHandler,
    filters,
)

load_dotenv(".env.local")

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
WEB_URL = os.getenv("NEXT_PUBLIC_APP_URL", "https://locket-web-eight.vercel.app")

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

QUICK_AMOUNTS = [20000, 50000, 100000, 200000, 500000, 1000000]


# ═══════════════════════════════════════════════════════════
# /start
# ═══════════════════════════════════════════════════════════
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    name = user.first_name or user.username or "bạn"
    chat_id = update.effective_chat.id

    # Kiểm tra tham số /start LINK-XXXX
    args = context.args
    if args and args[0].startswith("LINK-"):
        code = args[0].upper()

        try:
            import requests
            res = requests.post(
                f"{WEB_URL}/api/telegram/link",
                json={"code": code, "telegramId": str(chat_id)},
                timeout=10,
            )
            data = res.json()

            if data.get("success"):
                await update.message.reply_text(
                    f"✅ <b>Liên kết thành công!</b>\n\n"
                    f"👤 Tài khoản: <b>{data.get('userName', 'bạn')}</b>\n"
                    f"🔗 Telegram ID: <code>{chat_id}</code>\n\n"
                    f"Bạn có thể dùng:\n"
                    f"• /sodu — Kiểm tra số dư\n"
                    f"• /naptien — Nạp tiền\n"
                    f"• /me — Thông tin tài khoản",
                    parse_mode="HTML",
                )
                return
            else:
                await update.message.reply_text(
                    f"❌ <b>Liên kết thất bại</b>\n\n"
                    f"Lý do: {data.get('message', 'Mã không hợp lệ')}",
                    parse_mode="HTML",
                )
                return
        except Exception as e:
            logger.error(f"Auto-link error: {e}")
            await update.message.reply_text("⚠️ Lỗi kết nối server.")
            return

    # Menu bình thường
    welcome = (
        f"👋 <b>Xin chào {name}!</b>\n\n"
        f"🤖 Đây là Bot chính thức của <b>Locket Gold</b>.\n\n"
        f"📌 <b>Các lệnh:</b>\n"
        f"• /naptien — Nạp tiền\n"
        f"• /sodu — Kiểm tra số dư\n"
        f"• /me — Thông tin tài khoản\n"
        f"• /link <code>MÃ_CODE</code> — Liên kết\n"
        f"• /help — Trợ giúp"
    )

    keyboard = [
        [InlineKeyboardButton("💰 Nạp tiền ngay", callback_data="open_recharge")],
        [InlineKeyboardButton("💳 Số dư", callback_data="show_balance")],
        [InlineKeyboardButton("🌐 Trang tài khoản", url=f"{WEB_URL}/tai-khoan")],
    ]

    await update.message.reply_text(
        welcome,
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(keyboard),
    )




# ═══════════════════════════════════════════════════════════
# /help
# ═══════════════════════════════════════════════════════════
async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🆘 <b>Trợ giúp</b>\n\n"
        "• /naptien — Nạp tiền\n"
        "• /link <code>MÃ_CODE</code> — Liên kết tài khoản\n"
        "• /me — Xem tài khoản\n"
        "• /sodu — Số dư\n\n"
        f"📞 Liên hệ: {WEB_URL}/lien-he",
        parse_mode="HTML",    )


# ═══════════════════════════════════════════════════════════
# /link
# ═══════════════════════════════════════════════════════════
async def link_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    args = context.args

    if not args:
        await update.message.reply_text(
            "⚠️ <b>Thiếu mã liên kết</b>\n\n"
            "Cú pháp:\n<code>/link LINK-XXXXXX</code>\n\n"
            f"Mã lấy từ: {WEB_URL}/tai-khoan",
            parse_mode="HTML",
        )
        return

    code = args[0].upper()

    try:
        import requests
        res = requests.post(
            f"{WEB_URL}/api/telegram/link",
            json={"code": code, "telegramId": str(chat_id)},
            timeout=10,
        )
        data = res.json()

        if data.get("success"):
            await update.message.reply_text(
                f"✅ <b>Liên kết thành công!</b>\n\n"
                f"👤 Tài khoản: <b>{data.get('userName', 'bạn')}</b>\n"
                f"🔗 Telegram ID: <code>{chat_id}</code>\n\n"
                f"Từ giờ bạn có thể /naptien ngay tại đây. 🎉",
                parse_mode="HTML",
            )
        else:
            await update.message.reply_text(
                f"❌ <b>Thất bại</b>\n\n{data.get('message', 'Mã không hợp lệ')}\n\n"
                f"Lấy mã mới: {WEB_URL}/tai-khoan",
                parse_mode="HTML",
            )
    except Exception as e:
        logger.error(f"Link error: {e}")
        await update.message.reply_text("⚠️ Lỗi kết nối server.")


# ═══════════════════════════════════════════════════════════
# /me
# ═══════════════════════════════════════════════════════════
async def me_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    try:
        import requests
        res = requests.get(
            f"{WEB_URL}/api/telegram/me?telegramId={chat_id}",
            timeout=10,
        )
        data = res.json()

        if data.get("success"):
            u = data["user"]
            name = u.get("name") or u.get("username") or u.get("email", "User")
            await update.message.reply_text(
                f"👤 <b>Thông tin tài khoản</b>\n\n"
                f"📧 Email: <code>{u.get('email', '—')}</code>\n"
                f"👤 Tên: <b>{name}</b>\n"
                f"💳 Số dư: <b>{u.get('balance', 0):,}đ</b>\n"
                f"🎫 Cấp bậc: {u.get('role', 'user').upper()}",
                parse_mode="HTML",
            )
        else:
            await update.message.reply_text(
                "⚠️ Bạn chưa liên kết.\nGõ <code>/link MÃ_CODE</code> trước.",
                parse_mode="HTML",
            )
    except Exception as e:
        logger.error(f"Me error: {e}")
        await update.message.reply_text("⚠️ Lỗi kết nối.")


# ═══════════════════════════════════════════════════════════
# /sodu
# ═══════════════════════════════════════════════════════════
async def sodu_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    try:
        import requests
        res = requests.get(
            f"{WEB_URL}/api/telegram/balance?telegramId={chat_id}",
            timeout=10,
        )
        data = res.json()

        if data.get("success"):
            await update.message.reply_text(
                f"💳 <b>Số dư của bạn</b>\n\n"
                f"<b>{data.get('balance', 0):,}đ</b>\n\n"
                f"💰 Nạp thêm: /naptien",
                parse_mode="HTML",
            )
        else:
            await update.message.reply_text(
                "⚠️ Chưa liên kết. Gõ /link <code>MÃ_CODE</code>.",
                parse_mode="HTML",
            )
    except Exception as e:
        logger.error(f"Sodu error: {e}")
        await update.message.reply_text("⚠️ Lỗi kết nối.")


# ═══════════════════════════════════════════════════════════
# /naptien — Nạp tiền
# ═══════════════════════════════════════════════════════════
async def naptien_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await show_recharge_menu(update, context)


async def show_recharge_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = []
    row = []
    for i, amt in enumerate(QUICK_AMOUNTS):
        row.append(InlineKeyboardButton(f"{amt:,}đ", callback_data=f"recharge_{amt}"))
        if len(row) == 3:
            keyboard.append(row)
            row = []
    if row:
        keyboard.append(row)

    keyboard.append([InlineKeyboardButton("✏️ Nhập số tiền khác", callback_data="recharge_custom")])

    text = (
        "💰 <b>NẠP TIỀN VÀO VÍ</b>\n\n"
        "Chọn số tiền bạn muốn nạp:\n"
        "<i>(Tối thiểu 10.000đ)</i>"
    )

    if update.callback_query:
        await update.callback_query.edit_message_text(
            text,
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup(keyboard),
        )
    else:
        await update.message.reply_text(
            text,
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup(keyboard),
        )


# ═══════════════════════════════════════════════════════════
# XỬ LÝ CALLBACK (chọn số tiền)
# ═══════════════════════════════════════════════════════════
async def callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    data = query.data
    chat_id = update.effective_chat.id

    if data == "open_recharge":
        await show_recharge_menu(update, context)
        return

    if data.startswith("recharge_"):
        amount_str = data.replace("recharge_", "")

        if amount_str == "custom":
            await query.edit_message_text(
                "✏️ <b>Nhập số tiền muốn nạp</b>\n\n"
                "Gõ số tiền (VD: <code>150000</code>):",
                parse_mode="HTML",
            )
            context.user_data["awaiting_amount"] = True
            return

        amount = int(amount_str)
        await create_recharge_order(update, context, amount)


async def create_recharge_order(update: Update, context: ContextTypes.DEFAULT_TYPE, amount: int):
    query = update.callback_query
    chat_id = update.effective_chat.id

    try:
        import requests

        # Gửi "đang xử lý"
        await query.edit_message_text(
            f"⏳ Đang tạo QR nạp <b>{amount:,}đ</b>...",
            parse_mode="HTML",
        )

        res = requests.post(
            f"{WEB_URL}/api/telegram/recharge",
            json={"telegramId": str(chat_id), "amount": amount},
            timeout=15,
        )
        data = res.json()

        if not data.get("success"):
            await query.edit_message_text(
                f"❌ <b>Lỗi</b>\n\n{data.get('message', 'Không tạo được đơn')}",
                parse_mode="HTML",
            )
            return

        order = data["order"]
        bank = data["bank"]

        text = (
            f"✅ <b>ĐƠN NẠP ĐÃ TẠO</b>\n\n"
            f"📦 Mã đơn: <code>{order['orderCode']}</code>\n"
            f"💰 Số tiền: <b>{order['amount']:,}đ</b>\n\n"
            f"🏦 <b>Thông tin chuyển khoản:</b>\n"
            f"• Ngân hàng: <b>{bank['bankName']}</b>\n"
            f"• Số TK: <code>{bank['accountNo']}</code>\n"
            f"• Chủ TK: <b>{bank['accountName']}</b>\n"
            f"• Nội dung: <code>{order['orderCode']}</code>\n\n"
            f"⚠️ <b>Nhập ĐÚNG nội dung</b> để hệ thống tự cộng tiền.\n\n"
            f"📱 Quét QR bên dưới hoặc CK thủ công.\n"
            f"⏱ Hết hạn sau 15 phút."
        )

        # Gửi QR + text
        await context.bot.send_photo(
            chat_id=chat_id,
            photo=data["qrUrl"],
            caption=text,
            parse_mode="HTML",
        )

        # Xóa tin nhắn "đang tạo"
        try:
            await query.delete_message()
        except:
            pass

    except Exception as e:
        logger.error(f"Recharge error: {e}")
        await query.edit_message_text("❌ Lỗi kết nối server.")


# ═══════════════════════════════════════════════════════════
# XỬ LÝ TEXT (số tiền tùy ý)
# ═══════════════════════════════════════════════════════════
async def text_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if context.user_data.get("awaiting_amount"):
        text = update.message.text.strip().replace(".", "").replace(",", "")
        try:
            amount = int(text)
            if amount < 10000:
                await update.message.reply_text(
                    "⚠️ Số tiền tối thiểu <b>10.000đ</b>. Nhập lại:",
                    parse_mode="HTML",
                )
                return

            context.user_data["awaiting_amount"] = False

            # Gọi API tạo đơn
            import requests
            chat_id = update.effective_chat.id

            res = requests.post(
                f"{WEB_URL}/api/telegram/recharge",
                json={"telegramId": str(chat_id), "amount": amount},
                timeout=15,
            )
            data = res.json()

            if not data.get("success"):
                await update.message.reply_text(
                    f"❌ Lỗi: {data.get('message', 'Không tạo được đơn')}",
                )
                return

            order = data["order"]
            bank = data["bank"]

            caption = (
                f"✅ <b>ĐƠN NẠP ĐÃ TẠO</b>\n\n"
                f"📦 Mã đơn: <code>{order['orderCode']}</code>\n"
                f"💰 Số tiền: <b>{order['amount']:,}đ</b>\n\n"
                f"🏦 <b>Thông tin CK:</b>\n"
                f"• Ngân hàng: <b>{bank['bankName']}</b>\n"
                f"• Số TK: <code>{bank['accountNo']}</code>\n"
                f"• Chủ TK: <b>{bank['accountName']}</b>\n"
                f"• Nội dung: <code>{order['orderCode']}</code>\n\n"
                f"⚠️ Nhập ĐÚNG nội dung để hệ thống tự cộng tiền.\n"
                f"⏱ Hết hạn sau 15 phút."
            )

            await context.bot.send_photo(
                chat_id=chat_id,
                photo=data["qrUrl"],
                caption=caption,
                parse_mode="HTML",
            )
        except ValueError:
            await update.message.reply_text("⚠️ Vui lòng nhập số. VD: <code>150000</code>", parse_mode="HTML")
    else:
        await update.message.reply_text(
            "🤔 Không hiểu. Gõ /help để xem lệnh."
        )


def main():
    if not BOT_TOKEN:
        logger.error("❌ Thiếu TELEGRAM_BOT_TOKEN")
        return

    logger.info("🤖 Bot đang khởi động...")
    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("link", link_command))
    app.add_handler(CommandHandler("me", me_command))
    app.add_handler(CommandHandler("sodu", sodu_command))
    app.add_handler(CommandHandler("naptien", naptien_command))
    app.add_handler(CallbackQueryHandler(callback_handler))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, text_handler))

    logger.info("✅ Bot sẵn sàng! Nhấn Ctrl+C để dừng.")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
