#!/usr/bin/env python3
"""Locket Gold Bot - Deep Link"""

import os, sys, logging, requests
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, BotCommand
from telegram.ext import (Application, CommandHandler, MessageHandler,
    CallbackQueryHandler, ContextTypes, filters)

BOT_TOKEN = os.environ.get("BOT_TOKEN", "")
API_URL = os.environ.get("API_URL", "https://locket-web-eight.vercel.app")
ADMIN_IDS = [int(x.strip()) for x in os.environ.get("ADMIN_IDS", "0").split(",") if x.strip().isdigit()]

logging.basicConfig(format="%(asctime)s - %(levelname)s - %(message)s", level=logging.INFO)

def is_admin(uid): return uid in ADMIN_IDS
def api_get(p):
    try: return requests.get(f"{API_URL}{p}", timeout=10).json()
    except: return {}
def api_post(p, d):
    try: return requests.post(f"{API_URL}{p}", json=d, timeout=10).json()
    except: return {}
def money(n):
    try: return f"{int(n):,}đ".replace(",", ".")
    except: return f"{n}đ"


# ═══ /start [token] ═══
async def start(update, ctx):
    u = update.effective_user
    chat_id = update.effective_chat.id

    # Nếu có token → liên kết ngay
    if ctx.args:
        token = ctx.args[0]
        r = api_post("/api/telegram/link", {"token": token, "chatId": str(chat_id)})
        if r.get("success"):
            user = r.get("user", {})
            await update.message.reply_text(
                f"✅ <b>LIÊN KẾT THÀNH CÔNG!</b>\n\n"
                f"👤 {user.get('name') or user.get('username')}\n"
                f"💰 Số dư: <b>{money(user.get('balance', 0))}</b>",
                parse_mode="HTML")
            await show_menu(update.message, user)
            return
        else:
            await update.message.reply_text(f"❌ {r.get('message', 'Token sai')}")
            return

    # Không token → check đã link chưa
    me = api_get(f"/api/telegram/me?chatId={chat_id}")
    if me.get("success"):
        await show_menu(update.message, me.get("user", {}))
        return

    kb = [[InlineKeyboardButton("🔗 Liên kết ngay", callback_data="link_help")]]
    if is_admin(u.id):
        kb.insert(0, [InlineKeyboardButton("🔧 ADMIN", callback_data="admin_panel")])

    await update.message.reply_text(
        f"🎉 Chào mừng <b>{u.first_name}</b>!\n\n"
        f"🤖 <b>Locket Gold Bot</b>\n\n"
        f"⚠️ Chưa liên kết tài khoản.\n"
        f"👉 Vào web → Cài đặt → Liên kết Telegram",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(kb))


async def show_menu(target, user):
    name = user.get('name') or user.get('username', 'User')
    bal = user.get('balance', 0)
    kb = [
        [InlineKeyboardButton(f"💰 Số dư: {money(bal)}", callback_data="my_balance")],
        [InlineKeyboardButton("🛒 Mua gói VIP", callback_data="buy")],
        [InlineKeyboardButton("💳 Nạp tiền", callback_data="recharge")],
        [InlineKeyboardButton("📦 Đơn hàng", callback_data="orders"),
         InlineKeyboardButton("👤 Tài khoản", callback_data="account")],
    ]
    if is_admin(user.get('id', 0)):
        kb.insert(0, [InlineKeyboardButton("🔧 ADMIN", callback_data="admin_panel")])

    text = f"🏠 <b>MENU CHÍNH</b>\n\n👤 <b>{name}</b>\n💰 Số dư: <b>{money(bal)}</b>"
    if hasattr(target, 'edit_message_text'):
        await target.edit_message_text(text, parse_mode="HTML", reply_markup=InlineKeyboardMarkup(kb))
    else:
        await target.reply_text(text, parse_mode="HTML", reply_markup=InlineKeyboardMarkup(kb))


# ═══ USER ═══
async def my_balance(update, ctx):
    q = update.callback_query; await q.answer()
    me = api_get(f"/api/telegram/me?chatId={q.from_user.id}")
    if not me.get("success"):
        await q.edit_message_text("❌ Chưa liên kết"); return
    u = me.get("user", {})
    await q.edit_message_text(
        f"�� <b>SỐ DƯ</b>\n\n<b>{money(u.get('balance', 0))}</b>",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton("💳 Nạp tiền", callback_data="recharge")],
            [InlineKeyboardButton("🔙 Menu", callback_data="menu")]]))


async def recharge(update, ctx):
    q = update.callback_query; await q.answer()
    r = api_post("/api/telegram/create-recharge", {"chatId": str(q.from_user.id)})
    if not r.get("success"):
        await q.edit_message_text(f"❌ {r.get('message')}"); return
    o = r.get("order", {})
    amt = o.get("finalAmount", 0); code = o.get("orderCode", "")
    qr = f"https://qr.sepay.vn/img?acc=36886368888&bank=TPBANK&amount={amt}&des={code}"
    await q.edit_message_text(
        f"💳 <b>NẠP TIỀN</b>\n\n📦 <code>{code}</code>\n💰 <b>{money(amt)}</b>\n\n📱 Quét QR:",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Menu", callback_data="menu")]]))
    await q.message.reply_photo(qr, caption=f"QR {money(amt)}")


async def orders(update, ctx):
    q = update.callback_query; await q.answer()
    d = api_get(f"/api/telegram/orders?chatId={q.from_user.id}")
    if not d.get("success"):
        await q.edit_message_text("❌ Chưa liên kết"); return
    orders = d.get("orders", [])
    if not orders:
        await q.edit_message_text("📦 Chưa có đơn",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Menu", callback_data="menu")]]))
        return
    lines = [f"📦 <b>ĐƠN HÀNG ({len(orders)})</b>\n"]
    for o in orders[:10]:
        icon = "✅" if o.get("status") == "paid" else "⏳"
        lines.append(f"{icon} <code>{o.get('orderCode')}</code> — {money(o.get('finalAmount', 0))}")
    await q.edit_message_text("\n".join(lines), parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Menu", callback_data="menu")]]))


async def account(update, ctx):
    q = update.callback_query; await q.answer()
    me = api_get(f"/api/telegram/me?chatId={q.from_user.id}")
    if not me.get("success"):
        await q.edit_message_text("❌ Chưa liên kết"); return
    u = me.get("user", {})
    await q.edit_message_text(
        f"👤 <b>TÀI KHOẢN</b>\n\n"
        f"📛 {u.get('name') or u.get('username')}\n"
        f"📧 {u.get('email')}\n"
        f"💰 {money(u.get('balance', 0))}",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton("🔓 Hủy liên kết", callback_data="logout")],
            [InlineKeyboardButton("🔙 Menu", callback_data="menu")]]))


async def logout(update, ctx):
    q = update.callback_query; await q.answer()
    api_post("/api/telegram/unlink", {"chatId": str(q.from_user.id)})
    await q.edit_message_text("✅ Đã hủy liên kết!\n\nGõ /start để làm lại.")


async def menu(update, ctx):
    q = update.callback_query; await q.answer()
    me = api_get(f"/api/telegram/me?chatId={q.from_user.id}")
    if me.get("success"):
        await show_menu(q, me.get("user", {}))
    else:
        await q.edit_message_text("❌ Gõ /start")


async def link_help(update, ctx):
    q = update.callback_query; await q.answer()
    await q.edit_message_text(
        f"🔗 <b>HƯỚNG DẪN</b>\n\n"
        f"1️⃣ Vào web → Cài đặt\n"
        f"2️⃣ Bấm <b>Liên kết Telegram</b>\n"
        f"3️⃣ Bot sẽ tự mở và liên kết",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🌐 Mở web", url=f"{API_URL}/tai-khoan/cai-dat")]]))


# ═══ ADMIN ═══
async def admin_panel(update, ctx):
    uid = update.effective_user.id if update.message else update.callback_query.from_user.id
    if not is_admin(uid):
        if update.callback_query:
            await update.callback_query.answer("❌ Không có quyền", show_alert=True)
        return
    kb = [
        [InlineKeyboardButton("📊 Thống kê", callback_data="admin_stats"),
         InlineKeyboardButton("👥 Users", callback_data="admin_users")],
        [InlineKeyboardButton("📦 Đơn hàng", callback_data="admin_orders"),
         InlineKeyboardButton("⏳ Chờ duyệt", callback_data="admin_pending")],
        [InlineKeyboardButton("🔙 Đóng", callback_data="admin_close")],
    ]
    text = f"🔧 <b>ADMIN PANEL</b>\n\n👑 {uid}"
    if update.callback_query:
        await update.callback_query.answer()
        await update.callback_query.edit_message_text(text, parse_mode="HTML", reply_markup=InlineKeyboardMarkup(kb))
    else:
        await update.message.reply_text(text, parse_mode="HTML", reply_markup=InlineKeyboardMarkup(kb))


async def admin_stats(update, ctx):
    q = update.callback_query; await q.answer()
    if not is_admin(q.from_user.id): return
    d = api_get("/api/admin/stats")
    s = d.get("stats", {}) if d.get("success") else {}
    await q.edit_message_text(
        f"📊 <b>THỐNG KÊ</b>\n\n"
        f"👥 Users: <b>{s.get('totalUsers', 0)}</b>\n"
        f"📦 Đơn: <b>{s.get('totalOrders', 0)}</b>\n"
        f"💰 Doanh thu: <b>{money(s.get('revenue', 0))}</b>",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Panel", callback_data="admin_panel")]]))


async def admin_users(update, ctx):
    q = update.callback_query; await q.answer()
    if not is_admin(q.from_user.id): return
    d = api_get("/api/admin/users?limit=15")
    users = d.get("users", []) if d.get("success") else []
    lines = [f"👥 <b>USERS ({len(users)})</b>\n"]
    for u in users[:15]:
        n = u.get('username') or u.get('email', '').split('@')[0]
        lines.append(f"• <b>{n}</b> — {money(u.get('balance', 0))}")
    await q.edit_message_text("\n".join(lines), parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Panel", callback_data="admin_panel")]]))


async def admin_orders(update, ctx):
    q = update.callback_query; await q.answer()
    if not is_admin(q.from_user.id): return
    d = api_get("/api/admin/orders?limit=15")
    orders = d.get("orders", []) if d.get("success") else []
    lines = [f"📦 <b>ĐƠN ({len(orders)})</b>\n"]
    for o in orders[:15]:
        icon = "✅" if o.get("status") == "paid" else "⏳"
        lines.append(f"{icon} <code>{o.get('orderCode')}</code> — {money(o.get('finalAmount', 0))}")
    await q.edit_message_text("\n".join(lines), parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Panel", callback_data="admin_panel")]]))


async def admin_pending(update, ctx):
    q = update.callback_query; await q.answer()
    if not is_admin(q.from_user.id): return
    d = api_get("/api/admin/pending-transactions")
    p = d.get("pendingTransactions", []) if d.get("success") else []
    if not p:
        await q.edit_message_text("✅ Không có GD chờ",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Panel", callback_data="admin_panel")]]))
        return
    lines = [f"⏳ <b>CHỜ DUYỆT ({len(p)})</b>\n"]
    for x in p[:10]:
        lines.append(f"• <code>{x.get('id', '')[:8]}</code> — {money(x.get('amount', 0))}")
    await q.edit_message_text("\n".join(lines), parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Panel", callback_data="admin_panel")]]))


async def admin_close(update, ctx):
    q = update.callback_query; await q.answer()
    await q.message.delete()


# ═══ COMMANDS ═══
async def cmd_help(update, ctx):
    t = "📖 <b>LỆNH</b>\n\n/start /help /id /me /unlink /hotro"
    if is_admin(update.effective_user.id):
        t += "\n\n<b>Admin:</b> /admin /stats"
    await update.message.reply_text(t, parse_mode="HTML")


async def cmd_id(update, ctx):
    await update.message.reply_text(f"🆔 <code>{update.effective_chat.id}</code>", parse_mode="HTML")


async def cmd_me(update, ctx):
    me = api_get(f"/api/telegram/me?chatId={update.effective_chat.id}")
    if not me.get("success"):
        await update.message.reply_text("❌ Chưa liên kết"); return
    u = me.get("user", {})
    await update.message.reply_text(
        f"👤 {u.get('name') or u.get('username')}\n💰 {money(u.get('balance', 0))}",
        parse_mode="HTML")


async def cmd_unlink(update, ctx):
    api_post("/api/telegram/unlink", {"chatId": str(update.effective_chat.id)})
    await update.message.reply_text("✅ Đã hủy liên kết!")


async def cmd_hotro(update, ctx):
    await update.message.reply_text(f"�� @your_admin\n🌐 {API_URL}")


async def echo(update, ctx):
    await update.message.reply_text("🤖 Gõ /help")


# ═══ ROUTER ═══
async def button_cb(update, ctx):
    d = update.callback_query.data
    routes = {
        "menu": menu, "my_balance": my_balance, "recharge": recharge,
        "orders": orders, "account": account, "logout": logout,
        "link_help": link_help,
        "admin_panel": admin_panel, "admin_stats": admin_stats,
        "admin_users": admin_users, "admin_orders": admin_orders,
        "admin_pending": admin_pending, "admin_close": admin_close,
    }
    if d in routes:
        return await routes[d](update, ctx)
    await update.callback_query.answer()


async def post_init(app):
    cmds = [BotCommand("start", "Menu"), BotCommand("help", "Hướng dẫn"),
            BotCommand("me", "Thông tin"), BotCommand("id", "Chat ID"),
            BotCommand("unlink", "Hủy liên kết"), BotCommand("hotro", "Hỗ trợ")]
    if ADMIN_IDS and ADMIN_IDS[0] != 0:
        cmds.extend([BotCommand("admin", "Admin Panel"), BotCommand("stats", "Thống kê")])
    await app.bot.set_my_commands(cmds)


def main():
    if not BOT_TOKEN:
        print("❌ Thiếu BOT_TOKEN"); sys.exit(1)
    print(f"🚀 Bot started | API: {API_URL} | Admins: {ADMIN_IDS}")
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", cmd_help))
    app.add_handler(CommandHandler("id", cmd_id))
    app.add_handler(CommandHandler("me", cmd_me))
    app.add_handler(CommandHandler("unlink", cmd_unlink))
    app.add_handler(CommandHandler("hotro", cmd_hotro))
    app.add_handler(CommandHandler("admin", admin_panel))
    app.add_handler(CommandHandler("stats", admin_stats))
    app.add_handler(CallbackQueryHandler(button_cb))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))
    app.post_init = post_init
    print("✅ Bot ready!")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
