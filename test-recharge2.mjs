// 1. Login để lấy cookie
console.log("=== 1. Login ===");
const loginRes = await fetch("http://localhost:3000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "phuc287@gmail.com",
    password: "MAT_KHAU_CUA_BAN",  // ← ĐỔI MẬT KHẨU THẬT VÀO ĐÂY
  }),
});
const loginData = await loginRes.json();
console.log("Login status:", loginRes.status);
console.log("Login data:", loginData);

if (!loginData.success) {
  console.log("❌ Login failed");
  process.exit(1);
}

// Lấy cookie từ response
const setCookie = loginRes.headers.get("set-cookie");
console.log("Cookie:", setCookie ? "✅ có" : "❌ không");
