"use client";

import { useState } from "react";

export default function CaiDatPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (newPassword !== confirm) {
      setMessage("❌ Mật khẩu xác nhận không khớp");
      return;
    }
    if (newPassword.length < 6) {
      setMessage("❌ Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setMessage(data.success ? "✅ Đổi mật khẩu thành công" : "❌ " + data.message);
    if (data.success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    }
    setLoading(false);
  };

  return (
    <>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>Cài đặt</h1>

      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Đổi mật khẩu</h2>

      {message && <div style={{ padding: 12, borderRadius: 10, background: message.includes("✅") ? "rgba(52,211,153,.1)" : "rgba(248,113,113,.1)", color: message.includes("✅") ? "#34d399" : "#f87171", marginBottom: 16, fontSize: 14 }}>{message}</div>}

      <form onSubmit={handleChangePassword} className="auth-form">
        <div className="auth-field">
          <label>Mật khẩu hiện tại</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
        </div>
        <div className="auth-field">
          <label>Mật khẩu mới</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
        </div>
        <div className="auth-field">
          <label>Xác nhận mật khẩu mới</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
        </button>
      </form>
    </>
  );
}
