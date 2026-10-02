"use client";

import { useState } from "react";

export default function TelegramLinkButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLink = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/telegram/generate-code", { method: "POST" });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Lỗi tạo link");
        setLoading(false);
        return;
      }

      // Mở Telegram bot với token
      window.open(data.deepLink, "_blank");
      setLoading(false);
    } catch {
      setError("Lỗi kết nối");
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: 20,
      border: "1px solid var(--border)",
      borderRadius: 16,
      background: "var(--bg-1)",
    }}>
      <h3 style={{ marginBottom: 8, fontSize: 18, fontWeight: 800 }}>
        🔗 Liên kết Telegram
      </h3>
      <p style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 16 }}>
        Bấm nút bên dưới → Bot Telegram sẽ tự động mở và liên kết tài khoản của bạn
      </p>

      {error && (
        <div style={{
          padding: 10, background: "#fef2f2", color: "#dc2626",
          borderRadius: 8, marginBottom: 12, fontSize: 13,
        }}>
          ⚠️ {error}
        </div>
      )}

      <button
        onClick={handleLink}
        disabled={loading}
        style={{
          width: "100%", padding: "16px 20px",
          background: loading ? "#94a3b8" : "linear-gradient(135deg, #0088cc, #00a8e8)",
          color: "#fff", border: "none", borderRadius: 12,
          fontWeight: 800, fontSize: 16, cursor: loading ? "wait" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "all 0.2s",
          boxShadow: loading ? "none" : "0 8px 24px rgba(0, 136, 204, 0.3)",
        }}
      >
        <span style={{ fontSize: 20 }}>📱</span>
        {loading ? "Đang mở Telegram..." : "Liên kết Telegram ngay"}
      </button>

      <p style={{ color: "var(--text-2)", fontSize: 12, marginTop: 12, textAlign: "center" }}>
        Bot sẽ tự động nhận diện tài khoản của bạn
      </p>
    </div>
  );
}
