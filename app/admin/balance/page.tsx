"use client";

import { useState } from "react";

export default function AdminBalancePage() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (type: "add" | "subtract") => {
    if (!email || !amount) {
      setError("Nhập email và số tiền");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amount: Number(amount),
          type,
          reason: reason || (type === "add" ? "Admin cộng" : "Admin trừ"),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Đã ${type === "add" ? "cộng" : "trừ"} ${Number(amount).toLocaleString("vi-VN")}đ cho ${email}`);
        setEmail("");
        setAmount("");
        setReason("");
      } else {
        setError(data.message || "Lỗi");
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ab-page">
      <div className="ab-container">
        <h1 className="ab-title">💳 Điều chỉnh số dư</h1>
        <p className="ab-sub">Cộng/trừ số dư user thủ công</p>

        <div className="ab-form">
          <label>Email user</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@gmail.com"
          />

          <label>Số tiền (VNĐ)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100000"
          />

          <label>Lý do</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Bồi thường, khuyến mãi..."
          />

          {error && <div className="ab-error">⚠️ {error}</div>}
          {message && <div className="ab-success">✅ {message}</div>}

          <div className="ab-actions">
            <button onClick={() => handleSubmit("add")} disabled={loading} className="ab-btn ab-btn-add">
              ➕ Cộng tiền
            </button>
            <button onClick={() => handleSubmit("subtract")} disabled={loading} className="ab-btn ab-btn-sub">
              ➖ Trừ tiền
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        .ab-page { min-height: 100vh; padding: 32px 20px 80px; background: var(--bg-0); }
        .ab-container { max-width: 500px; margin: 0 auto; }
        .ab-title { font-size: 26px; font-weight: 900; color: var(--text-0); margin: 0 0 4px; }
        .ab-sub { font-size: 13px; color: var(--text-2); margin: 0 0 24px; }
        .ab-form { display: flex; flex-direction: column; gap: 10px; padding: 24px; border-radius: 20px; background: rgba(255,255,255,0.7); border: 1.5px solid rgba(167,139,250,0.2); }
        .ab-form label { font-size: 12px; font-weight: 700; color: var(--text-0); margin-top: 4px; }
        .ab-form input { padding: 12px 16px; border-radius: 12px; background: #f2f2f7; border: 1.5px solid transparent; font-size: 14px; font-family: inherit; outline: none; }
        .ab-form input:focus { background: #fff; border-color: #a78bfa; box-shadow: 0 0 0 3px rgba(167,139,250,0.15); }
        .ab-error { padding: 10px; border-radius: 10px; background: rgba(239,68,68,0.08); color: #ef4444; font-size: 12px; font-weight: 600; }
        .ab-success { padding: 10px; border-radius: 10px; background: rgba(34,197,94,0.08); color: #22c55e; font-size: 12px; font-weight: 600; }
        .ab-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
        .ab-btn { padding: 14px; border-radius: 12px; border: none; font-size: 14px; font-weight: 800; cursor: pointer; transition: all 0.2s; }
        .ab-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .ab-btn-add { background: linear-gradient(135deg,#22c55e,#16a34a); color: #fff; box-shadow: 0 8px 24px rgba(34,197,94,0.3); }
        .ab-btn-sub { background: linear-gradient(135deg,#ef4444,#dc2626); color: #fff; box-shadow: 0 8px 24px rgba(239,68,68,0.3); }
      `}</style>
    </main>
  );
}
