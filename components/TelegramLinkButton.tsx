"use client";

import { useEffect, useState } from "react";

const BOT_USERNAME = process.env.NEXT_PUBLIC_BOT_USERNAME || "hethonglocket";

export default function TelegramLinkButton() {
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/telegram/status", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.linked) {
          setTelegramLinked(true);
          setTelegramId(d.telegramId);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!linkCode || telegramLinked) return;

    const check = async () => {
      try {
        const res = await fetch("/api/telegram/status", { credentials: "include" });
        const data = await res.json();
        if (data.success && data.linked) {
          setTelegramLinked(true);
          setTelegramId(data.telegramId);
          setLinkCode(null);
        }
      } catch {}
    };

    const interval = setInterval(check, 3000);
    return () => clearInterval(interval);
  }, [linkCode, telegramLinked]);

  const handleLink = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/telegram/generate-code", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();

      if (data.success && data.code) {
        setLinkCode(data.code);
        const tgUrl = `https://t.me/${BOT_USERNAME}?start=${data.code}`;
        window.open(tgUrl, "_blank");
      } else {
        alert(data.message || "Không tạo được mã");
      }
    } catch {
      alert("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (!confirm("Bạn có chắc muốn hủy liên kết Telegram?")) return;
    try {
      const res = await fetch("/api/telegram/unlink", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setTelegramLinked(false);
        setTelegramId(null);
        alert("Đã hủy liên kết");
      }
    } catch {
      alert("Lỗi kết nối");
    }
  };

  if (telegramLinked) {
    return (
      <div className="tk-telegram-box">
        <p className="tk-telegram-status" style={{ color: "#10b981", fontWeight: 700 }}>
          ✅ Đã liên kết Telegram
        </p>
        {telegramId && (
          <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 6 }}>
            Telegram ID: <code>{telegramId}</code>
          </p>
        )}
        <button
          className="tk-telegram-btn"
          style={{ background: "#ef4444", marginTop: 12 }}
          onClick={handleUnlink}
        >
          Hủy liên kết
        </button>
      </div>
    );
  }

  return (
    <div className="tk-telegram-box">
      {!linkCode ? (
        <>
          <p className="tk-telegram-status">Chưa liên kết tài khoản</p>
          <button
            className="tk-telegram-btn"
            onClick={handleLink}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13" />
              <path d="M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
            {loading ? "Đang tạo mã..." : "Liên kết ngay qua Bot"}
          </button>
        </>
      ) : (
        <>
          <p className="tk-telegram-status">Mã liên kết của bạn:</p>
          <div
            style={{
              display: "inline-block",
              padding: "10px 20px",
              background: "rgba(167, 139, 250, 0.15)",
              border: "2px dashed #a78bfa",
              borderRadius: 10,
              fontFamily: "ui-monospace, monospace",
              fontSize: 16,
              fontWeight: 900,
              color: "#7c3aed",
              letterSpacing: 1,
              marginBottom: 12,
            }}
          >
            {linkCode}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 12 }}>
            Bấm <b>Start</b> trong Telegram để tự động liên kết.
          </p>
          <a
            href={`https://t.me/${BOT_USERNAME}?start=${linkCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tk-telegram-btn"
            style={{ display: "inline-flex", textDecoration: "none", marginBottom: 12 }}
          >
            🌐 Mở Telegram
          </a>
          <div style={{ fontSize: 12, color: "var(--text-2)" }}>
            ⏳ Đang chờ xác nhận...
          </div>
        </>
      )}
    </div>
  );
}
