const res = await fetch("http://localhost:3000/api/reviews?limit=100");
const data = await res.json();
console.log("Status:", res.status);
console.log("Success:", data.success);
console.log("Số reviews:", data.reviews?.length || 0);
console.log("Data:", JSON.stringify(data, null, 2).substring(0, 1000));
