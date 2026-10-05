import os
from dotenv import load_dotenv

load_dotenv()

# Bot
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
ADMIN_IDS = [int(x) for x in os.getenv("TELEGRAM_ADMIN_IDS", "").split(",") if x.strip()]

# Next.js API
API_URL = os.getenv("API_URL", "http://localhost:3000")
INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY", "")  # optional

# Web
WEB_URL = os.getenv("WEB_URL", "http://localhost:3000")

# Validate
if not BOT_TOKEN:
    raise ValueError("Thiếu TELEGRAM_BOT_TOKEN trong .env")
