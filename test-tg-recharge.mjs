const res = await fetch("http://localhost:3000/api/telegram/recharge", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ telegramId: "test123", amount: 50000 }),
});
const data = await res.json();
console.log("Status:", res.status);
console.log("Data:", JSON.stringify(data, null, 2));
