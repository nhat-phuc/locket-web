'use client';

import { useEffect, useState } from 'react';

type Order = {
  id: string;
  serviceName: string;
  amount: number;
  finalAmount: number;
  paidAt: string;
  user: { name: string | null; username: string | null; picture: string | null } | null;
};

function maskName(name: string) {
  if (!name) return 'Khách';
  const parts = name.trim().split(' ');
  const first = parts[parts.length - 1];
  if (first.length <= 2) return first + '***';
  return first.slice(0, 3) + '***';
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

function formatVND(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

function getOrderInfo(order: Order) {
  const lower = (order.serviceName || '').toLowerCase().trim();
  const isTopUp = lower.includes('nạp') || lower.includes('nap');
  if (isTopUp) {
    return {
      verb: 'vừa nạp tiền',
      highlight: '+' + formatVND(order.finalAmount || order.amount),
      isTopUp: true,
    };
  }
  return {
    verb: 'vừa đăng ký',
    highlight: order.serviceName,
    isTopUp: false,
  };
}

export default function SocialProofPopup() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch('/api/recent-purchases')
      .then((r) => r.json())
      .then((d) => setOrders((d.orders || []).slice(0, 3)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (orders.length === 0) return;
    let i = 0;
    let t1: any;
    let t2: any;
    const showNext = () => {
      setIndex(i % orders.length);
      setVisible(true);
      t1 = setTimeout(() => {
        setVisible(false);
        i++;
        t2 = setTimeout(showNext, 5000);
      }, 5500);
    };
    const start = setTimeout(showNext, 3500);
    return () => {
      clearTimeout(start);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [orders]);

  if (orders.length === 0 || !visible) return null;

  const order = orders[index];
  const info = getOrderInfo(order);
  const initials = (order.user?.name || 'K').trim().split(' ').pop()?.[0]?.toUpperCase() || 'K';

  return (
    <>
      <div className="ssp-wrap">
        <div className="ssp-card">
          {order.user?.picture ? (
            <img src={order.user.picture} alt="" className="ssp-avatar" />
          ) : (
            <div className="ssp-avatar-fallback">{initials}</div>
          )}

          <div className="ssp-body">
            <div className="ssp-row1">
              <span className="ssp-name">
                {maskName(order.user?.name || order.user?.username || '')}
              </span>
              <span className="ssp-verb">{info.verb}</span>
            </div>
            <div className={`ssp-highlight ${info.isTopUp ? 'ssp-green' : ''}`}>
              {info.highlight}
            </div>
            <div className="ssp-time">
              <span className="ssp-dot" />
              {timeAgo(order.paidAt)}
            </div>
          </div>

          <button
            className="ssp-close"
            onClick={() => setVisible(false)}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>
      </div>

      <style jsx>{`
        .ssp-wrap {
          position: fixed;
          bottom: 24px;
          left: 24px;
          z-index: 99999;
          pointer-events: none;
        }
        .ssp-card {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f2f4f7;
          border-radius: 14px;
          padding: 14px 16px;
          width: 380px;
          max-width: calc(100vw - 32px);
          box-shadow:
            0 1px 2px rgba(16,24,40,.06),
            0 12px 32px rgba(16,24,40,.18);
          /* ❌ bỏ border */
          border: none;
          position: relative;
          animation: sspIn 0.45s cubic-bezier(.16,1,.3,1);
        }
        .ssp-avatar {
          width: 48px;
          height: 48px;
          min-width: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #ec4899;
        }
        .ssp-avatar-fallback {
          width: 48px;
          height: 48px;
          min-width: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg,#ec4899,#8b5cf6);
          color: #fff;
          font-weight: 700;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ssp-body {
          flex: 1;
          min-width: 0;
          padding-right: 12px;
        }
        .ssp-row1 {
          display: flex;
          align-items: baseline;
          gap: 4px;
          font-size: 14px;
          line-height: 1.35;
          color: #344054;
          white-space: normal;
          overflow: visible;
          text-overflow: clip;
        }
        .ssp-name {
          font-weight: 700;
          color: #101828;
          flex-shrink: 0;
        }
        .ssp-verb {
          overflow: visible;
          text-overflow: clip;
        }
        .ssp-highlight {
          margin-top: 2px;
          font-size: 14px;
          font-weight: 700;
          color: #ec4899;
          line-height: 1.3;
          white-space: normal;
          overflow: visible;
          text-overflow: clip;
        }
        .ssp-highlight.ssp-green {
          color: #12b76a;
        }
        .ssp-time {
          margin-top: 4px;
          font-size: 11.5px;
          color: #98a2b3;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .ssp-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #12b76a;
          box-shadow: 0 0 0 2px rgba(18,183,106,.18);
          animation: sspPulse 1.8s infinite;
        }
        .ssp-close {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: #98a2b3;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background .15s, color .15s;
        }
        .ssp-close:hover {
          background: #e4e7ec;
          color: #475467;
        }
        @keyframes sspIn {
          from { transform: translateY(12px) scale(.96); opacity: 0; }
          to   { transform: translateY(0)     scale(1);   opacity: 1; }
        }
        @keyframes sspPulse {
          0%,100% { opacity: 1; }
          50%     { opacity: .35; }
        }

        @media (max-width: 640px) {
          .ssp-wrap {
            bottom: 88px;
            left: 16px;
            right: auto;
          }
          .ssp-card {
            width: auto;
            max-width: 260px;
            padding: 10px 12px;
            gap: 9px;
            border-radius: 12px;
          }
          .ssp-avatar,
          .ssp-avatar-fallback {
            width: 36px;
            height: 36px;
            min-width: 36px;
            font-size: 15px;
            border-width: 2px;
          }
          .ssp-body { padding-right: 8px; }
          .ssp-row1 { font-size: 12px; }
          .ssp-highlight { font-size: 12px; margin-top: 1px; }
          .ssp-time { font-size: 10.5px; margin-top: 3px; }
          .ssp-close {
            top: 4px;
            right: 4px;
            width: 20px;
            height: 20px;
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
}
