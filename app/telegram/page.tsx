"use client";

import { useEffect, useState } from "react";

export default function TelegramPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-webapp">("loading");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Load Telegram WebApp SDK
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.onload = () => {
      const tg = (window as any).Telegram?.WebApp;
      if (!tg || !tg.initDataUnsafe?.user?.id) {
        setStatus("no-webapp");
        setMessage("Vui lòng mở trang này từ Telegram Bot");
        return;
      }

      tg.ready();
      tg.expand();

      const telegramId = String(tg.initDataUnsafe.user.id);

      // Gọi API liên kết
      fetch("/api/telegram/link-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ telegramId }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            setStatus("success");
            setMessage("Liên kết thành công!");
            // Đóng WebApp sau 2s
            setTimeout(() => {
              try { tg.close(); } catch {}
            }, 2000);
          } else {
            setStatus("error");
            setMessage(d.message || "Lỗi liên kết");
          }
        })
        .catch(() => {
          setStatus("error");
          setMessage("Không kết nối được server");
        });
    };
    document.head.appendChild(script);

    return () => {
      try { document.head.removeChild(script); } catch {}
    };
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 20,
        padding: "40px 30px",
        maxWidth: 400,
        width: "100%",
        textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,.3)",
      }}>
        {status === "loading" && (
          <>
            <div style={{ fontSize: 56, marginBottom: 16 }}>⏳</div>
            <h1 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>
              Đang liên kết...
            </h1>
            <p style={{ color: "#64748b", fontSize: 14 }}>
              Vui lòng đợi trong giây lát
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, color: "#10b981" }}>
              Liên kết thành công!
            </h1>
            <p style={{ color: "#64748b", fontSize: 14 }}>
              Quay lại Telegram để sử dụng bot
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
            <h1 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8, color: "#ef4444" }}>
              Không liên kết được
            </h1>
            <p style={{ color: "#64748b", fontSize: 14 }}>{message}</p>
            <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 16 }}>
              Bạn cần đăng nhập web trước khi mở Telegram
            </p>
          </>
        )}

        {status === "no-webapp" && (
          <>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📱</div>
            <h1 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>
              Mở từ Telegram
            </h1>
            <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
              Trang này chỉ hoạt động khi mở từ bot Telegram.<br />
              Vui lòng nhấn nút <b>"🚀 Mở Locket Gold"</b> trong bot.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
