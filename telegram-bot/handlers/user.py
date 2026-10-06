from telegram import Update
from telegram.ext import ContextTypes
import api_client as api
from config import WEB_URL
from keyboards import main_menu, back_menu, amount_menu, qr_menu, check_menu
import html


def fmt(n: int) -> str:
    return f"{n:,}".replace(",", ".") + "đ"


STATUS_MAP = {
    "pending": ("⏳", "Chờ thanh toán"),
    "paid": ("✅", "Đã thanh toán"),
    "completed": ("🎉", "Hoàn thành"),
    "cancelled": ("❌", "Đã hủy"),
    "expired": ("⏰", "Hết hạn"),
    "processing": ("⚙️", "Đang xử lý"),
}


def status_text(status: str) -> str:
    emoji, label = STATUS_MAP.get(status, ("•", status))
    return f"{emoji} {label}"


async def _get_linked_user(tg_id: str):
    code, d = await api.get_user_by_telegram(tg_id)
    if code == 200 and d.get("success") and d.get("user"):
        return d["user"]
    return None


# ─── COMMANDS ───
async def cmd_start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tg_id = str(update.effective_user.id)
    first_name = update.effective_user.first_name or "bạn"
    u = await _get_linked_user(tg_id)

    if u:
        is_admin = u.get("role") == "admin"
        name = html.escape(u.get("name") or u.get("username") or first_name)
        if is_admin:
            text = f"👑 Chào <b>ADMIN {name}</b>!\n\n🎯 Chọn chức năng quản trị 👇"
            from keyboards import admin_menu
            await update.message.reply_html(text, reply_markup=admin_menu())
        else:
            text = f"👋 Chào <b>{name}</b>!\n\n🎯 Chọn chức năng bên dưới 👇"
            await update.message.reply_html(text, reply_markup=main_menu())
    else:
        await update.message.reply_html(
            f"👋 Chào <b>{html.escape(first_name)}</b>!\n\n"
            f"🔗 Bạn cần <b>liên kết tài khoản</b> trước.\n\n"
            f"1. Đăng nhập web\n"
            f"2. Vào Tài khoản → Cài đặt\n"
            f"3. Nhấn 🔗 Liên kết Telegram"
        )


async def cmd_help(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    text = (
        "<b>📖 HƯỚNG DẪN</b>\n\n"
        "/start — Menu chính\n"
        "/sodu — Số dư\n"
        "/donhang — Đơn hàng\n"
        "/naptien — Nạp tiền\n"
        "/vongquay — Vòng quay\n"
        "/taikhoan — Tài khoản\n"
        "/help — Trợ giúp"
    )
    await update.message.reply_html(text, reply_markup=main_menu())


async def cmd_sodu(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tg_id = str(update.effective_user.id)
    u = await _get_linked_user(tg_id)
    if not u:
        await update.message.reply_text("❌ Chưa liên kết. Gõ /start.")
        return
    c2, b = await api.get_balance(u["email"])
    if c2 != 200 or not b.get("success"):
        await update.message.reply_text("❌ Không lấy được số dư.")
        return
    text = (
        f"💰 <b>SỐ DƯ</b>\n\n"
        f"👛 Ví chính: <b>{fmt(b.get('balance', 0))}</b>\n"
        f"🎁 Ví vòng quay: <b>{fmt(b.get('bonusBalance', 0))}</b>\n"
        f"━━━━━━━━━━━━━━━\n"
        f"💎 Tổng: <b>{fmt(b.get('total', 0))}</b>"
    )
    await update.message.reply_html(text, reply_markup=back_menu())


async def cmd_donhang(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tg_id = str(update.effective_user.id)
    u = await _get_linked_user(tg_id)
    if not u:
        await update.message.reply_text("❌ Chưa liên kết.")
        return
    code, d = await api.get_orders(tg_id)
    if code != 200 or not d.get("success"):
        await update.message.reply_text("❌ Không lấy được đơn.")
        return
    orders = d.get("orders", [])[:5]
    if not orders:
        await update.message.reply_html("📭 Chưa có đơn.", reply_markup=back_menu())
        return
    lines = ["📦 <b>ĐƠN HÀNG GẦN ĐÂY</b>\n"]
    for o in orders:
        emoji, _ = STATUS_MAP.get(o.get("status", ""), ("•", ""))
        lines.append(
            f"{emoji} <code>{o.get('orderCode')}</code>\n"
            f"   {o.get('serviceName')} — <b>{fmt(o.get('finalAmount', 0))}</b>"
        )
    await update.message.reply_html("\n\n".join(lines), reply_markup=back_menu())


async def cmd_naptien(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tg_id = str(update.effective_user.id)
    u = await _get_linked_user(tg_id)
    if not u:
        await update.message.reply_text("❌ Chưa liên kết. Gõ /start.")
        return
    await update.message.reply_html(
        "💳 <b>NẠP TIỀN</b>\n\n"
        "Chọn số tiền có sẵn bên dưới, hoặc nhập số khác 👇",
        reply_markup=amount_menu(),
    )
    ctx.user_data["awaiting"] = "amount"


async def cmd_vongquay(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_html(
        f"🎡 <b>VÒNG QUAY</b>\n\nMở web để quay: {WEB_URL}/vong-quay\n\n3 lượt/ngày",
        reply_markup=back_menu(),
    )


async def cmd_taikhoan(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tg_id = str(update.effective_user.id)
    u = await _get_linked_user(tg_id)
    if not u:
        await update.message.reply_text("❌ Chưa liên kết.")
        return
    text = (
        f"👤 <b>TÀI KHOẢN</b>\n\n"
        f"Username: <code>@{u.get('username')}</code>\n"
        f"Email: {u.get('email')}\n"
        f"Vai trò: <b>{u.get('role', 'user').upper()}</b>\n"
        f"Tổng đơn: {u.get('totalOrders', 0)}\n"
        f"Đã thanh toán: {u.get('paidOrders', 0)}"
    )
    await update.message.reply_html(text, reply_markup=back_menu())


# ─── CALLBACK HANDLER ───
async def cb_router(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    data = q.data
    tg_id = str(q.from_user.id)

    if data == "menu":
        u = await _get_linked_user(tg_id)
        if u and u.get("role") == "admin":
            from keyboards import admin_menu
            await q.edit_message_text("👑 <b>ADMIN PANEL</b>", parse_mode="HTML", reply_markup=admin_menu())
        else:
            await q.edit_message_text("🏠 Menu chính", reply_markup=main_menu())
        return

    if data == "help":
        await q.edit_message_text(
            "<b>📖 HƯỚNG DẪN</b>\n\n/start /sodu /donhang /naptien /vongquay /taikhoan",
            parse_mode="HTML",
            reply_markup=back_menu(),
        )
        return

    if data == "sodu":
        u = await _get_linked_user(tg_id)
        if not u:
            await q.edit_message_text("❌ Chưa liên kết.")
            return
        c2, b = await api.get_balance(u["email"])
        if c2 != 200 or not b.get("success"):
            await q.edit_message_text("❌ Lỗi.")
            return
        text = (
            f"💰 <b>SỐ DƯ</b>\n\n"
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
            await q.edit_message_text("❌ Lỗi.", reply_markup=back_menu())
            return
        orders = d.get("orders", [])[:5]
        if not orders:
            await q.edit_message_text("📭 Chưa có đơn.", reply_markup=back_menu())
            return
        lines = ["📦 <b>ĐƠN HÀNG</b>\n"]
        for o in orders:
            emoji, _ = STATUS_MAP.get(o.get("status", ""), ("•", ""))
            lines.append(
                f"{emoji} <code>{o.get('orderCode')}</code>\n   {o.get('serviceName')} — <b>{fmt(o.get('finalAmount', 0))}</b>"
            )
        await q.edit_message_text("\n\n".join(lines), parse_mode="HTML", reply_markup=back_menu())
        return

    if data == "naptien":
        await q.edit_message_text(
            "💳 <b>NẠP TIỀN</b>\n\nChọn số tiền:",
            parse_mode="HTML",
            reply_markup=amount_menu(),
        )
        return

    if data == "ls_nap":
        code, d = await api.get_recharge_history(tg_id)
        if code != 200 or not d.get("success"):
            await q.edit_message_text("❌ Lỗi.", reply_markup=back_menu())
            return
        orders = d.get("orders", [])
        if not orders:
            await q.edit_message_text("📭 Chưa có lịch sử nạp.", reply_markup=back_menu())
            return
        lines = ["📜 <b>LỊCH SỬ NẠP TIỀN</b>\n"]
        for o in orders:
            emoji, _ = STATUS_MAP.get(o.get("status", ""), ("•", ""))
            lines.append(
                f"{emoji} <code>{o.get('orderCode')}</code>\n   {fmt(o.get('finalAmount', 0))}"
            )
        await q.edit_message_text("\n\n".join(lines), parse_mode="HTML", reply_markup=back_menu())
        return

    if data == "vongquay":
        await q.edit_message_text(
            f"🎡 Mở web: {WEB_URL}/vong-quay",
            parse_mode="HTML",
            reply_markup=back_menu(),
        )
        return

    if data == "taikhoan":
        u = await _get_linked_user(tg_id)
        if not u:
            await q.edit_message_text("❌ Chưa liên kết.")
            return
        text = (
            f"👤 <b>TÀI KHOẢN</b>\n\n"
            f"Username: <code>@{u.get('username')}</code>\n"
            f"Email: {u.get('email')}\n"
            f"Vai trò: <b>{u.get('role', 'user').upper()}</b>"
        )
        await q.edit_message_text(text, parse_mode="HTML", reply_markup=back_menu())
        return

    # ── TRA CỨU ĐƠN ──
    if data == "tra_cuu":
        await q.edit_message_text(
            "🔍 <b>TRA CỨU ĐƠN</b>\n\nGõ mã đơn (VD: <code>NPTABC123</code>):",
            parse_mode="HTML",
            reply_markup=back_menu(),
        )
        ctx.user_data["awaiting"] = "tra_cuu"
        return

    # ── CHỌN SỐ TIỀN NẠP ──
    if data.startswith("amt_"):
        val = data.replace("amt_", "")
        if val == "custom":
            await q.edit_message_text(
                "✏️ Nhập số tiền muốn nạp (tối thiểu 10.000đ):\nVD: <code>50000</code>",
                parse_mode="HTML",
                reply_markup=back_menu(),
            )
            ctx.user_data["awaiting"] = "amount"
        else:
            amount = int(val)
            await _create_recharge(q, tg_id, amount)
        return

    # ── CHECK TRẠNG THÁI ĐƠN ──
    if data.startswith("check_"):
        order_code = data.replace("check_", "")
        code, d = await api.check_recharge(order_code, tg_id)
        if code != 200 or not d.get("success"):
            await q.edit_message_text(
                f"❌ {d.get('message', 'Không tìm thấy')}",
                reply_markup=check_menu(order_code),
            )
            return
        o = d["order"]
        text = (
            f"📋 <b>ĐƠN {o.get('orderCode')}</b>\n\n"
            f"💰 Số tiền: <b>{fmt(o.get('finalAmount', 0))}</b>\n"
            f"📊 Trạng thái: <b>{status_text(o.get('status', ''))}</b>\n"
        )
        if o.get("paidAt"):
            text += f"✅ Thanh toán lúc: {o.get('paidAt')[:19].replace('T', ' ')}\n"
        text += f"\n⏰ Tạo lúc: {o.get('createdAt', '')[:19].replace('T', ' ')}"
        await q.edit_message_text(text, parse_mode="HTML", reply_markup=check_menu(order_code))
        return

    # ── COPY MÃ ĐƠN ──
    if data.startswith("copy_"):
        order_code = data.replace("copy_", "")
        await q.answer(f"Mã: {order_code}", show_alert=True)
        return


async def _create_recharge(q, tg_id: str, amount: int):
    code, d = await api.create_recharge(tg_id, amount)
    if code != 200 or not d.get("success"):
        await q.edit_message_text(f"❌ {d.get('message', 'Lỗi')}", reply_markup=back_menu())
        return

    qr_url = d.get("qrUrl", "")
    order_code = d.get("orderCode", "")
    bank = d.get("bank", "")
    acc = d.get("accountNumber", "")
    name = d.get("accountName", "")

    text = (
        f"✅ <b>ĐÃ TẠO ĐƠN NẠP</b>\n\n"
        f"💰 Số tiền: <b>{fmt(amount)}</b>\n"
        f"📋 Mã đơn: <code>{order_code}</code>\n"
        f"━━━━━━━━━━━━━━━\n"
        f"🏦 Ngân hàng: <b>{bank}</b>\n"
        f"💳 Số TK: <code>{acc}</code>\n"
        f"👤 Chủ TK: {name}\n\n"
        f"⚠️ <b>Nội dung CK:</b> <code>{order_code}</code>\n\n"
        f"⏱ Đơn hết hạn sau 15 phút.\n"
        f"👇 Bấm <b>Kiểm tra TT</b> sau khi chuyển khoản."
    )
    await q.edit_message_text(
        text,
        parse_mode="HTML",
        reply_markup=qr_menu(qr_url, order_code) if qr_url else back_menu(),
    )


# ─── TEXT HANDLER ───
async def handle_text(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    mode = ctx.user_data.get("awaiting")
    text = update.message.text.strip()

    if mode == "tra_cuu":
        code, d = await api.check_recharge(text, str(update.effective_user.id))
        if code != 200 or not d.get("success"):
            await update.message.reply_html(
                f"❌ {d.get('message', 'Không tìm thấy')}",
                reply_markup=back_menu(),
            )
        else:
            o = d["order"]
            msg = (
                f"📋 <b>ĐƠN {o.get('orderCode')}</b>\n\n"
                f"💰 Số tiền: <b>{fmt(o.get('finalAmount', 0))}</b>\n"
                f"📊 Trạng thái: <b>{status_text(o.get('status', ''))}</b>"
            )
            await update.message.reply_html(msg, reply_markup=check_menu(o.get("orderCode", "")))
        ctx.user_data["awaiting"] = None
        return

    if mode == "amount":
        cleaned = text.replace(".", "").replace(",", "")
        if not cleaned.isdigit():
            await update.message.reply_text("❌ Nhập số. VD: 50000")
            return
        amount = int(cleaned)
        if amount < 10000:
            await update.message.reply_text("❌ Tối thiểu 10.000đ")
            return

        tg_id = str(update.effective_user.id)
        code, d = await api.create_recharge(tg_id, amount)
        if code != 200 or not d.get("success"):
            await update.message.reply_html(f"❌ {d.get('message', 'Lỗi')}", reply_markup=main_menu())
            ctx.user_data["awaiting"] = None
            return

        qr_url = d.get("qrUrl", "")
        order_code = d.get("orderCode", "")
        bank = d.get("bank", "")
        acc = d.get("accountNumber", "")
        name = d.get("accountName", "")
        msg = (
            f"✅ <b>ĐÃ TẠO ĐƠN NẠP</b>\n\n"
            f"💰 Số tiền: <b>{fmt(amount)}</b>\n"
            f"📋 Mã đơn: <code>{order_code}</code>\n"
            f"━━━━━━━━━━━━━━━\n"
            f"🏦 {bank} — <code>{acc}</code>\n"
            f"👤 {name}\n\n"
            f"⚠️ Nội dung CK: <code>{order_code}</code>"
        )
        await update.message.reply_html(
            msg,
            reply_markup=qr_menu(qr_url, order_code) if qr_url else main_menu(),
        )
        ctx.user_data["awaiting"] = None
        return

    await update.message.reply_text("Gõ /start để mở menu.")


async def cmd_naptien_entry(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """Alias cho /naptien"""
    await cmd_naptien(update, ctx)
