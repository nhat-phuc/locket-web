"use client";

import { useEffect, useState } from "react";

interface RechargeData {
  id: string;
  amount: number;
}

interface OrderData {
  id: string;
  orderCode: string;
  serviceName: string;
  amount: number;
}

export default function RechargeSuccessPopup() {
  const [show, setShow] = useState(false);
  const [type, setType] = useState<"recharge" | "order">("recharge");
  const [recharge, setRecharge] = useState<RechargeData | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const load = () => {
      fetch("/api/live-notifications")
        .then((r) => r.json())
        .then((d) => {
          if (!d.success) return;

          // Ưu tiên đơn hàng mới hơn
          const rechargeTime = d.myRecentRecharge
            ? new Date(d.myRecentRecharge.createdAt).getTime()
            : 0;
          const orderTime = d.myRecentOrder
            ? new Date(d.myRecentOrder.createdAt).getTime()
            : 0;

          // Xử lý nạp tiền
          if (d.myRecentRecharge) {
            const key = `recharge_seen_${d.myRecentRecharge.id}`;
            if (!sessionStorage.getItem(key)) {
              setType("recharge");
              setRecharge(d.myRecentRecharge);
              setShow(true);
              sessionStorage.setItem(key, "1");
              setTimeout(() => setShow(false), 6000);
            }
          }

          // Xử lý mua gói
          if (d.myRecentOrder) {
            const key = `order_seen_${d.myRecentOrder.id}`;
            if (!sessionStorage.getItem(key)) {
              // Nếu cả 2 đều mới, hiện cái mới hơn
              if (!show || orderTime > rechargeTime) {
                setType("order");
                setOrder(d.myRecentOrder);
                setShow(true);
                sessionStorage.setItem(key, "1");
                setTimeout(() => setShow(false), 6000);
              }
            }
          }
        })
        .catch(() => {});
    };

    load();
    const iv = setInterval(load, 10000);
    return () => clearInterval(iv);
  }, [show]);

  if (!show) return null;

  const isRecharge = type === "recharge";
  const title = isRecharge ? "Nạp tiền thành công!" : "Mua gói thành công!";
  const amount = isRecharge ? recharge?.amount || 0 : order?.amount || 0;
  const sub = isRecharge
    ? "Số dư đã được cập nhật vào ví của bạn"
    : order?.serviceName || "Gói đã được kích hoạt";
  const icon = isRecharge ? "🎉" : "🛍️";

  return (
    <div className={`rc-popup ${isRecharge ? "rc-green" : "rc-purple"}`}>
      <div className="rc-icon">{icon}</div>
      <div className="rc-body">
        <div className="rc-title">{title}</div>
        <div className="rc-amount">+{amount.toLocaleString("vi-VN")}đ</div>
        <div className="rc-sub">{sub}</div>
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
          border-radius: 16px;
          animation: rcSlide 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          max-width: 380px;
        }
        .rc-green {
          background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
          border: 1px solid #6ee7b7;
          box-shadow: 0 20px 60px rgba(16, 185, 129, 0.3);
        }
        .rc-purple {
          background: linear-gradient(135deg, #f5f3ff, #faf5ff);
          border: 1px solid #c4b5fd;
          box-shadow: 0 20px 60px rgba(139, 92, 246, 0.3);
        }
        @keyframes rcSlide {
          0% { transform: translateX(120%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .rc-icon { font-size: 40px; flex-shrink: 0; }
        .rc-body { flex: 1; min-width: 0; }
        .rc-green .rc-title { color: #065f46; }
        .rc-purple .rc-title { color: #4c1d95; }
        .rc-title {
          font-size: 14px;
          font-weight: 800;
          margin-bottom: 4px;
        }
        .rc-green .rc-amount { color: #10b981; }
        .rc-purple .rc-amount { color: #7c3aed; }
        .rc-amount {
          font-size: 22px;
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 4px;
        }
        .rc-green .rc-sub { color: #047857; }
        .rc-purple .rc-sub { color: #6d28d9; }
        .rc-sub {
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .rc-green .rc-close { color: #059669; }
        .rc-purple .rc-close { color: #7c3aed; }
        .rc-close {
          position: absolute;
          top: 8px;
          right: 10px;
          background: transparent;
          border: none;
          font-size: 14px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
        }
        .rc-green .rc-close:hover { background: rgba(16, 185, 129, 0.15); }
        .rc-purple .rc-close:hover { background: rgba(139, 92, 246, 0.15); }
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
