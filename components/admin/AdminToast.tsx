"use client";

import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

let toastFn: ((type: ToastType, title: string, message?: string) => void) | null = null;

export function showToast(type: ToastType, title: string, message?: string) {
  if (toastFn) toastFn(type, title, message);
}

export default function AdminToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastFn = (type, title, message) => {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };
    return () => {
      toastFn = null;
    };
  }, []);

  const colors: Record<ToastType, { bg: string; icon: string }> = {
    success: { bg: "linear-gradient(135deg, #10b981, #34d399)", icon: "✓" },
    error: { bg: "linear-gradient(135deg, #ef4444, #f87171)", icon: "✕" },
    warning: { bg: "linear-gradient(135deg, #f59e0b, #fbbf24)", icon: "!" },
    info: { bg: "linear-gradient(135deg, #3b82f6, #60a5fa)", icon: "i" },
  };

  return (
    <div className="at-container">
      {toasts.map((t) => (
        <div key={t.id} className="at-toast">
          <div className="at-bar" style={{ background: colors[t.type].bg }} />
          <div className="at-icon" style={{ background: colors[t.type].bg }}>
            {colors[t.type].icon}
          </div>
          <div className="at-body">
            <div className="at-title">{t.title}</div>
            {t.message && <div className="at-msg">{t.message}</div>}
          </div>
          <button
            className="at-close"
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
          >
            ✕
          </button>
          <div className="at-progress" style={{ background: colors[t.type].bg }} />
        </div>
      ))}

      <style jsx>{`
        .at-container {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 380px;
          pointer-events: none;
        }
        .at-toast {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #fff;
          border-radius: 14px;
          padding: 14px 40px 14px 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          animation: atSlide 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          pointer-events: auto;
        }
        @keyframes atSlide {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .at-bar {
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
        }
        .at-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          color: #fff;
          font-size: 14px;
          font-weight: 900;
          flex-shrink: 0;
        }
        .at-body {
          flex: 1;
          min-width: 0;
        }
        .at-title {
          font-size: 13.5px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 3px;
        }
        .at-msg {
          font-size: 12.5px;
          color: #64748b;
          line-height: 1.4;
        }
        .at-close {
          position: absolute;
          top: 10px;
          right: 10px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 12px;
          cursor: pointer;
          padding: 4px 6px;
          border-radius: 6px;
        }
        .at-close:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .at-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          width: 100%;
          transform-origin: left;
          animation: atProgress 4s linear forwards;
        }
        @keyframes atProgress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}
