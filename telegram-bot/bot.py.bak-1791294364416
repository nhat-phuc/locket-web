#!/usr/bin/env python3
"""
Bot Telegram cho Locket Gold
Chạy: python bot.py
"""
import logging
from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    MessageHandler,
    filters,
)
from config import BOT_TOKEN, ADMIN_IDS
from handlers import user, admin

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)


async def error_handler(update: object, ctx):
    logger.error("Exception:", exc_info=ctx.error)


def main():
    logger.info(f"🤖 Bot đang khởi động... Admin IDs: {ADMIN_IDS}")

    app = Application.builder().token(BOT_TOKEN).build()

    # User commands
    
    app.add_handler(CommandHandler("start", user.cmd_start))
    app.add_handler(CommandHandler("help", user.cmd_help))
    app.add_handler(CommandHandler("sodu", user.cmd_sodu))
    app.add_handler(CommandHandler("donhang", user.cmd_donhang))
    app.add_handler(CommandHandler("naptien", user.cmd_naptien))
    app.add_handler(CommandHandler("vongquay", user.cmd_vongquay))
    app.add_handler(CommandHandler("taikhoan", user.cmd_taikhoan))
    app.add_handler(CommandHandler("admin", admin.cmd_admin))

    # Callback (buttons)
    app.add_handler(CallbackQueryHandler(user.cb_router, pattern="^(?!adm_).*$"))
    app.add_handler(CallbackQueryHandler(admin.cb_admin_router, pattern="^adm_.*$"))

    # Text
    # Admin text handler — xử lý trước
    async def text_router(update, context):
        handled = await admin.handle_admin_text(update, context)
        if not handled:
            await user.handle_text(update, context)

    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, text_router))

    # Error
    app.add_error_handler(error_handler)

    logger.info("✅ Bot đã sẵn sàng!")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
