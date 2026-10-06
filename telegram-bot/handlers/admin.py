from telegram import Update
from telegram.ext import ContextTypes
import api_client as api
from config import ADMIN_IDS
from keyboards import admin_menu, back_menu
import html


def fmt(n: int) -> str:
    return f"{n:,}".replace(",", ".") + "đ"


def is_admin(user_id: int) -> bool:
    return user_id in ADMIN_IDS


STATUS_MAP = {
    "pending": "⏳", "paid": "✅", "completed": "🎉",
    "cancelled": "❌", "expired": "⏰", "processing": "⚙️",
    "approved": "✅", "rejected": "❌",
}


async def cmd_admin(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not is_admin(update.effective_user.id):
        await update.message.reply_text("❌ Bạn không phải admin.")
        return
    await update.message.reply_html(
        "👑 <b>ADMIN PANEL</b>\n\nChọn chức năng:",
        reply_markup=admin_menu(),
    )


async def cb_admin_router(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    if not is_admin(q.from_user.id):
        await q.answer("❌ Không có quyền", show_alert=True)
        return
    await q.answer()
    data = q.data
    tg_id = str(q.from_user.id)

    # ── THỐNG KÊ ──
    if data == "adm_stats":
        code, d = await api.admin_get("stats", tg_id)
        if code != 200 or not d.get("success"):
            await q.edit_message_text("❌ Lỗi.", reply_markup=back_menu())
            return
        s = d["stats"]
        text = (
            f"📊 <b>THỐNG KÊ</b>\n\n"
            f"👥 Users: <b>{s.get('totalUsers', 0)}</b>\n"
            f"📦 Tổng đơn: <b>{s.get('totalOrders', 0)}</b>\n"
            f"✅ Đã thanh toán: <b>{s.get('paidOrders', 0)}</b>\n"
            f"⏳ Chờ xử lý: <b>{s.get('pendingOrders', 0)}</b>\n"
            f"━━━━━━━━━━━━━━━\n"
            f"💰 Doanh thu: <b>{fmt(s.get('totalRevenue', 0))}</b>\n"
            f"📅 Hôm nay: <b>{fmt(s.get('todayRevenue', 0))}</b>"
        )
        await q.edit_message_text(text, parse_mode="HTML", reply_markup=back_menu())
        return

    # ── DANH SÁCH USERS ──
    if data == "adm_users":
        code, d = await api.admin_get("users", tg_id)
        if code != 200 or not d.get("success"):
            await q.edit_message_text("❌ Lỗi.", reply_markup=back_menu())
            return
        users = d.get("users", [])[:15]
        if not users:
            await q.edit_message_text("📭 Không có user.", reply_markup=back_menu())
            return
        lines = [f"👥 <b>USERS ({len(users)})</b>\n"]
        for u in users:
            ban = "🚫" if u.get("isBanned") else ""
            role = "👑" if u.get("role") == "admin" else ""
            lines.append(
                f"{ban}{role} <code>@{u.get('username')}</code>\n"
                f"   💰 {fmt(u.get('balance', 0))} + �� {fmt(u.get('bonusBalance', 0))}"
            )
        await q.edit_message_text("\n\n".join(lines), parse_mode="HTML", reply_markup=back_menu())
        return

    # ── ĐƠN HÀNG ──
    if data == "adm_orders":
        code, d = await api.admin_get("orders", tg_id)
        if code != 200 or not d.get("success"):
            await q.edit_message_text("❌ Lỗi.", reply_markup=back_menu())
            return
        orders = d.get("orders", [])[:10]
        if not orders:
            await q.edit_message_text("📭 Không có đơn.", reply_markup=back_menu())
            return
        lines = [f"📦 <b>ĐƠN HÀNG ({len(orders)})</b>\n"]
        for o in orders:
            emoji = STATUS_MAP.get(o.get("status"), "•")
            user = o.get("user", {}).get("username", "?")
            lines.append(
                f"{emoji} <code>{o.get('orderCode')}</code>\n"
                f"   @{user} — <b>{fmt(o.get('finalAmount', 0))}</b>"
            )
        await q.edit_message_text("\n\n".join(lines), parse_mode="HTML", reply_markup=back_menu())
        return

    # ── RÚT TIỀN ──
    if data == "adm_withdrawals":
        code, d = await api.admin_get("withdrawals", tg_id)
        if code != 200 or not d.get("success"):
            await q.edit_message_text("❌ Lỗi.", reply_markup=back_menu())
            return
        ws = d.get("withdrawals", [])[:10]
        if not ws:
            await q.edit_message_text("📭 Không có yêu cầu.", reply_markup=back_menu())
            return
        lines = [f"💸 <b>RÚT TIỀN ({len(ws)})</b>\n"]
        for w in ws:
            emoji = STATUS_MAP.get(w.get("status"), "•")
            user = w.get("user", {}).get("username", "?")
            lines.append(
                f"{emoji} @{user} — <b>{fmt(w.get('amount', 0))}</b>\n"
                f"   🏦 {w.get('bankName', '?')} — {w.get('bankAccount', '?')}"
            )
        await q.edit_message_text("\n\n".join(lines), parse_mode="HTML", reply_markup=back_menu())
        return

    # ── VÒNG QUAY ──
    if data == "adm_wheel":
        code, d = await api.admin_get("wheel", tg_id)
        if code != 200 or not d.get("success"):
            await q.edit_message_text("❌ Lỗi.", reply_markup=back_menu())
            return
        s = d["stats"]
        text = (
            f"🎡 <b>VÒNG QUAY</b>\n\n"
            f"🎯 Tổng lượt: <b>{s.get('totalSpins', 0)}</b>\n"
            f"📅 Hôm nay: <b>{s.get('todaySpins', 0)}</b>\n"
            f"💰 Đã trả: <b>{fmt(s.get('totalPaid', 0))}</b>\n"
            f"👥 Người chơi: <b>{s.get('totalPlayers', 0)}</b>"
        )
        await q.edit_message_text(text, parse_mode="HTML", reply_markup=back_menu())
        return

    # ── CỘNG TIỀN ──
    if data == "adm_add_balance":
        await q.edit_message_text(
            "💰 <b>CỘNG TIỀN</b>\n\n"
            "Gõ theo cú pháp:\n"
            "<code>username số_tiền</code>\n\n"
            "VD: <code>trannhatphuc 50000</code>",
            parse_mode="HTML",
            reply_markup=back_menu(),
        )
        ctx.user_data["awaiting"] = "add_balance"
        return

    # ── TÌM USER ──
    if data == "adm_search":
        await q.edit_message_text(
            "🔍 <b>TÌM USER</b>\n\nGõ username hoặc email:",
            parse_mode="HTML",
            reply_markup=back_menu(),
        )
        ctx.user_data["awaiting"] = "search_user"
        return

    # ── RESET LƯỢT QUAY ──
    if data == "adm_reset_spins":
        await q.edit_message_text(
            "🔄 <b>RESET LƯỢT QUAY</b>\n\nGõ username:",
            parse_mode="HTML",
            reply_markup=back_menu(),
        )
        ctx.user_data["awaiting"] = "reset_spins"
        return


async def handle_admin_text(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """Xử lý text input từ admin"""
    if not is_admin(update.effective_user.id):
        return False

    mode = ctx.user_data.get("awaiting")
    tg_id = str(update.effective_user.id)
    text = update.message.text.strip()

    # ── CỘNG TIỀN ──
    if mode == "add_balance":
        parts = text.split()
        if len(parts) < 2:
            await update.message.reply_text("❌ Cú pháp: username số_tiền")
            return True
        username = parts[0].lstrip("@")
        try:
            amount = int(parts[1].replace(".", "").replace(",", ""))
        except:
            await update.message.reply_text("❌ Số tiền không hợp lệ")
            return True

        code, d = await api.admin_post("add-balance", tg_id, {
            "targetUsername": username,
            "amount": amount,
            "reason": "Admin cộng qua bot",
        })
        if code == 200 and d.get("success"):
            await update.message.reply_html(f"✅ {d.get('message')}", reply_markup=admin_menu())
        else:
            await update.message.reply_text(f"❌ {d.get('message', 'Lỗi')}", reply_markup=admin_menu())
        ctx.user_data["awaiting"] = None
        return True

    # ── TÌM USER ──
    if mode == "search_user":
        code, d = await api.admin_get("users", tg_id, {"search": text})
        if code != 200 or not d.get("success"):
            await update.message.reply_text("❌ Lỗi.", reply_markup=admin_menu())
            ctx.user_data["awaiting"] = None
            return True
        users = d.get("users", [])[:10]
        if not users:
            await update.message.reply_text("📭 Không tìm thấy.", reply_markup=admin_menu())
            ctx.user_data["awaiting"] = None
            return True
        lines = [f"🔍 <b>KẾT QUẢ ({len(users)})</b>\n"]
        for u in users:
            ban = "🚫 " if u.get("isBanned") else ""
            lines.append(
                f"{ban}<code>@{u.get('username')}</code> — {u.get('email')}\n"
                f"   💰 {fmt(u.get('balance', 0))} + 🎁 {fmt(u.get('bonusBalance', 0))}"
            )
        await update.message.reply_html("\n\n".join(lines), reply_markup=admin_menu())
        ctx.user_data["awaiting"] = None
        return True

    # ── RESET LƯỢT QUAY ──
    if mode == "reset_spins":
        username = text.lstrip("@")
        # Lấy userId từ username
        code, d = await api.admin_get("users", tg_id, {"search": username})
        if code != 200 or not d.get("success"):
            await update.message.reply_text("❌ Lỗi.", reply_markup=admin_menu())
            ctx.user_data["awaiting"] = None
            return True
        users = d.get("users", [])
        target = next((u for u in users if u.get("username") == username), None)
        if not target:
            await update.message.reply_text(f"❌ Không tìm thấy @{username}", reply_markup=admin_menu())
            ctx.user_data["awaiting"] = None
            return True

        code2, d2 = await api.admin_post("reset-spins", tg_id, {"userId": target["id"]})
        if code2 == 200 and d2.get("success"):
            await update.message.reply_html(f"✅ {d2.get('message')}", reply_markup=admin_menu())
        else:
            await update.message.reply_text(f"❌ {d2.get('message', 'Lỗi')}", reply_markup=admin_menu())
        ctx.user_data["awaiting"] = None
        return True

    return False
