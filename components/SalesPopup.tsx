"use client";

import { useEffect, useRef, useState } from "react";

interface Notif {
  id: string;
  kind: "order" | "recharge";
  name: string;
  initial: string;
  avatar: string | null;
  message: string;
  detail: string;
  time: string;
  timestamp: number;
}

function uiAvatar(name: string): string {
  const clean = name.replace(/\*/g, "").trim() || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(clean)}&background=7c3aed&color=fff&size=128&bold=true`;
}

const DISPLAY_MS = 5000;

export default function SalesPopup() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState(false);
  const [progress, setProgress] = useState(0);

  const hoveredRef = useRef(false);

  useEffect(() => {
    const load = () => {
      fetch("/api/live-notifications")
        .then((r) => r.json())
        .then((d) => { if (d.success) setNotifs(d.notifications); })
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (notifs.length === 0 || dismissed) return;

    let mounted = true;
    let showTimeout: ReturnType<typeof setTimeout>;
    let hideTimeout: ReturnType<typeof setTimeout>;

    const showNotif = () => {
      if (!mounted) return;

      setVisible(true);
      setProgress(0);

      const startTime = Date.now();
      const progressInterval = setInterval(() => {
        if (!mounted || hoveredRef.current) return;
        const elapsed = Date.now() - startTime;
        setProgress(Math.min((elapsed / DISPLAY_MS) * 100, 100));
      }, 50);

      hideTimeout = setTimeout(() => {
        if (hoveredRef.current) return;
        clearInterval(progressInterval);
        setVisible(false);

        showTimeout = setTimeout(() => {
          setCurrentIdx((i) => (i + 1) % notifs.length);
          showNotif();
        }, 600);
      }, DISPLAY_MS);
    };

    const initialTimer = setTimeout(showNotif, 3000);

    return () => {
      mounted = false;
      clearTimeout(initialTimer);
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  }, [notifs.length, dismissed]);

  if (notifs.length === 0 || dismissed) return null;

  const n = notifs[currentIdx];
  if (!n) return null;

  const useFallback = failed[n.id] || !n.avatar;
  const imgSrc = useFallback ? uiAvatar(n.name) : n.avatar!;

  return (
    <div
      className={`np-wrapper${visible ? " np-show" : ""}`}
      onMouseEnter={() => { hoveredRef.current = true; }}
      onMouseLeave={() => { hoveredRef.current = false; }}
    >
      <div className="np-card">
        <button
          className="np-close"
          onClick={() => { setDismissed(true); setVisible(false); }}
          aria-label="Đóng"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="np-avatar-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="np-avatar"
            src={imgSrc}
            alt={n.name}
            referrerPolicy="no-referrer"
            onError={() => {
              if (!useFallback) setFailed((f) => ({ ...f, [n.id]: true }));
            }}
          />
          <div className={`np-badge np-badge-${n.kind}`}>
            {n.kind === "recharge" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </div>

        <div className="np-content">
          <div className="np-message">{n.message}</div>
          <div className={`np-detail np-detail-${n.kind}`}>{n.detail}</div>
          <div className="np-time">{n.time}</div>
        </div>

        <div className="np-progress">
          <div className="np-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <style jsx>{`
        .np-wrapper {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 99997;
          opacity: 0;
          transform: translateY(20px) scale(0.95);
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          pointer-events: none;
          max-width: 340px;
          min-width: 280px;
        }

        .np-wrapper.np-show {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        /* ═══ CARD — NỀN XÁM TRONG (glassmorphism) ═══ */
        .np-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 34px 12px 10px;
          background: rgba(30, 25, 50, 0.65);
          border: 1px solid rgba(167, 139, 250, 0.35);
          border-radius: 14px;
          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.35),
            0 0 0 1px rgba(255, 255, 255, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          overflow: hidden;
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
        }

        .np-close {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 22px;
          height: 22px;
          display: grid;
          place-items: center;
          background: transparent;
          border: none;
          border-radius: 50%;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: all 0.2s;
          z-index: 2;
        }
        .np-close:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }
        .np-close svg {
          width: 11px;
          height: 11px;
        }

        /* Avatar — nhỏ hơn */
        .np-avatar-wrap {
          position: relative;
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          z-index: 1;
        }

        .np-avatar {
          position: relative;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          display: block;
          border: 2px solid rgba(255, 255, 255, 0.15);
          z-index: 1;
        }

        .np-badge {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #fff;
          border: 2px solid #1a1230;
          z-index: 2;
        }

        .np-badge-order {
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
        }
        .np-badge-recharge {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .np-badge svg {
          width: 8px;
          height: 8px;
        }

        /* Content — gọn hơn */
        .np-content {
          flex: 1;
          min-width: 0;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .np-message {
          font-size: 12px;
          font-weight: 800;
          color: #fff;
          line-height: 1.3;
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .np-detail {
          font-size: 11.5px;
          font-weight: 700;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .np-detail-order {
          color: #c4b5fd;
        }
        .np-detail-recharge {
          color: #34d399;
        }

        .np-time {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.5);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .np-time::before {
          content: "";
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
          animation: npBlink 1.5s ease-in-out infinite;
        }

        @keyframes npBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* Progress */
        .np-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: rgba(255, 255, 255, 0.06);
          overflow: hidden;
        }

        .np-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #a78bfa, #ec4899);
          transition: width 0.1s linear;
          box-shadow: 0 0 8px rgba(167, 139, 250, 0.5);
        }

        /* Mobile — gọn, đặt trên nav */
        @media (max-width: 500px) {
          .np-wrapper {
            bottom: 82px;
            left: 12px;
            right: 12px;
            max-width: none;
            min-width: 0;
          }
          .np-card {
            padding: 8px 30px 10px 8px;
            gap: 8px;
            border-radius: 12px;
          }
          .np-avatar-wrap {
            width: 34px;
            height: 34px;
          }
          .np-badge {
            width: 14px;
            height: 14px;
          }
          .np-badge svg {
            width: 7px;
            height: 7px;
          }
          .np-message {
            font-size: 11.5px;
          }
          .np-detail {
            font-size: 11px;
          }
          .np-time {
            font-size: 9.5px;
          }
        }

        @media (max-width: 400px) {
          .np-wrapper {
            bottom: 80px;
            left: 10px;
            right: 10px;
          }
          .np-card {
            padding: 7px 26px 9px 7px;
            gap: 7px;
          }
          .np-avatar-wrap {
            width: 32px;
            height: 32px;
          }
          .np-message { font-size: 11px; }
          .np-detail { font-size: 10.5px; }
          .np-time { font-size: 9px; }
        }
      `}</style>
    </div>
  );
}
