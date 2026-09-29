"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";

function ChuyenKhoanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  // Fetch order info
  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/payments/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, paymentMethod: "bank_transfer" }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setOrder(d);
          const expires = new Date(d.expiresAt).getTime();
          setTimeLeft(Math.max(0, Math.floor((expires - Date.now()) / 1000)));
        }
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  // Polling check status mỗi 3s
  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/check?orderId=${orderId}`);
        const data = await res.json();
        if (data.status === "paid") {
          clearInterval(interval);
          router.push(`/thanh-toan/thanh-cong?orderId=${orderId}`);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [orderId, router]);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  if (loading) {
    return <div style={{ padding: 60, textAlign: "center", color: "#666" }}>Đang tải...</div>;
  }

  if (!order) {
    return <div style={{ padding: 60, textAlign: "center", color: "#f87171" }}>Không tìm thấy đơn hàng</div>;
  }

  return (
    <main className="ck-page">
      <div className="ck-wrap">
        <div className="ck-header">
          <h1>Thanh toán chuyển khoản</h1>
          <p>Quét mã QR hoặc chuyển khoản thủ công</p>
        </div>

        <div className="ck-card">
          {/* Countdown */}
          <div className="ck-timer">
            ⏱ Thời gian còn lại: <b>{mm}:{ss}</b>
          </div>

          {/* QR */}
          <div className="ck-qr">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={order.qrUrl} alt="QR thanh toán" />
          </div>

          {/* Info */}
          <div className="ck-info">
            <div className="ck-row">
              <span className="ck-label">Ngân hàng</span>
              <span className="ck-value">{order.bank}</span>
            </div>
            <div className="ck-row">
              <span className="ck-label">Số tài khoản</span>
              <span className="ck-value">
                {order.accountNumber}
                <button onClick={() => copy(order.accountNumber, "acc")}>
                  {copied === "acc" ? "✓" : "Copy"}
                </button>
              </span>
            </div>
            <div className="ck-row">
              <span className="ck-label">Chủ tài khoản</span>
              <span className="ck-value">{order.accountName}</span>
            </div>
            <div className="ck-row">
              <span className="ck-label">Số tiền</span>
              <span className="ck-value ck-amount">
                {order.amount.toLocaleString("vi-VN")}đ
                <button onClick={() => copy(String(order.amount), "amount")}>
                  {copied === "amount" ? "✓" : "Copy"}
                </button>
              </span>
            </div>
            <div className="ck-row ck-row-hl">
              <span className="ck-label">Nội dung CK</span>
              <span className="ck-value ck-code">
                {order.orderCode}
                <button onClick={() => copy(order.orderCode, "code")}>
                  {copied === "code" ? "✓" : "Copy"}
                </button>
              </span>
            </div>
          </div>

          <div className="ck-warning">
            ⚠️ Vui lòng nhập <b>đúng nội dung chuyển khoản</b> để hệ thống tự động xác nhận.
          </div>

          <div className="ck-status">
            <div className="ck-pulse" />
            Đang chờ thanh toán...
          </div>
        </div>
      </div>

      <style jsx>{`
        .ck-page {
          min-height: 100vh;
          padding: 110px 20px 60px;
          background: linear-gradient(180deg, #fafbfc, #f5f7fa);
        }
        .ck-wrap { max-width: 560px; margin: 0 auto; }
        .ck-header { text-align: center; margin-bottom: 32px; }
        .ck-header h1 { font-size: 28px; font-weight: 900; color: #1a1d21; margin-bottom: 8px; }
        .ck-header p { font-size: 14px; color: #6b7280; }

        .ck-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.06);
        }

        .ck-timer {
          text-align: center;
          padding: 10px 16px;
          background: #fef3c7;
          border-radius: 10px;
          font-size: 13px;
          color: #92400e;
          margin-bottom: 20px;
        }
        .ck-timer b { color: #b45309; font-size: 15px; }

        .ck-qr {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }
        .ck-qr img {
          width: 240px;
          height: 240px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .ck-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 20px;
        }
        .ck-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: #f9fafb;
          border-radius: 10px;
          font-size: 14px;
          gap: 12px;
        }
        .ck-row-hl {
          background: #f0fdf4;
          border: 1px solid #86efac;
        }
        .ck-label {
          color: #6b7280;
          font-weight: 600;
          flex-shrink: 0;
        }
        .ck-value {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #111827;
          font-weight: 700;
          text-align: right;
          word-break: break-all;
        }
        .ck-amount { color: #3b82f6; font-size: 16px; }
        .ck-code { color: #059669; font-size: 15px; letter-spacing: 0.5px; }

        .ck-value button {
          padding: 3px 8px;
          background: #fff;
          border: 1px solid #d1d5db;
          border-radius: 5px;
          font-size: 11px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
        }
        .ck-value button:hover { background: #f3f4f6; }

        .ck-warning {
          padding: 12px 14px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 10px;
          font-size: 12.5px;
          color: #92400e;
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .ck-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px;
          background: #eff6ff;
          border-radius: 10px;
          color: #1d4ed8;
          font-size: 13.5px;
          font-weight: 700;
        }
        .ck-pulse {
          width: 8px; height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          animation: ckPulse 1.5s infinite;
        }
        @keyframes ckPulse {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(59,130,246,0.5); }
          50% { opacity: 0.7; transform: scale(0.85); box-shadow: 0 0 0 8px rgba(59,130,246,0); }
        }

        @media (max-width: 500px) {
          .ck-page { padding: 90px 12px 40px; }
          .ck-card { padding: 18px; }
          .ck-qr img { width: 200px; height: 200px; }
          .ck-row { flex-direction: column; align-items: flex-start; }
          .ck-value { text-align: left; }
        }
      `}</style>
    </main>
  );
}

export default function ChuyenKhoanPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div style={{ padding: 60, textAlign: "center" }}>Đang tải...</div>}>
        <ChuyenKhoanContent />
      </Suspense>
    </>
  );
}
