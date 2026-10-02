const res = await fetch("http://localhost:3000/api/payments/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ orderId: "test" }),
});
const data = await res.json();
console.log("Status:", res.status);
console.log("Data:", data);
