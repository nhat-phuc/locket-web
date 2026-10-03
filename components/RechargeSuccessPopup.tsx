"use client";

import { useEffect, useState } from "react";

export default function RechargeSuccessPopup() {
  const [show, setShow] = useState(false);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const load = () => {
      fetch("/api/live-notifications")
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.myRecentRecharge) {
            const id = d.myRecentRecharge.id;
            const key = `recharge_seen_${id}`;
            if (!sessionStorage.getItem(key)) {
              setAmount(d.myRecentRecharge.amount);
              setShow(true);
              sessionStorage.setItem(key, "1");
              setTimeout(() => setShow(false), 6000);
            }
          }
        })
        .catch(() => {});
    };

    load();
    const iv = setInterval(load, 10000);
    return () => clearInterval(iv);
  }, []);

  if (!show) return null;

  return (
    <div className="rc-popup">
      <div className="rc-icon">🎉</div>
      <div className="rc-body">
        <div className="rc-title">Nạp tiền thành công!</div>
        <div className="rc-amount">
          +{amount.toLocaleString("vi-VN")}đ
        </div>
        <div className="rc-sub">Số dư đã được cập nhật vào ví của bạn</div>
      </div>
      <button className="rc-close" onClick={() => setShow(false)}>✕</button>

      <style jsx>{`
        .rc-popup {
          position: fixed;
          top: 90px;
          right: 20px;
          z-index: 99999;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 40px 16px 20px;
          background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
          border: 1px solid #6ee7b7;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(16, 185, 129, 0.3);
          animation: rcSlide 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          max-width: 380px;
        }
        @keyframes rcSlide {
          0% { transform: translateX(120%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .rc-icon { font-size: 40px; flex-shrink: 0; }
        .rc-body { flex: 1; min-width: 0; }
        .rc-title {
          font-size: 14px;
          font-weight: 800;
          color: #065f46;
          margin-bottom: 4px;
        }
        .rc-amount {
          font-size: 22px;
          font-weight: 900;
          color: #10b981;
          line-height: 1.1;
          margin-bottom: 4px;
        }
        .rc-sub {
          font-size: 12px;
          color: #047857;
        }
        .rc-close {
          position: absolute;
          top: 8px;
          right: 10px;
          background: transparent;
          border: none;
          color: #059669;
          font-size: 14px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
        }
        .rc-close:hover { background: rgba(16, 185, 129, 0.15); }
        @media (max-width: 480px) {
          .rc-popup {
            top: auto;
            bottom: 20px;
            right: 12px;
            left: 12px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
}
