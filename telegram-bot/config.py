import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
ADMIN_IDS = [int(x) for x in os.getenv("TELEGRAM_ADMIN_IDS", "").split(",") if x.strip()]
ADMIN_GROUP_ID = os.getenv("TELEGRAM_ADMIN_GROUP_ID", "")
API_URL = os.getenv("API_URL", "http://localhost:3000")
WEB_URL = os.getenv("WEB_URL", "http://localhost:3000")

if not BOT_TOKEN:
    raise ValueError("Thiếu TELEGRAM_BOT_TOKEN trong .env")
