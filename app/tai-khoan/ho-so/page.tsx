"use client";

import { useEffect, useState } from "react";

export default function HoSoPage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
          setName(data.user.name || "");
          setPhone(data.user.phone || "");
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    const data = await res.json();
    setMessage(data.success ? "✅ Cập nhật thành công" : "❌ " + data.message);
    setSaving(false);
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--text-2)" }}>Đang tải...</div>;

  return (
    <>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>Thông tin cá nhân</h1>

      {message && <div style={{ padding: 12, borderRadius: 10, background: message.includes("✅") ? "rgba(52,211,153,.1)" : "rgba(248,113,113,.1)", color: message.includes("✅") ? "#34d399" : "#f87171", marginBottom: 16, fontSize: 14 }}>{message}</div>}

      <div className="auth-form">
        <div className="auth-field">
          <label>Email (không thể đổi)</label>
          <input type="email" value={user?.email || ""} disabled style={{ opacity: 0.6 }} />
        </div>
        <div className="auth-field">
          <label>Username (không thể đổi)</label>
          <input type="text" value={user?.username || ""} disabled style={{ opacity: 0.6 }} />
        </div>
        <div className="auth-field">
          <label>Tên hiển thị</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" />
        </div>
        <div className="auth-field">
          <label>Số điện thoại</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0912345678" />
        </div>
        <button onClick={handleSave} disabled={saving} className="auth-btn">
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </>
  );
}
