#!/usr/bin/env python3
"""Locket Gold Bot - Deep link /start TOKEN"""

import os
import sys
import logging
import requests
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, BotCommand
from telegram.ext import (
    Application, CommandHandler, MessageHandler,
    CallbackQueryHandler, ContextTypes, filters,
)

BOT_TOKEN = os.environ.get("BOT_TOKEN", "")
API_URL = os.environ.get("API_URL", "https://locket-web-eight.vercel.app")
ADMIN_IDS = [int(x.strip()) for x in os.environ.get("ADMIN_IDS", "0").split(",") if x.strip().isdigit()]

logging.basicConfig(format="%(asctime)s - %(levelname)s - %(message)s", level=logging.INFO)
logger = logging.getLogger(__name__)


def is_admin(uid): return uid in ADMIN_IDS

def api_get(path):
    try: return requests.get(f"{API_URL}{path}", timeout=10).json()
    except: return {}

def api_post(path, data):
    try: return requests.post(f"{API_URL}{path}", json=data, timeout=10).json()
    except: return {}

def fmt_money(n):
    try: return f"{int(n):,}đ".replace(",", ".")
    except: return f"{n}đ"


# ═══════════════════════════════════════════════
# /start [token]
# ═══════════════════════════════════════════════
async def start(update, ctx):
    u = update.effective_user
    chat_id = update.effective_chat.id

    # Nếu có token → thử liên kết ngay
    if ctx.args:
        token = ctx.args[0]
        r = api_post("/api/telegram/link", {"token": token, "chatId": str(chat_id)})

        if r.get("success"):
            user = r.get("user", {})
            await update.message.reply_text(
                f"✅ <b>LIÊN KẾT THÀNH CÔNG!</b>\n\n"
                f"👤 {user.get('name') or user.get('username')}\n"
                f"💰 Số dư: <b>{fmt_money(user.get('balance', 0))}</b>",
                parse_mode="HTML",
            )
            await show_user_menu(update.message, user)
            return
        else:
            await update.message.reply_text(
                f"❌ {r.get('message', 'Token không hợp lệ')}\n\n"
                f"Vui lòng tạo lại trên web."
            )

    # Không có token → check đã liên kết chưa
    me = api_get(f"/api/telegram/me?chatId={chat_id}")
    if me.get("success"):
        await show_user_menu(update.message, me.get("user", {}))
    else:
        kb = [
            [InlineKeyboardButton("🔗 Liên kết ngay", callback_data="user_link_help")],
        ]
        if is_admin(u.id):
            kb.insert(0, [InlineKeyboardButton("🔧 ADMIN PANEL", callback_data="admin_panel")])

        await update.message.reply_text(
            f"🎉 Chào mừng <b>{u.first_name}</b>!\n\n"
            f"🤖 <b>Locket Gold Bot</b>\n\n"
            f"⚠️ Bạn <b>chưa liên kết</b> tài khoản.\n"
            f"👉 Vào <b>Cài đặt</b> trên web → bấm <b>Liên kết Telegram</b>",
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup(kb),
        )


async def show_user_menu(msg_or_q, user):
    name = user.get('name') or user.get('username', 'User')
    balance = user.get('balance', 0)

    kb = [
        [InlineKeyboardButton(f"💰 Số dư: {fmt_money(balance)}", callback_data="user_balance")],
        [InlineKeyboardButton("🛒 Mua gói VIP", callback_data="user_buy")],
        [InlineKeyboardButton("💳 Nạp tiền", callback_data="user_recharge")],
        [InlineKeyboardButton("📦 Đơn hàng", callback_data="user_orders"),
         InlineKeyboardButton("👤 Tài khoản", callback_data="user_account")],
    ]
    if is_admin(user.get('id', 0)):
        kb.insert(0, [InlineKeyboardButton("🔧 ADMIN PANEL", callback_data="admin_panel")])

    text = (
        f"🏠 <b>MENU CHÍNH</b>\n\n"
        f"👤 <b>{name}</b>\n"
        f"💰 Số dư: <b>{fmt_money(balance)}</b>"
    )

    if hasattr(msg_or_q, 'edit_message_text'):
        await msg_or_q.edit_message_text(text, parse_mode="HTML", reply_markup=InlineKeyboardMarkup(kb))
    else:
        await msg_or_q.reply_text(text, parse_mode="HTML", reply_markup=InlineKeyboardMarkup(kb))


# ═══════════════════════════════════════════════
# USER FUNCTIONS
# ═══════════════════════════════════════════════
async def user_balance(update, ctx):
    q = update.callback_query
    await q.answer()
    me = api_get(f"/api/telegram/me?chatId={q.from_user.id}")
    if not me.get("success"):
        await q.edit_message_text("❌ Chưa liên kết")
        return
    u = me.get("user", {})
    await q.edit_message_text(
        f"💰 <b>SỐ DƯ</b>\n\n<b>{fmt_money(u.get('balance', 0))}</b>",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton("💳 Nạp tiền", callback_data="user_recharge")],
            [InlineKeyboardButton("🔙 Menu", callback_data="user_menu")],
        ]),
    )


async def user_recharge(update, ctx):
    q = update.callback_query
    await q.answer()
    r = api_post("/api/telegram/create-recharge", {"chatId": str(q.from_user.id)})
    if not r.get("success"):
        await q.edit_message_text(f"❌ {r.get('message')}")
        return
    order = r.get("order", {})
    amount = order.get("finalAmount", 0)
    code = order.get("orderCode", "")
    qr = f"https://qr.sepay.vn/img?acc=36886368888&bank=TPBANK&amount={amount}&des={code}"
    await q.edit_message_text(
        f"💳 <b>NẠP TIỀN</b>\n\n📦 <code>{code}</code>\n💰 <b>{fmt_money(amount)}</b>\n\n📱 Quét QR bên dưới:",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("�� Menu", callback_data="user_menu")]]),
    )
    await q.message.reply_photo(qr, caption=f"QR {fmt_money(amount)}")


async def user_orders(update, ctx):
    q = update.callback_query
    await q.answer()
    d = api_get(f"/api/telegram/orders?chatId={q.from_user.id}")
    if not d.get("success"):
        await q.edit_message_text("❌ Chưa liên kết")
        return
    orders = d.get("orders", [])
    if not orders:
        await q.edit_message_text(
            "📦 Chưa có đơn hàng",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Menu", callback_data="user_menu")]]),
        )
        return
    lines = [f"📦 <b>ĐƠN HÀNG ({len(orders)})</b>\n"]
    for o in orders[:10]:
        icon = "✅" if o.get("status") == "paid" else "⏳"
        lines.append(f"{icon} <code>{o.get('orderCode')}</code> — {fmt_money(o.get('finalAmount', 0))}")
    await q.edit_message_text(
        "\n".join(lines),
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Menu", callback_data="user_menu")]]),
    )


async def user_account(update, ctx):
    q = update.callback_query
    await q.answer()
    me = api_get(f"/api/telegram/me?chatId={q.from_user.id}")
    if not me.get("success"):
        await q.edit_message_text("❌ Chưa liên kết")
        return
    u = me.get("user", {})
    await q.edit_message_text(
        f"👤 <b>TÀI KHOẢN</b>\n\n"
        f"📛 {u.get('name') or u.get('username')}\n"
        f"📧 {u.get('email')}\n"
        f"💰 {fmt_money(u.get('balance', 0))}",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton("🔓 Hủy liên kết", callback_data="user_logout")],
            [InlineKeyboardButton("🔙 Menu", callback_data="user_menu")],
        ]),
    )


async def user_logout(update, ctx):
    q = update.callback_query
    await q.answer()
    api_post("/api/telegram/unlink", {"chatId": str(q.from_user.id)})
    await q.edit_message_text("✅ Đã hủy liên kết!\n\nGõ /start để bắt đầu lại.")


async def user_menu(update, ctx):
    q = update.callback_query
    await q.answer()
    me = api_get(f"/api/telegram/me?chatId={q.from_user.id}")
    if me.get("success"):
        await show_user_menu(q, me.get("user", {}))
    else:
        await q.edit_message_text("❌ Vui lòng /start lại")


async def user_buy(update, ctx):
    q = update.callback_query
    await q.answer()
    d = api_get("/api/telegram/services")
    services = d.get("services", []) if d.get("success") else []
    if not services:
        await q.edit_message_text("❌ Không có gói nào")
        return
    kb = []
    for s in services:
        kb.append([InlineKeyboardButton(
            f"{s.get('name')} — {fmt_money(s.get('price', 0))}",
            callback_data=f"user_buy_{s.get('slug')}"
        )])
    kb.append([InlineKeyboardButton("🔙 Menu", callback_data="user_menu")])
    await q.edit_message_text(
        "🛒 <b>CHỌN GÓI VIP</b>",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(kb),
    )


async def user_help(update, ctx):
    q = update.callback_query
    await q.answer()
    await q.edit_message_text(
        f"📖 <b>HƯỚNG DẪN</b>\n\n"
        f"1️⃣ /start - Menu\n"
        f"2️⃣ /me - Thông tin\n"
        f"3️⃣ /link - Liên kết\n"
        f"4️⃣ /unlink - Hủy\n\n"
        f"🌐 {API_URL}",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Menu", callback_data="user_menu")]]),
    )


async def user_link_help(update, ctx):
    q = update.callback_query
    await q.answer()
    await q.edit_message_text(
        f"🔗 <b>HƯỚNG DẪN LIÊN KẾT</b>\n\n"
        f"1️⃣ Vào <a href='{API_URL}/tai-khoan/cai-dat'>{API_URL}/tai-khoan/cai-dat</a>\n"
        f"2️⃣ Bấm <b>Liên kết Telegram</b>\n"
        f"3️⃣ Bot sẽ tự động mở và liên kết\n\n"
        f"⚡ Nếu không tự động, gõ /start",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🌐 Mở web", url=f"{API_URL}/tai-khoan/cai-dat")]]),
    )


# ═══════════════════════════════════════════════
# ADMIN
# ═══════════════════════════════════════════════
async def admin_panel(update, ctx):
    uid = update.effective_user.id if update.message else update.callback_query.from_user.id
    if not is_admin(uid):
        if update.callback_query:
            await update.callback_query.answer("❌ Không có quyền", show_alert=True)
        else:
            await update.message.reply_text("❌ Không có quyền")
        return

    kb = [
        [InlineKeyboardButton("📊 Thống kê", callback_data="admin_stats"),
         InlineKeyboardButton("👥 Users", callback_data="admin_users")],
        [InlineKeyboardButton("📦 Đơn hàng", callback_data="admin_orders"),
         InlineKeyboardButton("⏳ Chờ duyệt", callback_data="admin_pending")],
        [InlineKeyboardButton("🔙 Đóng", callback_data="admin_close")],
    ]
    text = f"🔧 <b>ADMIN PANEL</b>\n\n👑 {update.effective_user.full_name}"

    if update.callback_query:
        await update.callback_query.answer()
        await update.callback_query.edit_message_text(text, parse_mode="HTML", reply_markup=InlineKeyboardMarkup(kb))
    else:
        await update.message.reply_text(text, parse_mode="HTML", reply_markup=InlineKeyboardMarkup(kb))


async def admin_stats(update, ctx):
    q = update.callback_query
    await q.answer()
    if not is_admin(q.from_user.id): return
    d = api_get("/api/admin/stats")
    s = d.get("stats", {}) if d.get("success") else {}
    await q.edit_message_text(
        f"📊 <b>THỐNG KÊ</b>\n\n"
        f"👥 Users: <b>{s.get('totalUsers', 0)}</b>\n"
        f"📦 Đơn: <b>{s.get('totalOrders', 0)}</b>\n"
        f"✅ Đã TT: <b>{s.get('paidOrders', 0)}</b>\n"
        f"💰 Doanh thu: <b>{fmt_money(s.get('revenue', 0))}</b>",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Panel", callback_data="admin_panel")]]),
    )


async def admin_users(update, ctx):
    q = update.callback_query
    await q.answer()
    if not is_admin(q.from_user.id): return
    d = api_get("/api/admin/users?limit=15")
    users = d.get("users", []) if d.get("success") else []
    lines = [f"�� <b>USERS ({len(users)})</b>\n"]
    for u in users[:15]:
        name = u.get('username') or u.get('email', '').split('@')[0]
        lines.append(f"• <b>{name}</b> — {fmt_money(u.get('balance', 0))}")
    await q.edit_message_text(
        "\n".join(lines),
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Panel", callback_data="admin_panel")]]),
    )


async def admin_orders(update, ctx):
    q = update.callback_query
    await q.answer()
    if not is_admin(q.from_user.id): return
    d = api_get("/api/admin/orders?limit=15")
    orders = d.get("orders", []) if d.get("success") else []
    lines = [f"📦 <b>ĐƠN ({len(orders)})</b>\n"]
    for o in orders[:15]:
        icon = "✅" if o.get("status") == "paid" else "⏳"
        lines.append(f"{icon} <code>{o.get('orderCode')}</code> — {fmt_money(o.get('finalAmount', 0))}")
    await q.edit_message_text(
        "\n".join(lines),
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Panel", callback_data="admin_panel")]]),
    )


async def admin_pending(update, ctx):
    q = update.callback_query
    await q.answer()
    if not is_admin(q.from_user.id): return
    d = api_get("/api/admin/pending-transactions")
    p = d.get("pendingTransactions", []) if d.get("success") else []
    if not p:
        await q.edit_message_text(
            "✅ Không có GD chờ",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Panel", callback_data="admin_panel")]]),
        )
        return
    lines = [f"⏳ <b>CHỜ DUYỆT ({len(p)})</b>\n"]
    for x in p[:10]:
        lines.append(f"• <code>{x.get('id', '')[:8]}</code> — {fmt_money(x.get('amount', 0))}")
    await q.edit_message_text(
        "\n".join(lines),
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Panel", callback_data="admin_panel")]]),
    )


async def admin_close(update, ctx):
    q = update.callback_query
    await q.answer()
    await q.message.delete()


# ═══════════════════════════════════════════════
# COMMANDS
# ═══════════════════════════════════════════════
async def cmd_help(update, ctx):
    text = "📖 <b>LỆNH</b>\n\n/start /me /link /unlink /hotro /id"
    if is_admin(update.effective_user.id):
        text += "\n\n<b>Admin:</b> /admin /stats /pending"
    await update.message.reply_text(text, parse_mode="HTML")


async def cmd_id(update, ctx):
    await update.message.reply_text(
        f"🆔 Chat ID: <code>{update.effective_chat.id}</code>",
        parse_mode="HTML",
    )


async def cmd_me(update, ctx):
    chat_id = update.effective_chat.id
    me = api_get(f"/api/telegram/me?chatId={chat_id}")
    if not me.get("success"):
        await update.message.reply_text("❌ Chưa liên kết. Gõ /start")
        return
    u = me.get("user", {})
    await update.message.reply_text(
        f"👤 {u.get('name') or u.get('username')}\n"
        f"💰 {fmt_money(u.get('balance', 0))}",
        parse_mode="HTML",
    )


async def cmd_unlink(update, ctx):
    api_post("/api/telegram/unlink", {"chatId": str(update.effective_chat.id)})
    await update.message.reply_text("✅ Đã hủy liên kết!")


async def cmd_support(update, ctx):
    await update.message.reply_text(f"📞 @your_admin\n🌐 {API_URL}")


async def cmd_stats(update, ctx):
    if not is_admin(update.effective_user.id): return
    d = api_get("/api/admin/stats")
    s = d.get("stats", {}) if d.get("success") else {}
    await update.message.reply_text(
        f"📊 <b>STATS</b>\n\n👥 {s.get('totalUsers', 0)}\n📦 {s.get('totalOrders', 0)}\n💰 {fmt_money(s.get('revenue', 0))}",
        parse_mode="HTML",
    )


async def cmd_pending(update, ctx):
    if not is_admin(update.effective_user.id): return
    d = api_get("/api/admin/pending-transactions")
    p = d.get("pendingTransactions", []) if d.get("success") else []
    if not p:
        await update.message.reply_text("✅ Không có GD chờ")
        return
    lines = [f"⏳ <b>CHỜ DUYỆT ({len(p)})</b>\n"]
    for x in p[:10]:
        lines.append(f"• <code>{x.get('id', '')[:8]}</code> — {fmt_money(x.get('amount', 0))}")
    await update.message.reply_text("\n".join(lines), parse_mode="HTML")


async def cmd_approve(update, ctx):
    if not is_admin(update.effective_user.id) or not ctx.args: return
    r = api_post("/api/admin/pending-transactions", {"id": ctx.args[0], "action": "approve"})
    await update.message.reply_text("✅ Đã duyệt!" if r.get("success") else f"❌ {r.get('message')}")


async def cmd_reject(update, ctx):
    if not is_admin(update.effective_user.id) or not ctx.args: return
    r = api_post("/api/admin/pending-transactions", {"id": ctx.args[0], "action": "reject"})
    await update.message.reply_text("❌ Đã từ chối!" if r.get("success") else f"❌ {r.get('message')}")


async def cmd_add_balance(update, ctx):
    if not is_admin(update.effective_user.id) or len(ctx.args) < 2: return
    try: amt = int(ctx.args[1])
    except: return
    r = api_post("/api/admin/users/recharge", {"email": ctx.args[0], "amount": amt})
    await update.message.reply_text(f"✅ +{fmt_money(amt)}" if r.get("success") else f"❌ {r.get('message')}")


async def echo(update, ctx):
    await update.message.reply_text("🤖 Gõ /help")


# ═══════════════════════════════════════════════
# CALLBACK ROUTER
# ═══════════════════════════════════════════════
async def button_cb(update, ctx):
    data = update.callback_query.data

    if data == "user_menu": return await user_menu(update, ctx)
    if data == "user_balance": return await user_balance(update, ctx)
    if data == "user_recharge": return await user_recharge(update, ctx)
    if data == "user_buy": return await user_buy(update, ctx)
    if data == "user_orders": return await user_orders(update, ctx)
    if data == "user_account": return await user_account(update, ctx)
    if data == "user_logout": return await user_logout(update, ctx)
    if data == "user_help": return await user_help(update, ctx)
    if data == "user_link_help": return await user_link_help(update, ctx)

    if data == "admin_panel": return await admin_panel(update, ctx)
    if data == "admin_stats": return await admin_stats(update, ctx)
    if data == "admin_users": return await admin_users(update, ctx)
    if data == "admin_orders": return await admin_orders(update, ctx)
    if data == "admin_pending": return await admin_pending(update, ctx)
    if data == "admin_close": return await admin_close(update, ctx)

    await update.callback_query.answer()


async def post_init(app):
    cmds = [
        BotCommand("start", "Menu chính"),
        BotCommand("help", "Hướng dẫn"),
        BotCommand("me", "Thông tin"),
        BotCommand("link", "Liên kết"),
        BotCommand("unlink", "Hủy liên kết"),
        BotCommand("id", "Chat ID"),
        BotCommand("hotro", "Hỗ trợ"),
    ]
    if ADMIN_IDS and ADMIN_IDS[0] != 0:
        cmds.extend([
            BotCommand("admin", "Admin Panel"),
            BotCommand("stats", "Thống kê"),
        ])
    await app.bot.set_my_commands(cmds)


def main():
    if not BOT_TOKEN:
        print("❌ Thiếu BOT_TOKEN")
        sys.exit(1)

    print("=" * 50)
    print("🚀 Locket Gold Bot")
    print(f"🌐 API: {API_URL}")
    print(f"👑 Admins: {ADMIN_IDS}")
    print("=" * 50)

    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", cmd_help))
    app.add_handler(CommandHandler("id", cmd_id))
    app.add_handler(CommandHandler("me", cmd_me))
    app.add_handler(CommandHandler("unlink", cmd_unlink))
    app.add_handler(CommandHandler("hotro", cmd_support))
    app.add_handler(CommandHandler("admin", admin_panel))
    app.add_handler(CommandHandler("stats", cmd_stats))
    app.add_handler(CommandHandler("pending", cmd_pending))
    app.add_handler(CommandHandler("approve", cmd_approve))
    app.add_handler(CommandHandler("reject", cmd_reject))
    app.add_handler(CommandHandler("add_balance", cmd_add_balance))

    app.add_handler(CallbackQueryHandler(button_cb))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))

    app.post_init = post_init

    print("✅ Bot ready!\n")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
