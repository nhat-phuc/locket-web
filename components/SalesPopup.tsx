"use client";

import { useEffect, useState } from "react";

interface PopupData {
  popup_enabled: string;
  popup_title: string;
  popup_content: string;
  popup_icon: string;
  popup_button: string;
  popup_close_hours: string;
}

const DISMISS_KEY = "locket_sales_popup_dismissed";

export default function SalesPopup() {
  const [show, setShow] = useState(false);
  const [data, setData] = useState<PopupData | null>(null);

  useEffect(() => {
    fetch("/api/site-popup")
      .then((r) => r.json())
      .then((d) => {
        if (!d.success || !d.popup) return;
        const p: PopupData = d.popup;
        if (p.popup_enabled !== "true") return;

        // Kiểm tra đã đóng trong N giờ chưa
        try {
          const raw = localStorage.getItem(DISMISS_KEY);
          if (raw) {
            const { at } = JSON.parse(raw);
            const hours = Number(p.popup_close_hours) || 24;
            const passed = (Date.now() - at) / (1000 * 60 * 60);
            if (passed < hours) return;
          }
        } catch {}

        setData(p);
        setTimeout(() => setShow(true), 1200);
      })
      .catch(() => {});
  }, []);

  const close = (remember: boolean) => {
    if (remember) {
      try { localStorage.setItem(DISMISS_KEY, JSON.stringify({ at: Date.now() })); } catch {}
    }
    setShow(false);
  };

  if (!data) return null;

  return (
    <div className={`sp-overlay ${show ? "sp-show" : ""}`} onClick={() => close(false)}>
      <div className="sp-box" onClick={(e) => e.stopPropagation()}>
        <button className="sp-x" onClick={() => close(false)}>✕</button>

        <h2 className="sp-title">{data.popup_title}</h2>

        <div className="sp-body">
          <div className="sp-icon">{data.popup_icon}</div>
          <p className="sp-text">{data.popup_content}</p>
        </div>

        <div className="sp-actions">
          <button className="sp-btn-main" onClick={() => close(true)}>
            {data.popup_button}
          </button>
          <button className="sp-btn-sub" onClick={() => close(true)}>
            Đóng trong {data.popup_close_hours}h tới
          </button>
        </div>
      </div>

      <style jsx>{`
        .sp-overlay {
          position: fixed; inset: 0;
          background: rgba(15, 10, 30, 0);
          backdrop-filter: blur(0px);
          display: flex; align-items: center; justify-content: center;
          z-index: 99998; padding: 20px;
          opacity: 0; pointer-events: none;
          transition: all .3s;
        }
        .sp-overlay.sp-show {
          opacity: 1;
          background: rgba(15, 10, 30, 0.55);
          backdrop-filter: blur(6px);
          pointer-events: auto;
        }
        .sp-box {
          position: relative;
          background: #fff;
          border-radius: 24px;
          padding: 32px 28px 24px;
          max-width: 480px;
          width: 100%;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
          transform: scale(0.9) translateY(20px);
          transition: transform .35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .sp-overlay.sp-show .sp-box {
          transform: scale(1) translateY(0);
        }
        .sp-x {
          position: absolute; top: 14px; right: 14px;
          width: 32px; height: 32px;
          border-radius: 10px;
          background: transparent; border: none;
          color: #94a3b8; font-size: 16px;
          cursor: pointer;
        }
        .sp-x:hover { background: #f1f5f9; color: #0f0a1e; }
        .sp-title {
          font-size: 24px; font-weight: 900;
          margin: 0 0 20px;
          text-align: center;
          color: #0d9488;
          background: linear-gradient(135deg, #0d9488, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .sp-body {
          display: flex; gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, #fdf4ff, #fce7f3);
          border-radius: 16px;
          margin-bottom: 20px;
        }
        .sp-icon {
          font-size: 36px;
          width: 56px; height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a78bfa, #ec4899);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 8px 24px rgba(167, 139, 250, 0.5);
        }
        .sp-text {
          margin: 0;
          font-size: 14px; line-height: 1.6;
          color: #4b5563;
          white-space: pre-wrap;
        }
        .sp-actions {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
        }
        .sp-btn-main {
          padding: 14px;
          background: linear-gradient(135deg, #06b6d4, #0ea5e9);
          color: #fff; border: none;
          border-radius: 12px;
          font-size: 15px; font-weight: 800;
          cursor: pointer;
          font-family: inherit;
        }
        .sp-btn-main:hover { transform: translateY(-2px); }
        .sp-btn-sub {
          padding: 14px;
          background: #fff;
          color: #ef4444;
          border: 1px solid #fecaca;
          border-radius: 12px;
          font-size: 15px; font-weight: 800;
          cursor: pointer;
          font-family: inherit;
        }
        .sp-btn-sub:hover { background: #fef2f2; }
        @media (max-width: 480px) {
          .sp-actions { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
