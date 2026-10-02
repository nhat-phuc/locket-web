const BOT_TOKEN = process.env.8242832895:AAHaQDMwLOtTDiIND173K42SFTUz07jm7sM;
const CHAT_ID = process.env.-1004419641908;

if (!BOT_TOKEN || !CHAT_ID) {
  console.log("❌ Thiếu env TELEGRAM_BOT_TOKEN hoặc TELEGRAM_ADMIN_CHAT_ID");
  process.exit(1);
}

const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    chat_id: CHAT_ID,
    text: "🧪 Test từ Locket Gold",
    parse_mode: "HTML",
  }),
});
const data = await res.json();
console.log("Status:", res.status);
console.log("Data:", JSON.stringify(data, null, 2));

if (data.ok) {
  console.log("✅ Gửi thành công! Check Telegram group.");
} else {
  console.log("❌ Lỗi:", data.description);
}
