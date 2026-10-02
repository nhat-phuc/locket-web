const res1 = await fetch("http://localhost:3000/api/recharge/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "phuc287@gmail.com",
    username: "phuc2001",
    amount: 50000,
    content: "TEST123",
    orderCode: "TEST123",
  }),
});
const data1 = await res1.json();
console.log("Status:", res1.status);
console.log("Data:", JSON.stringify(data1, null, 2));
