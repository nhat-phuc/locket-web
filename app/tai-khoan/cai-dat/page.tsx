"use client";

import { useState, useEffect } from "react";

export default function CaiDatPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [unlinking, setUnlinking] = useState(false);
  const [linkMsg, setLinkMsg] = useState("");

  const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "amirose_bot";

  useEffect(() => {
    fetch("/api/users/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setUser(d.user); })
      .catch(() => {});
  }, []);

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

  const handleLinkTelegram = () => {
    if (!user?.id) return;
    // Link t.me/amirose_bot?start=<userId>
    const url = `https://t.me/${BOT_USERNAME}?start=${user.id}`;
    window.open(url, "_blank");
    setLinkMsg("👉 Mở Telegram và nhấn START để hoàn tất liên kết");
  };

  const handleUnlink = async () => {
    if (!confirm("Hủy liên kết Telegram?")) return;
    setUnlinking(true);
    try {
      const res = await fetch("/api/telegram/unlink", {
        method: "POST",
        credentials: "include",
      });
      const d = await res.json();
      if (d.success) {
        setLinkMsg("✅ Đã hủy liên kết");
        setUser({ ...user, telegramId: null });
      } else {
        setLinkMsg("❌ " + (d.message || "Lỗi"));
      }
    } catch {
      setLinkMsg("❌ Lỗi kết nối");
    } finally {
      setUnlinking(false);
    }
  };

  return (
    <>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>Cài đặt</h1>

      {/* ── LIÊN KẾT TELEGRAM ── */}
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>📱 Liên kết Telegram</h2>

      {linkMsg && (
        <div style={{ padding: 12, borderRadius: 10, background: linkMsg.includes("✅") ? "rgba(52,211,153,.1)" : "rgba(167,139,250,.1)", color: linkMsg.includes("✅") ? "#34d399" : "#a78bfa", marginBottom: 16, fontSize: 14 }}>
          {linkMsg}
        </div>
      )}

      <div style={{
        background: "var(--bg-1)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 20,
        marginBottom: 32,
      }}>
        {user?.telegramId ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #229ED9, #4FC3F7)", display: "grid", placeItems: "center", fontSize: 24 }}>
                ✅
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Đã liên kết Telegram</div>
                <div style={{ fontSize: 13, color: "var(--text-2)" }}>ID: {user.telegramId}</div>
              </div>
            </div>
            <button
              onClick={handleUnlink}
              disabled={unlinking}
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                background: "transparent",
                border: "1px solid #ef4444",
                color: "#ef4444",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              {unlinking ? "Đang hủy..." : "🔓 Hủy liên kết"}
            </button>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #229ED9, #4FC3F7)", display: "grid", placeItems: "center", fontSize: 24 }}>
                📱
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Chưa liên kết</div>
                <div style={{ fontSize: 13, color: "var(--text-2)" }}>
                  Nhận thông báo đơn hàng, số dư qua Telegram
                </div>
              </div>
            </div>
            <button
              onClick={handleLinkTelegram}
              style={{
                padding: "14px 24px",
                borderRadius: 12,
                background: "linear-gradient(135deg, #229ED9, #4FC3F7)",
                color: "#fff",
                border: "none",
                fontWeight: 800,
                cursor: "pointer",
                fontSize: 15,
                boxShadow: "0 8px 20px rgba(34,158,217,.35)",
              }}
            >
              🔗 Liên kết Telegram
            </button>
          </>
        )}
      </div>

      {/* ── ĐỔI MẬT KHẨU ── */}
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>🔒 Đổi mật khẩu</h2>

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
