"use client";

import { useEffect, useState } from "react";

interface Item {
  id: string;
  name: string;
  amount: number;
  avatar: string | null;
  isMine: boolean;
}

export default function LiveNotifications() {
  const [items, setItems] = useState<Item[]>([]);

  const load = () => {
    fetch("/api/live-notifications")
      .then((r) => r.json())
      .then((d) => { if (d.success) setItems(d.items || []); })
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, []);

  if (items.length === 0) return null;

  // Nhân đôi items để marquee liên tục
  const loop = [...items, ...items];

  return (
    <div className="live-wrap">
      <div className="live-label">🎉 NẠP GẦN ĐÂY</div>
      <div className="live-marquee">
        <div className="live-track">
          {loop.map((it, i) => (
            <div key={`${it.id}-${i}`} className="live-item">
              {it.avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={it.avatar} alt="" referrerPolicy="no-referrer" />
              ) : (
                <div className="live-avatar-fallback">{it.name.charAt(0)}</div>
              )}
              <span className="live-name">{it.name}</span>
              <span className="live-amount">
                +{it.amount.toLocaleString("vi-VN")}đ
              </span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .live-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          max-width: 900px;
          margin: 16px auto;
          padding: 0 16px;
          background: linear-gradient(135deg, #faf5ff, #fdf4ff);
          border: 1px solid #e9d5ff;
          border-radius: 999px;
          height: 48px;
          overflow: hidden;
          position: relative;
        }
        .live-label {
          font-size: 11px;
          font-weight: 800;
          color: #7c3aed;
          letter-spacing: 1px;
          flex-shrink: 0;
          padding-right: 10px;
          border-right: 1px solid #e9d5ff;
        }
        .live-marquee {
          flex: 1;
          overflow: hidden;
          position: relative;
          mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
        }
        .live-track {
          display: flex;
          gap: 32px;
          animation: liveScroll 60s linear infinite;
          white-space: nowrap;
          width: max-content;
        }
        @keyframes liveScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .live-item {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          font-size: 13px;
        }
        .live-item img {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid #e9d5ff;
        }
        .live-avatar-fallback {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a78bfa, #ec4899);
          color: #fff;
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .live-name {
          color: #0f0a1e;
          font-weight: 700;
        }
        .live-amount {
          color: #10b981;
          font-weight: 800;
        }
        @media (max-width: 600px) {
          .live-wrap { margin: 12px; }
          .live-label { font-size: 10px; }
        }
      `}</style>
    </div>
  );
}
