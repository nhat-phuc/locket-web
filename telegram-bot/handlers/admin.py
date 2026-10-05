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


async def cmd_admin(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not is_admin(update.effective_user.id):
        await update.message.reply_text("❌ Bạn không phải admin.")
        return
    await update.message.reply_html(
        "�� <b>ADMIN PANEL</b>\n\nChọn chức năng:",
        reply_markup=admin_menu(),
    )


async def cb_admin_router(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    if not is_admin(q.from_user.id):
        await q.answer("❌ Không có quyền", show_alert=True)
        return
    await q.answer()
    data = q.data

    if data == "adm_stats":
        code, d = await api.admin_stats()
        if code != 200 or not d.get("success"):
            await q.edit_message_text("❌ Lỗi lấy thống kê.", reply_markup=back_menu())
            return
        s = d.get("stats") or d
        text = (
            f"📊 <b>THỐNG KÊ</b>\n\n"
            f"👥 Users: <b>{s.get('totalUsers', 0)}</b>\n"
            f"📦 Đơn hàng: <b>{s.get('totalOrders', 0)}</b>\n"
            f"💰 Doanh thu: <b>{fmt(s.get('totalRevenue', 0))}</b>\n"
            f"⏳ Chờ xử lý: <b>{s.get('pendingOrders', 0)}</b>"
        )
        await q.edit_message_text(text, parse_mode="HTML", reply_markup=back_menu())
        return

    if data == "adm_users":
        code, d = await api.admin_users()
        if code != 200 or not d.get("success"):
            await q.edit_message_text("❌ Lỗi.", reply_markup=back_menu())
            return
        users = d.get("users", [])[:10]
        lines = ["👥 <b>USERS GẦN ĐÂY</b>\n"]
        for u in users:
            lines.append(
                f"@{u.get('username')} — {fmt(u.get('balance', 0))} + 🎁{fmt(u.get('bonusBalance', 0))}"
            )
        await q.edit_message_text("\n".join(lines), parse_mode="HTML", reply_markup=back_menu())
        return

    if data == "adm_wheel":
        code, d = await api.admin_lucky_wheel()
        if code != 200 or not d.get("success"):
            await q.edit_message_text("❌ Lỗi.", reply_markup=back_menu())
            return
        s = d.get("stats", {})
        text = (
            f"🎡 <b>VÒNG QUAY</b>\n\n"
            f"Tổng lượt: <b>{s.get('totalSpins', 0)}</b>\n"
            f"Hôm nay: <b>{s.get('todaySpins', 0)}</b>\n"
            f"Tiền đã trả: <b>{fmt(s.get('totalPaid', 0))}</b>"
        )
        await q.edit_message_text(text, parse_mode="HTML", reply_markup=back_menu())
        return

    if data == "adm_orders":
        code, d = await api.admin_orders()
        if code != 200:
            await q.edit_message_text("❌ Lỗi.", reply_markup=back_menu())
            return
        orders = (d.get("orders") or d.get("items") or [])[:10]
        if not orders:
            await q.edit_message_text("📭 Không có đơn.", reply_markup=back_menu())
            return
        lines = ["📦 <b>ĐƠN HÀNG</b>\n"]
        for o in orders:
            lines.append(
                f"<code>{o.get('orderCode')}</code> — {o.get('status')} — {fmt(o.get('finalAmount', 0))}"
            )
        await q.edit_message_text("\n".join(lines), parse_mode="HTML", reply_markup=back_menu())
        return

    if data == "adm_withdrawals":
        code, d = await api.admin_withdrawals()
        if code != 200:
            await q.edit_message_text("❌ Lỗi.", reply_markup=back_menu())
            return
        ws = (d.get("withdrawals") or d.get("items") or [])[:10]
        if not ws:
            await q.edit_message_text("📭 Không có yêu cầu rút.", reply_markup=back_menu())
            return
        lines = ["💸 <b>RÚT TIỀN</b>\n"]
        for w in ws:
            lines.append(
                f"<code>{w.get('id', '')[:8]}</code> — {w.get('status')} — {fmt(w.get('amount', 0))}"
            )
        await q.edit_message_text("\n".join(lines), parse_mode="HTML", reply_markup=back_menu())
        return
