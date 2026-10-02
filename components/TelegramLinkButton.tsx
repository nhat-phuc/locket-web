"use client";

import { useState } from "react";

export default function TelegramLinkButton() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/telegram/generate-code", { method: "POST" });
      const data = await res.json();
      if (data.success) setCode(data.code);
    } catch {}
    setLoading(false);
  };

  return (
    <div style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 12 }}>
      <h3 style={{ marginBottom: 12 }}>🔗 Liên kết Telegram</h3>
      {!code ? (
        <button onClick={handleGenerate} disabled={loading} style={{
          padding: "12px 20px", background: "#0088cc", color: "#fff",
          border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer",
        }}>
          {loading ? "Đang tạo..." : "Tạo mã liên kết"}
        </button>
      ) : (
        <div>
          <p>Gửi mã này cho bot Telegram:</p>
          <div style={{
            fontSize: 32, fontWeight: 900, letterSpacing: 8,
            padding: 16, background: "#f0f9ff", borderRadius: 8,
            textAlign: "center", marginBottom: 12, color: "#0088cc",
          }}>
            {code}
          </div>
          <p style={{ fontSize: 13, color: "#666" }}>
            Cú pháp: <code>/link {code}</code>
          </p>
          <a href="https://t.me/YOUR_BOT_USERNAME" target="_blank" style={{
            display: "inline-block", padding: "10px 20px", background: "#0088cc",
            color: "#fff", textDecoration: "none", borderRadius: 8, fontWeight: 700,
          }}>
            Mở Bot Telegram →
          </a>
        </div>
      )}
    </div>
  );
}
