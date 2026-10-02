#!/usr/bin/env python3
"""Locket Gold Bot - User + Admin FULL FEATURES"""

import os
import sys
import logging
import requests
from datetime import datetime
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, BotCommand
from telegram.ext import (
    Application, CommandHandler, MessageHandler,
    CallbackQueryHandler, ContextTypes, filters,
)

BOT_TOKEN = os.environ.get("BOT_TOKEN", "")
API_URL = os.environ.get("API_URL", "https://locket-web-eight.vercel.app")
ADMIN_IDS = [int(x) for x in os.environ.get("ADMIN_IDS", "0").split(",") if x.strip().isdigit()]

logging.basicConfig(format="%(asctime)s - %(levelname)s - %(message)s", level=logging.INFO)
logger = logging.getLogger(__name__)


def is_admin(uid): return uid in ADMIN_IDS

def api_get(path):
    try: return requests.get(f"{API_URL}{path}", timeout=10).json()
    except Exception as e:
        logger.error(f"API GET {path}: {e}")
        return {}

def api_post(path, data):
    try: return requests.post(f"{API_URL}{path}", json=data, timeout=10).json()
    except Exception as e:
        logger.error(f"API POST {path}: {e}")
        return {}


# ═══════════════════════════════════════════════════════
# USER COMMANDS
# ═══════════════════════════════════════════════════════
async def start(update, ctx):
    u = update.effective_user
    kb = [
        [InlineKeyboardButton("🛒 Mua gói VIP", url=f"{API_URL}/bang-gia")],
        [InlineKeyboardButton("💰 Nạp tiền", url=f"{API_URL}/nap-tien")],
        [InlineKeyboardButton("👤 Tài khoản", url=f"{API_URL}/tai-khoan"),
         InlineKeyboardButton("📦 Đơn hàng", url=f"{API_URL}/tai-khoan/don-hang")],
        [InlineKeyboardButton("📖 Hướng dẫn", callback_data="user_help"),
         InlineKeyboardButton("📞 Hỗ trợ", callback_data="user_support")],
    ]
    if is_admin(u.id):
        kb.append([InlineKeyboardButton("🔧 ADMIN PANEL", callback_data="admin_panel")])
    await update.message.reply_text(
        f"🎉 Chào mừng <b>{u.first_name}</b>!\n\n"
        f"🤖 <b>Locket Gold Bot</b>\n"
        f"📌 Gõ /help để xem hướng dẫn\n"
        f"🌐 Website: {API_URL}",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(kb),
    )


async def help_cmd(update, ctx):
    text = (
        "📖 <b>LỆNH NGƯỜI DÙNG</b>\n\n"
        "<b>👤 Tài khoản:</b>\n"
        "/start - Khởi động\n"
        "/id - Lấy Chat ID\n"
        "/balance - Số dư\n"
        "/orders - Đơn hàng của tôi\n\n"
        "<b>🛒 Mua hàng:</b>\n"
        "/buy - Mua gói VIP\n"
        "/nap - Nạp tiền\n"
        "/hotro - Liên hệ hỗ trợ"
    )
    if is_admin(update.effective_user.id):
        text += (
            "\n\n<b>🔧 LỆNH ADMIN</b>\n"
            "/admin - Menu admin\n"
            "/stats - Thống kê\n"
            "/users - Danh sách users\n"
            "/orders_all - Tất cả đơn\n"
            "/pending - GD chờ duyệt\n"
            "/approve &lt;id&gt; - Duyệt GD\n"
            "/reject &lt;id&gt; - Từ chối GD\n"
            "/add_balance &lt;email&gt; &lt;amount&gt;\n"
            "/broadcast &lt;msg&gt; - Thông báo\n"
            "/find &lt;email&gt; - Tìm user\n"
            "/ban &lt;email&gt; - Khoá user\n"
            "/unban &lt;email&gt; - Mở khoá"
        )
    await update.message.reply_text(text, parse_mode="HTML")


async def get_id(update, ctx):
    c = update.effective_chat
    u = update.effective_user
    await update.message.reply_text(
        f"🆔 <b>Thông tin của bạn:</b>\n\n"
        f"Chat ID: <code>{c.id}</code>\n"
        f"User ID: <code>{u.id}</code>\n"
        f"Username: @{u.username or 'N/A'}\n"
        f"Tên: {u.full_name}",
        parse_mode="HTML",
    )


async def balance_cmd(update, ctx):
    kb = [[InlineKeyboardButton("💰 Kiểm tra số dư", url=f"{API_URL}/tai-khoan")]]
    await update.message.reply_text(
        "💰 Nhấn nút để kiểm tra số dư:",
        reply_markup=InlineKeyboardMarkup(kb),
    )


async def orders_cmd(update, ctx):
    kb = [[InlineKeyboardButton("📦 Xem đơn hàng", url=f"{API_URL}/tai-khoan/don-hang")]]
    await update.message.reply_text(
        "📦 Nhấn nút để xem đơn hàng:",
        reply_markup=InlineKeyboardMarkup(kb),
    )


async def buy_cmd(update, ctx):
    kb = [[InlineKeyboardButton("🛒 Mua gói VIP", url=f"{API_URL}/bang-gia")]]
    await update.message.reply_text(
        "🛒 Chọn gói VIP tại website:",
        reply_markup=InlineKeyboardMarkup(kb),
    )


async def nap_cmd(update, ctx):
    kb = [[InlineKeyboardButton("💰 Nạp tiền", url=f"{API_URL}/nap-tien")]]
    await update.message.reply_text(
        "💰 Nạp tiền vào ví:",
        reply_markup=InlineKeyboardMarkup(kb),
    )


async def support_cmd(update, ctx):
    await update.message.reply_text(
        f"📞 <b>HỖ TRỢ</b>\n\n"
        f"• Telegram: @your_admin\n"
        f"• Zalo: 03686368888\n"
        f"• Website: {API_URL}",
        parse_mode="HTML",
    )


# ═══════════════════════════════════════════════════════
# ADMIN COMMANDS
# ═══════════════════════════════════════════════════════
async def admin_panel(update, ctx):
    if not is_admin(update.effective_user.id):
        await update.message.reply_text("❌ Không có quyền")
        return
    kb = [
        [InlineKeyboardButton("📊 Thống kê", callback_data="stats"),
         InlineKeyboardButton("👥 Users", callback_data="users")],
        [InlineKeyboardButton("📦 Đơn hàng", callback_data="orders_all"),
         InlineKeyboardButton("⏳ Chờ duyệt", callback_data="pending")],
        [InlineKeyboardButton("🎁 Nạp tiền User", callback_data="recharge_help"),
         InlineKeyboardButton("📢 Broadcast", callback_data="broadcast_help")],
        [InlineKeyboardButton("🔙 Đóng", callback_data="close")],
    ]
    await update.message.reply_text(
        "🔧 <b>ADMIN PANEL</b>\n\n"
        "Chọn chức năng quản lý:",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(kb),
    )


async def stats_cmd(update, ctx):
    if not is_admin(update.effective_user.id): return
    msg = await update.message.reply_text("⏳ Đang tải...")
    d = api_get("/api/admin/stats")
    if not d.get("success"):
        await msg.edit_text("❌ Không lấy được thống kê")
        return
    s = d.get("stats", {})
    await msg.edit_text(
        f"📊 <b>THỐNG KÊ HỆ THỐNG</b>\n\n"
        f"👥 Tổng users: <b>{s.get('totalUsers', 0)}</b>\n"
        f"📦 Tổng đơn: <b>{s.get('totalOrders', 0)}</b>\n"
        f"✅ Đã thanh toán: <b>{s.get('paidOrders', 0)}</b>\n"
        f"⏳ Chờ xử lý: <b>{s.get('pendingOrders', 0)}</b>\n"
        f"💰 Doanh thu: <b>{s.get('revenue', 0):,}đ</b>\n\n"
        f"🕒 {datetime.now().strftime('%d/%m/%Y %H:%M')}",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Quay lại", callback_data="admin_panel")]]),
    )


async def users_cmd(update, ctx):
    if not is_admin(update.effective_user.id): return
    msg = await update.message.reply_text("⏳ Đang tải...")
    d = api_get("/api/admin/users?limit=20")
    if not d.get("success"):
        await msg.edit_text("❌ Không lấy được users")
        return
    users = d.get("users", [])
    lines = [f"👥 <b>USERS ({len(users)})</b>\n"]
    for u in users[:20]:
        name = u.get('username') or u.get('email', 'N/A').split('@')[0]
        bal = u.get('balance', 0)
        lines.append(f"• <b>{name}</b> — {bal:,}đ")
    await msg.edit_text(
        "\n".join(lines),
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Quay lại", callback_data="admin_panel")]]),
    )


async def orders_all_cmd(update, ctx):
    if not is_admin(update.effective_user.id): return
    msg = await update.message.reply_text("⏳ Đang tải...")
    d = api_get("/api/admin/orders?limit=20")
    if not d.get("success"):
        await msg.edit_text("❌ Không lấy được đơn")
        return
    orders = d.get("orders", [])
    lines = [f"📦 <b>ĐƠN HÀNG ({len(orders)})</b>\n"]
    for o in orders[:20]:
        icon = "✅" if o.get("status") == "paid" else "⏳"
        lines.append(
            f"{icon} <code>{o.get('orderCode', 'N/A')}</code>\n"
            f"   💰 {o.get('finalAmount', 0):,}đ — {o.get('locketUsername', 'N/A')}"
        )
    await msg.edit_text(
        "\n".join(lines),
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Quay lại", callback_data="admin_panel")]]),
    )


async def pending_cmd(update, ctx):
    if not is_admin(update.effective_user.id): return
    msg = await update.message.reply_text("⏳ Đang tải...")
    d = api_get("/api/admin/pending-transactions")
    if not d.get("success"):
        await msg.edit_text("❌ Không lấy được")
        return
    p = d.get("pendingTransactions", [])
    if not p:
        await msg.edit_text(
            "✅ Không có giao dịch chờ duyệt",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Quay lại", callback_data="admin_panel")]]),
        )
        return
    lines = [f"⏳ <b>CHỜ DUYỆT ({len(p)})</b>\n"]
    for x in p[:10]:
        lines.append(
            f"• ID: <code>{x.get('id', 'N/A')[:8]}</code>\n"
            f"  💰 {x.get('amount', 0):,}đ\n"
            f"  📝 {x.get('content', 'N/A')}\n"
            f"  👉 /approve {x.get('id', 'N/A')[:8]}"
        )
    await msg.edit_text(
        "\n".join(lines),
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Quay lại", callback_data="admin_panel")]]),
    )


async def approve_cmd(update, ctx):
    if not is_admin(update.effective_user.id): return
    if not ctx.args:
        await update.message.reply_text("❌ Dùng: /approve <id>")
        return
    r = api_post("/api/admin/pending-transactions", {"id": ctx.args[0], "action": "approve"})
    await update.message.reply_text(
        f"✅ Đã duyệt GD {ctx.args[0]}" if r.get("success") else f"❌ {r.get('message', 'Lỗi')}"
    )


async def reject_cmd(update, ctx):
    if not is_admin(update.effective_user.id): return
    if not ctx.args:
        await update.message.reply_text("❌ Dùng: /reject <id>")
        return
    r = api_post("/api/admin/pending-transactions", {"id": ctx.args[0], "action": "reject"})
    await update.message.reply_text(
        f"❌ Đã từ chối GD {ctx.args[0]}" if r.get("success") else f"❌ {r.get('message', 'Lỗi')}"
    )


async def add_balance_cmd(update, ctx):
    if not is_admin(update.effective_user.id): return
    if len(ctx.args) < 2:
        await update.message.reply_text("❌ Dùng: /add_balance <email> <amount>")
        return
    try:
        amt = int(ctx.args[1])
    except:
        await update.message.reply_text("❌ Số tiền không hợp lệ")
        return
    r = api_post("/api/admin/users/recharge", {"email": ctx.args[0], "amount": amt})
    await update.message.reply_text(
        f"✅ Đã cộng {amt:,}đ cho {ctx.args[0]}" if r.get("success") else f"❌ {r.get('message', 'Lỗi')}"
    )


async def broadcast_cmd(update, ctx):
    if not is_admin(update.effective_user.id): return
    if not ctx.args:
        await update.message.reply_text("❌ Dùng: /broadcast <msg>")
        return
    msg = " ".join(ctx.args)
    await update.message.reply_text(f"📢 Đã gửi broadcast:\n\n{msg}")


async def find_cmd(update, ctx):
    if not is_admin(update.effective_user.id): return
    if not ctx.args:
        await update.message.reply_text("❌ Dùng: /find <email>")
        return
    email = ctx.args[0]
    d = api_get(f"/api/admin/users?search={email}&limit=5")
    if not d.get("success"):
        await update.message.reply_text("❌ Không tìm thấy")
        return
    users = d.get("users", [])
    if not users:
        await update.message.reply_text(f"❌ Không tìm thấy user {email}")
        return
    lines = [f"🔍 <b>KẾT QUẢ</b>\n"]
    for u in users:
        lines.append(
            f"• <b>{u.get('username', 'N/A')}</b>\n"
            f"  📧 {u.get('email', 'N/A')}\n"
            f"  💰 {u.get('balance', 0):,}đ\n"
            f"  🆔 <code>{u.get('id', 'N/A')[:8]}</code>"
        )
    await update.message.reply_text("\n".join(lines), parse_mode="HTML")


async def ban_cmd(update, ctx):
    if not is_admin(update.effective_user.id): return
    if not ctx.args:
        await update.message.reply_text("❌ Dùng: /ban <email>")
        return
    r = api_post("/api/admin/users", {"email": ctx.args[0], "action": "ban"})
    await update.message.reply_text(
        f"🚫 Đã khoá {ctx.args[0]}" if r.get("success") else f"❌ {r.get('message', 'Lỗi')}"
    )


async def unban_cmd(update, ctx):
    if not is_admin(update.effective_user.id): return
    if not ctx.args:
        await update.message.reply_text("❌ Dùng: /unban <email>")
        return
    r = api_post("/api/admin/users", {"email": ctx.args[0], "action": "unban"})
    await update.message.reply_text(
        f"✅ Đã mở khoá {ctx.args[0]}" if r.get("success") else f"❌ {r.get('message', 'Lỗi')}"
    )


# ═══════════════════════════════════════════════════════
# CALLBACK
# ═══════════════════════════════════════════════════════
async def button_cb(update, ctx):
    q = update.callback_query
    await q.answer()

    if q.data == "close":
        await q.message.delete()
        return

    if q.data == "user_help":
        await q.edit_message_text(
            "📖 <b>HƯỚNG DẪN</b>\n\n"
            "1️⃣ Nhập /id để lấy Chat ID\n"
            "2️⃣ Truy cập website để nạp tiền\n"
            "3️⃣ Mua gói VIP tại /bang-gia\n"
            "4️⃣ Liên hệ admin nếu cần hỗ trợ",
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Đóng", callback_data="close")]]),
        )
        return

    if q.data == "user_support":
        await q.edit_message_text(
            f"📞 <b>HỖ TRỢ</b>\n\n"
            f"• Telegram: @your_admin\n"
            f"• Zalo: 03686368888\n"
            f"• Website: {API_URL}",
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Đóng", callback_data="close")]]),
        )
        return

    if not is_admin(q.from_user.id):
        await q.answer("❌ Không có quyền", show_alert=True)
        return

    if q.data == "admin_panel":
        kb = [
            [InlineKeyboardButton("📊 Thống kê", callback_data="stats"),
             InlineKeyboardButton("👥 Users", callback_data="users")],
            [InlineKeyboardButton("📦 Đơn hàng", callback_data="orders_all"),
             InlineKeyboardButton("⏳ Chờ duyệt", callback_data="pending")],
            [InlineKeyboardButton("🎁 Nạp tiền User", callback_data="recharge_help"),
             InlineKeyboardButton("📢 Broadcast", callback_data="broadcast_help")],
            [InlineKeyboardButton("🔙 Đóng", callback_data="close")],
        ]
        await q.edit_message_text(
            "🔧 <b>ADMIN PANEL</b>\n\nChọn chức năng:",
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup(kb),
        )
        return

    if q.data == "recharge_help":
        await q.edit_message_text(
            "🎁 <b>NẠP TIỀN USER</b>\n\n"
            "Cú pháp:\n"
            "<code>/add_balance email amount</code>\n\n"
            "Ví dụ:\n"
            "<code>/add_balance user@gmail.com 100000</code>",
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Quay lại", callback_data="admin_panel")]]),
        )
        return

    if q.data == "broadcast_help":
        await q.edit_message_text(
            "📢 <b>BROADCAST</b>\n\n"
            "Cú pháp:\n"
            "<code>/broadcast Nội dung thông báo</code>\n\n"
            "Ví dụ:\n"
            "<code>/broadcast Khuyến mãi 50% gói VIP!</code>",
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Quay lại", callback_data="admin_panel")]]),
        )
        return

    if q.data == "stats":
        d = api_get("/api/admin/stats")
        s = d.get("stats", {}) if d.get("success") else {}
        await q.edit_message_text(
            f"📊 <b>THỐNG KÊ</b>\n\n"
            f"👥 Users: <b>{s.get('totalUsers', 0)}</b>\n"
            f"📦 Đơn: <b>{s.get('totalOrders', 0)}</b>\n"
            f"✅ Đã TT: <b>{s.get('paidOrders', 0)}</b>\n"
            f"💰 Doanh thu: <b>{s.get('revenue', 0):,}đ</b>",
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Quay lại", callback_data="admin_panel")]]),
        )
        return

    if q.data == "users":
        d = api_get("/api/admin/users?limit=10")
        users = d.get("users", []) if d.get("success") else []
        lines = [f"👥 <b>USERS ({len(users)})</b>\n"]
        for u in users[:10]:
            name = u.get('username') or u.get('email', 'N/A').split('@')[0]
            lines.append(f"• <b>{name}</b> — {u.get('balance', 0):,}đ")
        await q.edit_message_text(
            "\n".join(lines),
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Quay lại", callback_data="admin_panel")]]),
        )
        return

    if q.data == "orders_all":
        d = api_get("/api/admin/orders?limit=10")
        orders = d.get("orders", []) if d.get("success") else []
        lines = [f"📦 <b>ĐƠN HÀNG ({len(orders)})</b>\n"]
        for o in orders[:10]:
            icon = "✅" if o.get("status") == "paid" else "⏳"
            lines.append(f"{icon} <code>{o.get('orderCode', 'N/A')}</code> — {o.get('finalAmount', 0):,}đ")
        await q.edit_message_text(
            "\n".join(lines),
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Quay lại", callback_data="admin_panel")]]),
        )
        return

    if q.data == "pending":
        d = api_get("/api/admin/pending-transactions")
        p = d.get("pendingTransactions", []) if d.get("success") else []
        if not p:
            await q.edit_message_text(
                "✅ Không có GD chờ duyệt",
                reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Quay lại", callback_data="admin_panel")]]),
            )
            return
        lines = [f"⏳ <b>CHỜ DUYỆT ({len(p)})</b>\n"]
        for x in p[:10]:
            lines.append(f"• <code>{x.get('id', 'N/A')[:8]}</code> — {x.get('amount', 0):,}đ")
        await q.edit_message_text(
            "\n".join(lines),
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Quay lại", callback_data="admin_panel")]]),
        )
        return


async def echo(update, ctx):
    await update.message.reply_text("🤖 Gõ /help để xem lệnh")


async def post_init(app):
    cmds = [
        BotCommand("start", "Khởi động"),
        BotCommand("help", "Hướng dẫn"),
        BotCommand("id", "Lấy Chat ID"),
        BotCommand("balance", "Số dư"),
        BotCommand("orders", "Đơn hàng"),
        BotCommand("buy", "Mua VIP"),
        BotCommand("nap", "Nạp tiền"),
        BotCommand("hotro", "Hỗ trợ"),
    ]
    if ADMIN_IDS and ADMIN_IDS[0] != 0:
        cmds.extend([
            BotCommand("admin", "Admin Panel"),
            BotCommand("stats", "Thống kê"),
            BotCommand("users", "Users"),
            BotCommand("orders_all", "Tất cả đơn"),
            BotCommand("pending", "Chờ duyệt"),
        ])
    await app.bot.set_my_commands(cmds)


def main():
    if not BOT_TOKEN:
        print("❌ Thiếu BOT_TOKEN")
        sys.exit(1)
    print(f"🚀 Bot started | API: {API_URL} | Admins: {ADMIN_IDS}")
    app = Application.builder().token(BOT_TOKEN).build()

    # User commands
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_cmd))
    app.add_handler(CommandHandler("id", get_id))
    app.add_handler(CommandHandler("balance", balance_cmd))
    app.add_handler(CommandHandler("orders", orders_cmd))
    app.add_handler(CommandHandler("buy", buy_cmd))
    app.add_handler(CommandHandler("nap", nap_cmd))
    app.add_handler(CommandHandler("hotro", support_cmd))

    # Admin commands
    app.add_handler(CommandHandler("admin", admin_panel))
    app.add_handler(CommandHandler("stats", stats_cmd))
    app.add_handler(CommandHandler("users", users_cmd))
    app.add_handler(CommandHandler("orders_all", orders_all_cmd))
    app.add_handler(CommandHandler("pending", pending_cmd))
    app.add_handler(CommandHandler("approve", approve_cmd))
    app.add_handler(CommandHandler("reject", reject_cmd))
    app.add_handler(CommandHandler("add_balance", add_balance_cmd))
    app.add_handler(CommandHandler("broadcast", broadcast_cmd))
    app.add_handler(CommandHandler("find", find_cmd))
    app.add_handler(CommandHandler("ban", ban_cmd))
    app.add_handler(CommandHandler("unban", unban_cmd))

    # Callback + echo
    app.add_handler(CallbackQueryHandler(button_cb))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))

    app.post_init = post_init
    print("✅ Bot ready!")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
