import { readFileSync } from "fs";

const envFile = readFileSync(".env.local", "utf-8");
envFile.split("\n").forEach((line) => {
  const match = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
  if (match) process.env[match[1]] = match[2];
});

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

console.log("BOT_TOKEN:", BOT_TOKEN ? "✅ có" : "❌ không");
console.log("ADMIN_CHAT_ID:", CHAT_ID);

const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    chat_id: CHAT_ID,
    text: "🧪 Test thông báo admin rút tiền từ Locket Gold",
    parse_mode: "HTML",
  }),
});
const data = await res.json();
console.log("Status:", res.status);
console.log("Data:", JSON.stringify(data, null, 2));

if (data.ok) {
  console.log("\n✅ Gửi thành công! Check Telegram group admin.");
} else {
  console.log("\n❌ Lỗi:", data.description);
}
