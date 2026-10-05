from telegram import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo


def main_menu():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("💰 Số dư", callback_data="sodu"),
         InlineKeyboardButton("📦 Đơn hàng", callback_data="donhang")],
        [InlineKeyboardButton("💳 Nạp tiền", callback_data="naptien"),
         InlineKeyboardButton("🎡 Vòng quay", callback_data="vongquay")],
        [InlineKeyboardButton("👤 Tài khoản", callback_data="taikhoan"),
         InlineKeyboardButton("❓ Trợ giúp", callback_data="help")],
    ])


def admin_menu():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("📊 Thống kê", callback_data="adm_stats"),
         InlineKeyboardButton("👥 Users", callback_data="adm_users")],
        [InlineKeyboardButton("🎡 Vòng quay", callback_data="adm_wheel"),
         InlineKeyboardButton("📦 Đơn hàng", callback_data="adm_orders")],
        [InlineKeyboardButton("💸 Rút tiền", callback_data="adm_withdrawals")],
    ])


def back_menu():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("⬅️ Quay lại", callback_data="menu")],
    ])
