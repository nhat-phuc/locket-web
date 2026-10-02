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
        setError(data.message || "Lỗi");
        setLoading(false);
        return;
      }

      window.open(data.deepLink, "_blank");
      setLoading(false);
    } catch {
      setError("Lỗi kết nối");
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: 24, border: "2px solid #0088cc",
      borderRadius: 16, background: "#f0f9ff",
    }}>
      <h3 style={{ marginBottom: 8, fontSize: 20, fontWeight: 800 }}>
        🔗 Liên kết Telegram
      </h3>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 20 }}>
        Bấm nút bên dưới để mở bot và liên kết tài khoản tự động
      </p>

      {error && (
        <div style={{
          padding: 12, background: "#fef2f2", color: "#dc2626",
          borderRadius: 8, marginBottom: 16, fontSize: 13,
        }}>⚠️ {error}</div>
      )}

      <button onClick={handleLink} disabled={loading} style={{
        width: "100%", padding: "16px 24px",
        background: loading ? "#94a3b8" : "#0088cc",
        color: "#fff", border: "none", borderRadius: 12,
        fontWeight: 800, fontSize: 16,
        cursor: loading ? "wait" : "pointer",
        display: "flex", alignItems: "center",
        justifyContent: "center", gap: 8,
      }}>
        📱 {loading ? "Đang mở..." : "Liên kết ngay"}
      </button>
    </div>
  );
}
