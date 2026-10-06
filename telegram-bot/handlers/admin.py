from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import ContextTypes
import api_client as api
from config import ADMIN_IDS
from keyboards import admin_menu, back_menu


def fmt(n: int) -> str:
    return f"{n:,}".replace(",", ".") + "đ"


def is_admin(user_id: int) -> bool:
    return user_id in ADMIN_IDS


STATUS_MAP = {"pending": "⏳", "paid": "✅", "completed": "🎉", "cancelled": "❌", "expired": "⏰", "approved": "✅", "rejected": "❌"}


async def cmd_admin(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not is_admin(update.effective_user.id):
        await update.message.reply_text("❌ Bạn không phải admin.")
        return
    await update.message.reply_html("👑 <b>ADMIN PANEL</b>", reply_markup=admin_menu())


async def cb_admin_router(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    if not is_admin(q.from_user.id):
        await q.answer("❌ Không có quyền", show_alert=True)
        return
    await q.answer()
    data = q.data
    tg_id = str(q.from_user.id)

    if data == "adm_stats":
        code, d = await api.admin_get("stats", tg_id)
        if code != 200 or not d.get("success"):
            await q.edit_message_text("❌ Lỗi.", reply_markup=back_menu())
            return
        s = d["stats"]
        text = f"📊 <b>THỐNG KÊ</b>\n\n👥 {s.get('totalUsers', 0)}\n📦 {s.get('totalOrders', 0)}\n✅ {s.get('paidOrders', 0)}\n⏳ {s.get('pendingOrders', 0)}\n�� {fmt(s.get('totalRevenue', 0))}\n📅 Hôm nay: {fmt(s.get('todayRevenue', 0))}"
        await q.edit_message_text(text, parse_mode="HTML", reply_markup=back_menu())
        return

    if data == "adm_revenue":
        code, d = await api.admin_get("revenue", tg_id)
        if code != 200 or not d.get("success"):
            await q.edit_message_text("❌ Lỗi.", reply_markup=back_menu())
            return
        lines = ["📈 <b>DOANH THU 7 NGÀY</b>\n"]
        for day in d.get("days", []):
            lines.append(f"📅 {day['date']}: <b>{fmt(day['amount'])}</b>")
        await q.edit_message_text("\n".join(lines), parse_mode="HTML", reply_markup=back_menu())
        return

    if data == "adm_users":
        code, d = await api.admin_get("users", tg_id)
        if code != 200 or not d.get("success"):
            await q.edit_message_text("❌ Lỗi.", reply_markup=back_menu())
            return
        users = d.get("users", [])[:15]
        lines = [f"👥 <b>USERS ({len(users)})</b>\n"]
        for u in users:
            ban = "🚫" if u.get("isBanned") else ""
            role = "👑" if u.get("role") == "admin" else ""
            lines.append(f"{ban}{role} <code>@{u.get('username')}</code>\n   💰 {fmt(u.get('balance', 0))} + 🎁 {fmt(u.get('bonusBalance', 0))}")
        await q.edit_message_text("\n\n".join(lines), parse_mode="HTML", reply_markup=back_menu())
        return

    if data == "adm_orders":
        code, d = await api.admin_get("orders", tg_id)
        orders = d.get("orders", [])[:10] if code == 200 else []
        lines = [f"📦 <b>ĐƠN HÀNG ({len(orders)})</b>\n"]
        for o in orders:
            emoji = STATUS_MAP.get(o.get("status"), "•")
            user = o.get("user", {}).get("username", "?")
            lines.append(f"{emoji} <code>{o.get('orderCode')}</code>\n   @{user} — {fmt(o.get('finalAmount', 0))}")
        await q.edit_message_text("\n\n".join(lines), parse_mode="HTML", reply_markup=back_menu())
        return

    if data == "adm_pending":
        code, d = await api.admin_get("pending-orders", tg_id)
        orders = d.get("orders", []) if code == 200 else []
        if not orders:
            await q.edit_message_text("🎉 Không có đơn chờ!", reply_markup=back_menu())
            return
        lines = [f"⏳ <b>ĐƠN CHỜ ({len(orders)})</b>\n"]
        for o in orders:
            user = o.get("user", {}).get("username", "?")
            lines.append(f"<code>{o.get('orderCode')}</code>\n   @{user} — {fmt(o.get('finalAmount', 0))}")
        await q.edit_message_text("\n\n".join(lines), parse_mode="HTML", reply_markup=back_menu())
        return

    if data == "adm_withdrawals":
        code, d = await api.admin_get("withdrawals", tg_id)
        ws = d.get("withdrawals", [])[:10] if code == 200 else []
        lines = [f"�� <b>RÚT TIỀN ({len(ws)})</b>\n"]
        for w in ws:
            emoji = STATUS_MAP.get(w.get("status"), "•")
            user = w.get("user", {}).get("username", "?")
            lines.append(f"{emoji} @{user} — {fmt(w.get('amount', 0))}\n   🏦 {w.get('bankName')} — {w.get('bankAccount')}")
        await q.edit_message_text("\n\n".join(lines), parse_mode="HTML", reply_markup=back_menu())
        return

    if data == "adm_wheel":
        code, d = await api.admin_get("wheel", tg_id)
        if code != 200 or not d.get("success"):
            await q.edit_message_text("❌ Lỗi.", reply_markup=back_menu())
            return
        s = d["stats"]
        text = f"🎡 <b>VÒNG QUAY</b>\n\n🎯 {s.get('totalSpins', 0)}\n📅 {s.get('todaySpins', 0)}\n💰 {fmt(s.get('totalPaid', 0))}\n👥 {s.get('totalPlayers', 0)}"
        await q.edit_message_text(text, parse_mode="HTML", reply_markup=back_menu())
        return

    if data == "adm_logs":
        code, d = await api.admin_get("logs", tg_id)
        logs = d.get("logs", [])[:15] if code == 200 else []
        lines = ["📋 <b>LOGS</b>\n"]
        for l in logs:
            user = l.get("user", {}).get("username") if l.get("user") else "sys"
            time = l.get("createdAt", "")[:16].replace("T", " ")
            lines.append(f"• <code>{l.get('action')}</code>\n  @{user} — {time}")
        await q.edit_message_text("\n\n".join(lines), parse_mode="HTML", reply_markup=back_menu())
        return

    if data == "adm_add_balance":
        await q.edit_message_text("💰 Gõ: <code>username số_tiền</code>", parse_mode="HTML", reply_markup=back_menu())
        ctx.user_data["awaiting"] = "add_balance"
        return

    if data == "adm_search":
        await q.edit_message_text("🔍 Gõ username/email:", reply_markup=back_menu())
        ctx.user_data["awaiting"] = "search_user"
        return

    if data == "adm_reset_spins":
        await q.edit_message_text("🔄 Gõ username:", reply_markup=back_menu())
        ctx.user_data["awaiting"] = "reset_spins"
        return

    if data == "adm_broadcast":
        await q.edit_message_text("📢 Gõ nội dung thông báo:", reply_markup=back_menu())
        ctx.user_data["awaiting"] = "broadcast"
        return

    if data == "adm_maintenance":
        code, d = await api.admin_get("maintenance", tg_id)
        enabled = d.get("enabled", False)
        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("🔄 Đổi trạng thái", callback_data="adm_toggle_maintenance")],
            [InlineKeyboardButton("🏠 Menu", callback_data="menu")],
        ])
        await q.edit_message_text(f"🔧 Bảo trì: <b>{'🔴 BẬT' if enabled else '🟢 TẮT'}</b>", parse_mode="HTML", reply_markup=kb)
        return

    if data == "adm_toggle_maintenance":
        code, d = await api.admin_post("toggle-maintenance", tg_id, {})
        await q.answer(d.get("message", "OK"), show_alert=True)
        return


async def handle_admin_text(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> bool:
    if not is_admin(update.effective_user.id):
        return False
    mode = ctx.user_data.get("awaiting")
    tg_id = str(update.effective_user.id)
    text = update.message.text.strip()

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
        code, d = await api.admin_post("add-balance", tg_id, {"targetUsername": username, "amount": amount, "reason": "Admin qua bot"})
        await update.message.reply_html(f"{'✅' if d.get('success') else '❌'} {d.get('message')}", reply_markup=admin_menu())
        ctx.user_data["awaiting"] = None
        return True

    if mode == "search_user":
        code, d = await api.admin_get("users", tg_id, {"search": text})
        users = d.get("users", [])[:10] if code == 200 else []
        if not users:
            await update.message.reply_text("📭 Không tìm thấy.", reply_markup=admin_menu())
        else:
            lines = [f"🔍 <b>KẾT QUẢ ({len(users)})</b>\n"]
            for u in users:
                lines.append(f"<code>@{u.get('username')}</code> — {u.get('email')}\n   💰 {fmt(u.get('balance', 0))}")
            await update.message.reply_html("\n\n".join(lines), reply_markup=admin_menu())
        ctx.user_data["awaiting"] = None
        return True

    if mode == "reset_spins":
        username = text.lstrip("@")
        code, d = await api.admin_get("users", tg_id, {"search": username})
        users = d.get("users", []) if code == 200 else []
        target = next((u for u in users if u.get("username") == username), None)
        if not target:
            await update.message.reply_text(f"❌ Không tìm thấy @{username}", reply_markup=admin_menu())
        else:
            code2, d2 = await api.admin_post("reset-spins", tg_id, {"userId": target["id"]})
            await update.message.reply_html(f"{'✅' if d2.get('success') else '❌'} {d2.get('message')}", reply_markup=admin_menu())
        ctx.user_data["awaiting"] = None
        return True

    if mode == "broadcast":
        code, d = await api.admin_post("broadcast", tg_id, {"message": text})
        await update.message.reply_html(f"{'✅' if d.get('success') else '❌'} {d.get('message')}", reply_markup=admin_menu())
        ctx.user_data["awaiting"] = None
        return True

    return False
