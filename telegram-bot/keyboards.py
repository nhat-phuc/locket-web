from telegram import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from config import WEB_URL


def main_menu():
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("💰 Số dư", callback_data="sodu"),
            InlineKeyboardButton("📦 Đơn hàng", callback_data="donhang"),
        ],
        [
            InlineKeyboardButton("💳 Nạp tiền", callback_data="naptien"),
            InlineKeyboardButton("📜 Lịch sử nạp", callback_data="ls_nap"),
        ],
        [
            InlineKeyboardButton("🎡 Vòng quay", callback_data="vongquay"),
            InlineKeyboardButton("👤 Tài khoản", callback_data="taikhoan"),
        ],
        [
            InlineKeyboardButton("🔍 Tra cứu đơn", callback_data="tra_cuu"),
            InlineKeyboardButton("❓ Trợ giúp", callback_data="help"),
        ],
        [
            InlineKeyboardButton("🚀 Mở Web Locket Gold", web_app=WebAppInfo(url=WEB_URL)),
        ],
    ])


def admin_menu():
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("📊 Thống kê", callback_data="adm_stats"),
            InlineKeyboardButton("👥 Users", callback_data="adm_users"),
        ],
        [
            InlineKeyboardButton("🎡 Vòng quay", callback_data="adm_wheel"),
            InlineKeyboardButton("📦 Đơn hàng", callback_data="adm_orders"),
        ],
        [
            InlineKeyboardButton("💸 Rút tiền", callback_data="adm_withdrawals"),
        ],
        [
            InlineKeyboardButton("⬅️ Menu chính", callback_data="menu"),
        ],
    ])


def back_menu():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🏠 Menu chính", callback_data="menu")],
    ])


def amount_menu():
    """Menu chọn số tiền nạp"""
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("10.000đ", callback_data="amt_10000"),
            InlineKeyboardButton("20.000đ", callback_data="amt_20000"),
            InlineKeyboardButton("50.000đ", callback_data="amt_50000"),
        ],
        [
            InlineKeyboardButton("100.000đ", callback_data="amt_100000"),
            InlineKeyboardButton("200.000đ", callback_data="amt_200000"),
            InlineKeyboardButton("500.000đ", callback_data="amt_500000"),
        ],
        [
            InlineKeyboardButton("1.000.000đ", callback_data="amt_1000000"),
            InlineKeyboardButton("2.000.000đ", callback_data="amt_2000000"),
            InlineKeyboardButton("5.000.000đ", callback_data="amt_5000000"),
        ],
        [
            InlineKeyboardButton("✏️ Nhập số khác", callback_data="amt_custom"),
        ],
        [
            InlineKeyboardButton("⬅️ Quay lại", callback_data="menu"),
        ],
    ])


def qr_menu(qr_url: str, order_code: str):
    """Menu khi đã có QR"""
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("📱 Mở QR thanh toán", url=qr_url)],
        [
            InlineKeyboardButton("🔄 Kiểm tra TT", callback_data=f"check_{order_code}"),
            InlineKeyboardButton("📋 Copy mã", callback_data=f"copy_{order_code}"),
        ],
        [InlineKeyboardButton("🏠 Menu chính", callback_data="menu")],
    ])


def check_menu(order_code: str):
    """Menu sau khi check trạng thái"""
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🔄 Kiểm tra lại", callback_data=f"check_{order_code}")],
        [InlineKeyboardButton("🏠 Menu chính", callback_data="menu")],
    ])
