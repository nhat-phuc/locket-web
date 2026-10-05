from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from telegram.ext import ContextTypes
import api_client as api
from config import WEB_URL
from keyboards import back_menu, main_menu
import html


def fmt(n: int) -> str:
    return f"{n:,}".replace(",", ".") + "đ"


async def cmd_start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tg_id = str(update.effective_user.id)
    first_name = update.effective_user.first_name or "bạn"

    # Kiểm tra đã link chưa
    code, data = await api.get_user_by_telegram(tg_id)
    linked = code == 200 and data.get("success") and data.get("user")

    if linked:
        u = data["user"]
        text = (
            f"👋 Chào <b>{html.escape(u.get('name') or u.get('username') or first_name)}</b>!\n\n"
            f"Chọn chức năng bên dưới 👇"
        )
        await update.message.reply_html(text, reply_markup=main_menu())
        return

    # Chưa link → mở WebApp
    webapp_url = f"{WEB_URL}/telegram"
    text = (
        f"👋 Chào <b>{html.escape(first_name)}</b>!\n\n"
        f"🔗 Nhấn nút bên dưới để <b>mở Locket Gold</b>.\n"
        f"Hệ thống sẽ tự động liên kết tài khoản của bạn."
    )
    kb = InlineKeyboardMarkup([
        [InlineKeyboardButton("🚀 Mở Locket Gold", web_app=WebAppInfo(url=webapp_url))],
    ])
    await update.message.reply_html(text, reply_markup=kb)


async def cmd_help(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    text = (
        "<b>📖 HƯỚNG DẪN</b>\n\n"
        "/start — Menu chính\n"
        "/sodu — Xem số dư\n"
        "/donhang — Đơn hàng gần đây\n"
        "/naptien — Tạo QR nạp tiền\n"
        "/vongquay — Link quay may mắn\n"
        "/taikhoan — Thông tin tài khoản\n"
        "/help — Trợ giúp"
    )
    await update.message.reply_html(text, reply_markup=main_menu())


async def cb_router(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    data = q.data
    tg_id = str(q.from_user.id)

    if data == "menu":
        await q.edit_message_text("🏠 Menu chính", reply_markup=main_menu())
        return

    if data == "help":
        await cmd_help(update, ctx)
        return

    if data == "sodu":
        code, d = await api.get_user_by_telegram(tg_id)
        if code != 200 or not d.get("success"):
            await q.edit_message_text("❌ Bạn chưa liên kết. Gõ /start.")
            return
        u = d["user"]
        c2, b = await api.get_balance(u["email"])
        if c2 != 200 or not b.get("success"):
            await q.edit_message_text("❌ Không lấy được số dư.")
            return
        text = (
            f"💰 <b>SỐ DƯ CỦA BẠN</b>\n\n"
            f"👛 Ví chính: <b>{fmt(b.get('balance', 0))}</b>\n"
            f"🎁 Ví vòng quay: <b>{fmt(b.get('bonusBalance', 0))}</b>\n"
            f"━━━━━━━━━━━━━━━\n"
            f"💎 Tổng: <b>{fmt(b.get('total', 0))}</b>"
        )
        await q.edit_message_text(text, parse_mode="HTML", reply_markup=back_menu())
        return

    if data == "donhang":
        code, d = await api.get_orders(tg_id)
        if code != 200 or not d.get("success"):
            await q.edit_message_text("❌ Không lấy được đơn hàng.")
            return
        orders = d.get("orders", [])[:5]
        if not orders:
            await q.edit_message_text("📭 Bạn chưa có đơn hàng nào.", reply_markup=back_menu())
            return
        lines = ["📦 <b>ĐƠN HÀNG GẦN ĐÂY</b>\n"]
        for o in orders:
            status_emoji = {
                "pending": "⏳", "paid": "✅", "completed": "🎉",
                "cancelled": "❌", "expired": "⏰"
            }.get(o.get("status", ""), "•")
            lines.append(
                f"{status_emoji} <code>{o.get('orderCode')}</code>\n"
                f"   {o.get('serviceName')} — <b>{fmt(o.get('finalAmount', 0))}</b>"
            )
        await q.edit_message_text("\n\n".join(lines), parse_mode="HTML", reply_markup=back_menu())
        return

    if data == "naptien":
        await q.edit_message_text(
            "💳 <b>NẠP TIỀN</b>\n\n"
            "Nhập số tiền muốn nạp (tối thiểu 10.000đ):\n"
            "Ví dụ: <code>50000</code>",
            parse_mode="HTML",
            reply_markup=back_menu(),
        )
        ctx.user_data["awaiting"] = "amount"
        return

    if data == "vongquay":
        await q.edit_message_text(
            f"🎡 <b>VÒNG QUAY MAY MẮN</b>\n\n"
            f"👉 Mở web để quay: {WEB_URL}/vong-quay",
            parse_mode="HTML",
            reply_markup=back_menu(),
        )
        return

    if data == "taikhoan":
        code, d = await api.get_user_by_telegram(tg_id)
        if code != 200 or not d.get("success"):
            await q.edit_message_text("❌ Chưa liên kết.")
            return
        u = d["user"]
        text = (
            f"👤 <b>TÀI KHOẢN</b>\n\n"
            f"Username: <code>@{u.get('username')}</code>\n"
            f"Email: {u.get('email')}\n"
            f"Vai trò: {u.get('role', 'user').upper()}"
        )
        await q.edit_message_text(text, parse_mode="HTML", reply_markup=back_menu())
        return


async def handle_text(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if ctx.user_data.get("awaiting") == "amount":
        text = update.message.text.strip().replace(".", "").replace(",", "")
        if not text.isdigit():
            await update.message.reply_text("❌ Vui lòng nhập số. Ví dụ: 50000")
            return
        amount = int(text)
        if amount < 10000:
            await update.message.reply_text("❌ Tối thiểu 10.000đ")
            return
        tg_id = str(update.effective_user.id)
        code, d = await api.create_recharge(tg_id, amount)
        if code == 200 and d.get("success"):
            qr = d.get("qrUrl", "")
            order_code = d.get("orderCode", "")
            text = (
                f"✅ <b>ĐÃ TẠO ĐƠN NẠP</b>\n\n"
                f"Số tiền: <b>{fmt(amount)}</b>\n"
                f"Mã đơn: <code>{order_code}</code>\n\n"
                f"👉 Quét QR hoặc chuyển khoản đúng nội dung:\n"
                f"<code>{order_code}</code>"
            )
            await update.message.reply_html(text, reply_markup=main_menu())
        else:
            await update.message.reply_text(f"❌ {d.get('message', 'Lỗi tạo đơn')}")
        ctx.user_data["awaiting"] = None
        return

    await update.message.reply_text("Gõ /start để mở menu.")
