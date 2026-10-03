"use client";

import { useEffect, useState } from "react";

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
}

const DISMISS_KEY = "locket_noti_dismissed";
const DISMISS_HOURS = 24;

export default function NotificationPopup() {
  const [noti, setNoti] = useState<Notification | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check localStorage — đã bấm "Đã hiểu" trong 24h chưa
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      if (raw) {
        const { id, at } = JSON.parse(raw);
        const hoursPassed = (Date.now() - at) / (1000 * 60 * 60);
        if (hoursPassed < DISMISS_HOURS) {
          // Còn trong 24h → không hiện (trừ khi là thông báo mới khác id)
          // Nhưng vẫn cần fetch để check id mới
        }
      }
    } catch {}

    fetch("/api/notifications/latest")
      .then((r) => r.json())
      .then((d) => {
        if (!d.success || !d.notification) return;

        // Check đã dismiss thông báo này chưa
        try {
          const raw = localStorage.getItem(DISMISS_KEY);
          if (raw) {
            const { id, at } = JSON.parse(raw);
            const hoursPassed = (Date.now() - at) / (1000 * 60 * 60);
            if (id === d.notification.id && hoursPassed < DISMISS_HOURS) {
              return; // Cùng id + trong 24h → không hiện
            }
          }
        } catch {}

        // Hiện popup
        setNoti(d.notification);
        setTimeout(() => setShow(true), 800);
      })
      .catch(() => {});
  }, []);

  const dismiss = () => {
    if (!noti) return;
    try {
      localStorage.setItem(
        DISMISS_KEY,
        JSON.stringify({ id: noti.id, at: Date.now() })
      );
    } catch {}
    setShow(false);
    setTimeout(() => setNoti(null), 300);
  };

  if (!noti) return null;

  const typeColor = {
    info: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
  }[noti.type] || "#7c3aed";

  const typeIcon = {
    info: "ℹ️",
    success: "🎉",
    warning: "⚠️",
    error: "❌",
  }[noti.type] || "📢";

  return (
    <div
      className={`noti-overlay ${show ? "noti-show" : ""}`}
      onClick={dismiss}
    >
      <div className="noti-box" onClick={(e) => e.stopPropagation()}>
        <div className="noti-head" style={{ background: typeColor }}>
          <div className="noti-icon">{typeIcon}</div>
          <div className="noti-type">{noti.type.toUpperCase()}</div>
        </div>

        <div className="noti-body">
          <h3 className="noti-title">{noti.title}</h3>
          <p className="noti-content">{noti.content}</p>
          <div className="noti-time">
            {new Date(noti.createdAt).toLocaleString("vi-VN")}
          </div>
        </div>

        <div className="noti-foot">
          <button onClick={dismiss} className="noti-btn">
            Đã hiểu
          </button>
        </div>
      </div>

      <style jsx>{`
        .noti-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0);
          backdrop-filter: blur(0px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 20px;
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s ease;
        }
        .noti-overlay.noti-show {
          opacity: 1;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(6px);
          pointer-events: auto;
        }

        .noti-box {
          background: #fff;
          border-radius: 20px;
          max-width: 440px;
          width: 100%;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
          transform: scale(0.9) translateY(20px);
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .noti-overlay.noti-show .noti-box {
          transform: scale(1) translateY(0);
        }

        .noti-head {
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #fff;
        }
        .noti-icon {
          font-size: 32px;
          line-height: 1;
        }
        .noti-type {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          opacity: 0.9;
        }

        .noti-body {
          padding: 24px;
        }
        .noti-title {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 10px;
          line-height: 1.3;
        }
        .noti-content {
          font-size: 14px;
          color: #475569;
          line-height: 1.6;
          margin: 0 0 12px;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .noti-time {
          font-size: 11px;
          color: #94a3b8;
        }

        .noti-foot {
          padding: 0 24px 24px;
        }
        .noti-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.18s;
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.3);
        }
        .noti-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(124, 58, 237, 0.4);
        }
      `}</style>
    </div>
  );
}
