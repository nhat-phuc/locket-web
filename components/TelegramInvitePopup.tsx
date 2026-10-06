"use client";

import { useEffect, useState } from "react";

export default function TelegramInvitePopup() {
  const [show, setShow] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Đọc user từ sessionStorage
    const stored = sessionStorage.getItem("locket_user");
    if (!stored) return;

    let u: any = null;
    try { u = JSON.parse(stored); } catch { return; }
    if (!u?.id) return;

    setUser(u);

    // Nếu đã bấm "Để sau" trong 24h → không hiện
    const dismissed = localStorage.getItem("tg_invite_dismissed");
    if (dismissed) {
      const ts = parseInt(dismissed, 10);
      if (Date.now() - ts < 24 * 60 * 60 * 1000) return;
    }

    // Đã link Telegram chưa? (dựa vào localStorage)
    const linked = localStorage.getItem("tg_linked_" + u.id);
    if (linked === "1") return;

    // Đợi 2s rồi hiện
    const t = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "amirose_bot";

  const handleOpenBot = () => {
    if (!user?.id) return;
    const url = `https://t.me/${BOT_USERNAME}?start=${user.id}`;
    window.open(url, "_blank");
    setShow(false);

    // Đánh dấu đã bấm link
    localStorage.setItem("tg_linked_" + user.id, "1");
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("tg_invite_dismissed", String(Date.now()));
  };

  if (!show || !user) return null;

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(15,23,42,.6)", backdropFilter: "blur(4px)",
      zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "32px 24px",
        maxWidth: 420, width: "100%", textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,.3)",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg, #229ED9, #4FC3F7)",
          display: "grid", placeItems: "center",
          margin: "0 auto 16px", fontSize: 36,
        }}>📱</div>

        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 10, color: "#0f172a" }}>
          Nhận thông báo qua Telegram
        </h2>

        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24, lineHeight: 1.6 }}>
          Bạn muốn nhận thông báo đơn hàng, số dư, khuyến mãi qua Telegram?
          Chỉ cần bấm 1 lần — bot sẽ tự động liên kết.
        </p>

        <button
          onClick={handleOpenBot}
          style={{
            width: "100%", padding: "14px 20px",
            background: "linear-gradient(135deg, #229ED9, #4FC3F7)",
            color: "#fff", border: "none", borderRadius: 12,
            fontSize: 15, fontWeight: 800, cursor: "pointer",
            marginBottom: 10,
            boxShadow: "0 8px 20px rgba(34,158,217,.35)",
          }}
        >
          🔗 Mở Bot Telegram
        </button>

        <button
          onClick={handleDismiss}
          style={{
            width: "100%", padding: "12px 20px",
            background: "transparent", color: "#64748b",
            border: "1px solid #e2e8f0", borderRadius: 12,
            fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}
        >
          Để sau
        </button>
      </div>
    </div>
  );
}
