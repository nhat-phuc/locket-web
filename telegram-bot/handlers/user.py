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


async def _get_user(tg_id: str):
    code, d = await api.get_user_by_telegram(tg_id)
    if code == 200 and d.get("success") and d.get("user"):
        return d["user"]
    return None


# ═══════════ /start ═══════════
async def cmd_start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tg_id = str(update.effective_user.id)
    first_name = update.effective_user.first_name or "bạn"

    u = await _get_user(tg_id)
    if u:
        name = html.escape(u.get("name") or u.get("username") or first_name)
        if u.get("role") == "admin":
            text = f"👑 Chào <b>ADMIN {name}</b>!\n\n🎯 Chọn chức năng quản trị 👇"
            from keyboards import admin_menu
            await update.message.reply_html(text, reply_markup=admin_menu())
        else:
            text = f"👋 Chào <b>{name}</b>!\n\n🎯 Chọn chức năng bên dưới 👇"
            await update.message.reply_html(text, reply_markup=main_menu())
        return

    args = ctx.args
    user_id = args[0] if args else None
    if user_id:
        import httpx
        from config import API_URL
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                r = await client.post(
                    f"{API_URL}/api/telegram/link-by-userid",
                    json={"userId": user_id, "telegramId": tg_id},
                    headers={"x-internal-key": "locket-internal-secret-2026", "Content-Type": "application/json"},
                )
                d = r.json()
            if d.get("success"):
                u = d.get("user", {})
                name = html.escape(u.get("name") or u.get("username") or first_name)
                text = (
                    f"✅ <b>LIÊN KẾT THÀNH CÔNG!</b>\n\n"
                    f"👤 Xin chào <b>{name}</b>\n"
                    f"📧 {u.get('email', '—')}\n"
                    f"💰 <b>{(u.get('balance') or 0):,}đ</b>\n"
                    f"🎁 Ví quay: <b>{(u.get('bonusBalance') or 0):,}đ</b>"
                )
                if u.get("role") == "admin":
                    from keyboards import admin_menu
                    await update.message.reply_html(text, reply_markup=admin_menu())
                else:
                    await update.message.reply_html(text, reply_markup=main_menu())
                return
        except Exception as e:
            print(f"[START] link error: {e}")

    await update.message.reply_html(
        f"👋 Chào <b>{html.escape(first_name)}</b>!\n\n"
        f"🔗 Bạn cần <b>liên kết tài khoản</b> trước.\n\n"
        f"1. Đăng nhập web Locket Gold\n"
        f"2. Vào <b>Tài khoản → Cài đặt</b>\n"
        f"3. Nhấn nút <b>🔗 Liên kết Telegram</b>"
    )


# ═══════════ /help ═══════════
async def cmd_help(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    text = (
        "<b>📖 HƯỚNG DẪN</b>\n\n"
        "/start — Menu chính\n/sodu — Số dư\n/donhang — Đơn hàng\n"
        "/naptien — Nạp tiền\n/vongquay — Vòng quay\n/taikhoan — Tài khoản\n/help — Trợ giúp"
    )
    await update.message.reply_html(text, reply_markup=main_menu())


# ═══════════ /sodu ═══════════
async def cmd_sodu(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tg_id = str(update.effective_user.id)
    u = await _get_user(tg_id)
    if not u:
        await update.message.reply_text("❌ Chưa liên kết. Gõ /start.")
        return
    c2, b = await api.get_balance(u["email"])
    if c2 != 200 or not b.get("success"):
        await update.message.reply_text("❌ Lỗi.")
        return
    text = (
        f"💰 <b>SỐ DƯ</b>\n\n"
        f"👛 Ví chính: <b>{fmt(b.get('balance', 0))}</b>\n"
        f"🎁 Ví vòng quay: <b>{fmt(b.get('bonusBalance', 0))}</b>\n"
        f"━━━━━━━━━━━━━━━\n"
        f"💎 Tổng: <b>{fmt(b.get('total', 0))}</b>"
    )
    await update.message.reply_html(text, reply_markup=back_menu())


# ═══════════ /donhang ═══════════
async def cmd_donhang(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tg_id = str(update.effective_user.id)
    u = await _get_user(tg_id)
    if not u:
        await update.message.reply_text("❌ Chưa liên kết.")
        return
    code, d = await api.get_orders(tg_id)
    if code != 200 or not d.get("success"):
        await update.message.reply_text("❌ Lỗi.")
        return
    orders = d.get("orders", [])[:5]
    if not orders:
        await update.message.reply_html("📭 Chưa có đơn.", reply_markup=back_menu())
        return
    lines = ["�� <b>ĐƠN HÀNG GẦN ĐÂY</b>\n"]
    for o in orders:
        emoji, _ = STATUS_MAP.get(o.get("status", ""), ("•", ""))
        lines.append(f"{emoji} <code>{o.get('orderCode')}</code>\n   {o.get('serviceName')} — <b>{fmt(o.get('finalAmount', 0))}</b>")
    await update.message.reply_html("\n\n".join(lines), reply_markup=back_menu())


# ═══════════ /naptien ═══════════
async def cmd_naptien(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tg_id = str(update.effective_user.id)
    u = await _get_user(tg_id)
    if not u:
        await update.message.reply_text("❌ Chưa liên kết.")
        return
    await update.message.reply_html("💳 <b>NẠP TIỀN</b>\n\nChọn số tiền:", reply_markup=amount_menu())
    ctx.user_data["awaiting"] = "amount"


# ═══════════ /vongquay ═══════════
async def cmd_vongquay(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_html(f"🎡 Mở web: {WEB_URL}/vong-quay\n\n3 lượt/ngày", reply_markup=back_menu())


# ═══════════ /taikhoan ═══════════
async def cmd_taikhoan(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tg_id = str(update.effective_user.id)
    u = await _get_user(tg_id)
    if not u:
        await update.message.reply_text("❌ Chưa liên kết.")
        return
    text = (
        f"👤 <b>TÀI KHOẢN</b>\n\n"
        f"Username: <code>@{u.get('username')}</code>\n"
        f"Email: {u.get('email')}\n"
        f"Vai trò: <b>{u.get('role', 'user').upper()}</b>\n"
        f"Tổng đơn: {u.get('totalOrders', 0)}\nĐã TT: {u.get('paidOrders', 0)}"
    )
    await update.message.reply_html(text, reply_markup=back_menu())


# ═══════════ CALLBACK ROUTER ═══════════
async def cb_router(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    data = q.data
    tg_id = str(q.from_user.id)

    if data == "menu":
        u = await _get_user(tg_id)
        if u and u.get("role") == "admin":
            from keyboards import admin_menu
            await q.edit_message_text("👑 <b>ADMIN PANEL</b>", parse_mode="HTML", reply_markup=admin_menu())
        else:
            await q.edit_message_text("🏠 Menu chính", reply_markup=main_menu())
        return

    if data == "help":
        await q.edit_message_text("<b>📖 HƯỚNG DẪN</b>\n/start /sodu /donhang /naptien /vongquay /taikhoan", parse_mode="HTML", reply_markup=back_menu())
        return

    if data == "sodu":
        u = await _get_user(tg_id)
        if not u:
            await q.edit_message_text("❌ Chưa liên kết.")
            return
        c2, b = await api.get_balance(u["email"])
        if c2 != 200 or not b.get("success"):
            await q.edit_message_text("❌ Lỗi.")
            return
        text = f"💰 <b>SỐ DƯ</b>\n\n👛 {fmt(b.get('balance', 0))}\n🎁 {fmt(b.get('bonusBalance', 0))}\n💎 {fmt(b.get('total', 0))}"
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
            lines.append(f"{emoji} <code>{o.get('orderCode')}</code> — {fmt(o.get('finalAmount', 0))}")
        await q.edit_message_text("\n".join(lines), parse_mode="HTML", reply_markup=back_menu())
        return

    if data == "naptien":
        await q.edit_message_text("💳 <b>NẠP TIỀN</b>", parse_mode="HTML", reply_markup=amount_menu())
        return

    if data == "ls_nap":
        code, d = await api.get_recharge_history(tg_id)
        orders = d.get("orders", []) if code == 200 else []
        if not orders:
            await q.edit_message_text("📭 Chưa có lịch sử nạp.", reply_markup=back_menu())
            return
        lines = ["📜 <b>LỊCH SỬ NẠP</b>\n"]
        for o in orders:
            emoji, _ = STATUS_MAP.get(o.get("status", ""), ("•", ""))
            lines.append(f"{emoji} <code>{o.get('orderCode')}</code> — {fmt(o.get('finalAmount', 0))}")
        await q.edit_message_text("\n".join(lines), parse_mode="HTML", reply_markup=back_menu())
        return

    if data == "vongquay":
        await q.edit_message_text(f"🎡 {WEB_URL}/vong-quay", reply_markup=back_menu())
        return

    if data == "taikhoan":
        u = await _get_user(tg_id)
        if not u:
            await q.edit_message_text("❌ Chưa liên kết.")
            return
        text = f"👤 <b>TÀI KHOẢN</b>\n\n<code>@{u.get('username')}</code>\n{u.get('email')}\n{u.get('role', 'user').upper()}"
        await q.edit_message_text(text, parse_mode="HTML", reply_markup=back_menu())
        return

    if data == "tra_cuu":
        await q.edit_message_text("🔍 Gõ mã đơn:", reply_markup=back_menu())
        ctx.user_data["awaiting"] = "tra_cuu"
        return

    if data.startswith("amt_"):
        val = data.replace("amt_", "")
        if val == "custom":
            await q.edit_message_text("✏️ Nhập số tiền (tối thiểu 10k):", reply_markup=back_menu())
            ctx.user_data["awaiting"] = "amount"
        else:
            await _create_recharge(q, tg_id, int(val))
        return

    if data.startswith("check_"):
        oc = data.replace("check_", "")
        code, d = await api.check_recharge(oc, tg_id)
        if code != 200 or not d.get("success"):
            await q.edit_message_text(f"❌ {d.get('message', 'Không thấy')}", reply_markup=check_menu(oc))
            return
        o = d["order"]
        await q.edit_message_text(f"📋 <b>{o.get('orderCode')}</b>\n💰 {fmt(o.get('finalAmount', 0))}\n📊 {o.get('status')}", parse_mode="HTML", reply_markup=check_menu(oc))
        return

    if data.startswith("copy_"):
        await q.answer(data.replace("copy_", ""), show_alert=True)
        return


async def _create_recharge(q, tg_id: str, amount: int):
    code, d = await api.create_recharge(tg_id, amount)
    if code != 200 or not d.get("success"):
        await q.edit_message_text(f"❌ {d.get('message', 'Lỗi')}", reply_markup=back_menu())
        return
    qr_url = d.get("qrUrl", "")
    oc = d.get("orderCode", "")
    text = f"✅ <b>ĐÃ TẠO ĐƠN</b>\n\n💰 {fmt(amount)}\n📋 <code>{oc}</code>\n🏦 {d.get('bank')} — {d.get('accountNumber')}\n⚠️ Nội dung CK: <code>{oc}</code>"
    await q.edit_message_text(text, parse_mode="HTML", reply_markup=qr_menu(qr_url, oc) if qr_url else back_menu())


# ═══════════ TEXT HANDLER ═══════════
async def handle_text(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    mode = ctx.user_data.get("awaiting")
    text = update.message.text.strip()
    tg_id = str(update.effective_user.id)

    if mode == "tra_cuu":
        code, d = await api.check_recharge(text, tg_id)
        if code != 200 or not d.get("success"):
            await update.message.reply_html(f"❌ {d.get('message')}", reply_markup=back_menu())
        else:
            o = d["order"]
            await update.message.reply_html(f"📋 <b>{o.get('orderCode')}</b>\n💰 {fmt(o.get('finalAmount', 0))}\n📊 {o.get('status')}", reply_markup=check_menu(o.get("orderCode", "")))
        ctx.user_data["awaiting"] = None
        return

    if mode == "amount":
        cleaned = text.replace(".", "").replace(",", "")
        if not cleaned.isdigit():
            await update.message.reply_text("❌ Nhập số. VD: 50000")
            return
        amt = int(cleaned)
        if amt < 10000:
            await update.message.reply_text("❌ Tối thiểu 10k")
            return
        code, d = await api.create_recharge(tg_id, amt)
        if code != 200 or not d.get("success"):
            await update.message.reply_html(f"❌ {d.get('message')}", reply_markup=main_menu())
            ctx.user_data["awaiting"] = None
            return
        qr_url = d.get("qrUrl", "")
        oc = d.get("orderCode", "")
        msg = f"✅ <b>ĐÃ TẠO ĐƠN</b>\n\n💰 {fmt(amt)}\n📋 <code>{oc}</code>\n🏦 {d.get('bank')} — {d.get('accountNumber')}"
        await update.message.reply_html(msg, reply_markup=qr_menu(qr_url, oc) if qr_url else main_menu())
        ctx.user_data["awaiting"] = None
        return

    await update.message.reply_text("Gõ /start để mở menu.")
