"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Order {
  id: string;
  orderCode: string;
  serviceName: string;
  finalAmount: number;
  locketUsername: string;
  status: string;
  expiresAt: string | null;
}

type Step = "info" | "method" | "qr" | "success";

export default function ThanhToanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("serviceId");
  const variant = searchParams.get("variant");

  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState<number>(0);
  const [locketUsername, setLocketUsername] = useState("");
  const [coupon, setCoupon] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<Step>("info");
  const [method, setMethod] = useState<"balance" | "bank" | null>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  // Redirect nếu thiếu serviceId
  useEffect(() => {
    if (!serviceId) router.push("/bang-gia");
  }, [serviceId, router]);

  // Load user + balance
  useEffect(() => {
    const stored = sessionStorage.getItem("locket_user");
    if (!stored) { router.push("/dang-nhap"); return; }
    try {
      const u = JSON.parse(stored);
      setUser(u);
      if (u.email) {
        fetch(`/api/balance?email=${encodeURIComponent(u.email)}`)
          .then((r) => r.json())
          .then((d) => { if (typeof d.balance === "number") setBalance(d.balance); })
          .catch(() => {});
      }
    } catch {}
  }, [router]);

  // Countdown khi hiện QR
  useEffect(() => {
    if (step !== "qr" || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [step, timeLeft]);

  // ═══ POLLING CHECK THANH TOÁN ═══
  useEffect(() => {
    if (step !== "qr" || !order) return;
    const check = async () => {
      try {
        const res = await fetch(`/api/payments/check?orderId=${order.id}`);
        const d = await res.json();
        if (d.success && (d.status === "paid" || d.status === "completed")) {
          setStep("success");
          setTimeout(() => router.push(`/thanh-toan/thanh-cong?orderId=${order.id}`), 2500);
        }
      } catch {}
    };
    check();
    const i = setInterval(check, 3000);
    return () => clearInterval(i);
  }, [step, order, router]);

  const handleCreateOrder = async () => {
    if (!serviceId) { setError("Thiếu thông tin dịch vụ"); return; }
    if (!locketUsername.trim()) { setError("Vui lòng nhập username Locket"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          variant: variant ? parseInt(variant) : undefined,
          locketUsername: locketUsername.trim(),
          couponCode: coupon.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) { setOrder(data.order); setStep("method"); }
      else { setError(data.message || "Không thể tạo đơn"); }
    } catch { setError("Lỗi kết nối"); }
    finally { setLoading(false); }
  };

  // ═══ THANH TOÁN BẰNG SỐ DƯ ═══
  const handlePayWithBalance = async () => {
    if (!order) return;
    if (balance < order.finalAmount) {
      setError(`Số dư không đủ. Cần ${order.finalAmount.toLocaleString("vi-VN")}đ, hiện có ${balance.toLocaleString("vi-VN")}đ`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/pay-with-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("success");
        setTimeout(() => router.push(`/thanh-toan/thanh-cong?orderId=${order.id}`), 2500);
      } else {
        setError(data.message || "Thanh toán thất bại");
      }
    } catch { setError("Lỗi kết nối"); }
    finally { setLoading(false); }
  };

  const handleBankTransfer = () => {
    setMethod("bank");
    setStep("qr");
    setTimeLeft(15 * 60);
  };

  const formatPrice = (n: number) => n.toLocaleString("vi-VN") + "đ";
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (!serviceId) return <div style={{ textAlign: "center", padding: 80 }}>Đang chuyển hướng...</div>;

  const notEnough = balance < (order?.finalAmount || 0);

  return (
    <div className="pay-page">
      {/* Header */}
      <div className="pay-header">
        <h1>Thanh toán</h1>
        <p>Hoàn tất thông tin để tạo đơn hàng</p>
      </div>

      {/* Steps indicator */}
      <div className="pay-steps">
        <div className={`pay-step ${step === "info" ? "is-active" : "is-done"}`}>
          <div className="pay-step-num">1</div>
          <span>Thông tin</span>
        </div>
        <div className="pay-step-line" />
        <div className={`pay-step ${step === "method" ? "is-active" : step === "qr" || step === "success" ? "is-done" : ""}`}>
          <div className="pay-step-num">2</div>
          <span>Thanh toán</span>
        </div>
        <div className="pay-step-line" />
        <div className={`pay-step ${step === "success" ? "is-done" : ""}`}>
          <div className="pay-step-num">3</div>
          <span>Hoàn tất</span>
        </div>
      </div>

      {error && <div className="pay-error">⚠️ {error}</div>}

      {/* ═══ STEP 1: INFO ═══ */}
      {step === "info" && (
        <div className="pay-card">
          <div className="pay-field">
            <label>Username Locket <span className="req">*</span></label>
            <input
              type="text"
              value={locketUsername}
              onChange={(e) => setLocketUsername(e.target.value)}
              placeholder="Nhập username Locket"
            />
          </div>
          <div className="pay-field">
            <label>Mã giảm giá (nếu có)</label>
            <input
              type="text"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              placeholder="Nhập mã giảm giá"
            />
          </div>
          <button onClick={handleCreateOrder} disabled={loading || !locketUsername.trim()} className="pay-btn">
            {loading ? "Đang xử lý..." : "Tạo đơn và thanh toán"}
          </button>
        </div>
      )}

      {/* ═══ STEP 2: METHOD ═══ */}
      {step === "method" && order && (
        <div className="pay-card">
          <div className="pay-summary">
            <div className="pay-summary-row"><span>Mã đơn:</span><b>{order.orderCode}</b></div>
            <div className="pay-summary-row"><span>Gói:</span><b>{order.serviceName}</b></div>
            <div className="pay-summary-row"><span>Username:</span><b>@{order.locketUsername}</b></div>
            <div className="pay-summary-total"><span>Tổng:</span><b>{formatPrice(order.finalAmount)}</b></div>
          </div>

          {/* Nút thanh toán số dư */}
          <button onClick={handlePayWithBalance} disabled={loading || notEnough} className={`pay-method-btn balance ${notEnough ? "disabled" : ""}`}>
            <div className="pay-method-icon">💰</div>
            <div className="pay-method-info">
              <b>Thanh toán bằng số dư</b>
              <span>Số dư: {formatPrice(balance)}</span>
            </div>
          </button>

          {notEnough && (
            <p className="pay-warn">
              Số dư không đủ. Cần thêm {formatPrice(order.finalAmount - balance)} — <Link href="/nap-tien">Nạp tiền</Link>
            </p>
          )}

          {/* Nút chuyển khoản */}
          <button onClick={handleBankTransfer} disabled={loading} className="pay-method-btn bank">
            <div className="pay-method-icon">🏦</div>
            <div className="pay-method-info">
              <b>Chuyển khoản ngân hàng</b>
              <span>Quét QR — Tự động xác nhận trong vài giây</span>
            </div>
          </button>

          <button onClick={() => setStep("info")} className="pay-btn-back">← Quay lại</button>
        </div>
      )}

      {/* ═══ STEP 3: QR ═══ */}
      {step === "qr" && order && (
        <div className="pay-card pay-card-qr">
          <div className="pay-qr-header">
            <h2>Quét mã QR để thanh toán</h2>
            <div className="pay-timer">⏱️ {formatTime(timeLeft)}</div>
          </div>

          <div className="pay-qr-info">
            <div className="pay-qr-row"><span>Số tiền:</span><b>{formatPrice(order.finalAmount)}</b></div>
            <div className="pay-qr-row"><span>Nội dung CK:</span><b className="pay-code">{order.orderCode}</b></div>
          </div>

          <div className="pay-qr-wrap">
            <img
              src={`https://qr.sepay.vn/img?acc=36886368888&bank=TPBANK&amount=${order.finalAmount}&des=${order.orderCode}`}
              alt="QR thanh toán"
              className="pay-qr-img"
            />
          </div>

          <div className="pay-qr-status">
            <div className="pay-spinner" />
            <span>Đang chờ thanh toán... Hệ thống tự động xác nhận</span>
          </div>

          <button onClick={() => setStep("method")} className="pay-btn-back">← Chọn phương thức khác</button>
        </div>
      )}

      {/* ═══ STEP 4: SUCCESS ═══ */}
      {step === "success" && (
        <div className="pay-card pay-card-success">
          <div className="pay-success-icon">✅</div>
          <h2>Thanh toán thành công!</h2>
          <p>Đơn hàng <b>{order?.orderCode}</b> đã được xác nhận.</p>
          <p className="pay-success-sub">Đang chuyển đến trang hoàn tất...</p>
        </div>
      )}

      <style jsx>{`
        .pay-page { max-width: 640px; margin: 0 auto; padding: 40px 16px 80px; }
        .pay-header { text-align: center; margin-bottom: 24px; }
        .pay-header h1 { font-size: 32px; font-weight: 900; margin-bottom: 8px; }
        .pay-header p { color: var(--text-2); font-size: 15px; }

        /* Steps indicator */
        .pay-steps { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 24px; }
        .pay-step { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-2); font-weight: 600; }
        .pay-step-num { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: #f3f4f6; color: var(--text-2); font-size: 12px; font-weight: 800; border: 1.5px solid var(--border); }
        .pay-step.is-active .pay-step-num { background: linear-gradient(135deg, #7c3aed, #a78bfa); color: #fff; border-color: transparent; box-shadow: 0 4px 12px rgba(124,58,237,0.35); }
        .pay-step.is-done .pay-step-num { background: #10b981; color: #fff; border-color: transparent; }
        .pay-step-line { width: 40px; height: 2px; background: #e5e7eb; border-radius: 2px; }

        /* Error */
        .pay-error { padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; border-radius: 12px; font-size: 13.5px; margin-bottom: 16px; }

        /* Card */
        .pay-card { background: var(--bg-1); border: 1px solid var(--border); border-radius: 20px; padding: 28px 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); }

        /* Field */
        .pay-field { margin-bottom: 18px; }
        .pay-field label { display: block; font-weight: 700; margin-bottom: 8px; font-size: 14px; }
        .req { color: #dc2626; }
        .pay-field input { width: 100%; padding: 13px 16px; background: var(--bg-2); border: 1.5px solid var(--border); border-radius: 12px; font-size: 14.5px; font-family: inherit; color: var(--text-0); outline: none; transition: all 0.2s; }
        .pay-field input:focus { border-color: #7c3aed; background: var(--bg-1); box-shadow: 0 0 0 4px rgba(124,58,237,0.1); }

        /* Button */
        .pay-btn { width: 100%; padding: 15px; background: linear-gradient(135deg, #7c3aed, #a78bfa); color: #fff; border: none; border-radius: 12px; font-size: 15px; font-weight: 800; font-family: inherit; cursor: pointer; transition: all 0.25s; box-shadow: 0 8px 24px rgba(124,58,237,0.3); margin-top: 8px; }
        .pay-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(124,58,237,0.4); }
        .pay-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .pay-btn-back { width: 100%; padding: 12px; background: transparent; border: none; color: var(--text-2); font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; margin-top: 8px; border-radius: 10px; }
        .pay-btn-back:hover { background: var(--bg-2); color: var(--text-0); }

        /* Summary */
        .pay-summary { padding: 16px 18px; background: var(--bg-2); border: 1px solid var(--border); border-radius: 14px; margin-bottom: 20px; }
        .pay-summary-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; }
        .pay-summary-row span { color: var(--text-2); }
        .pay-summary-total { display: flex; justify-content: space-between; padding-top: 12px; margin-top: 6px; border-top: 1px dashed #d1d5db; font-size: 15px; }
        .pay-summary-total b { color: #7c3aed; font-size: 18px; }

        /* Method buttons */
        .pay-method-btn { display: flex; align-items: center; gap: 14px; padding: 16px; background: var(--bg-1); border: 2px solid #e5e7eb; border-radius: 14px; cursor: pointer; transition: all 0.25s; text-align: left; font-family: inherit; width: 100%; margin-bottom: 12px; }
        .pay-method-btn:hover:not(.disabled) { border-color: #7c3aed; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,58,237,0.15); }
        .pay-method-btn.disabled { opacity: 0.5; cursor: not-allowed; }
        .pay-method-btn.balance { border-color: #10b981; }
        .pay-method-btn.bank { border-color: #7c3aed; }
        .pay-method-icon { font-size: 28px; }
        .pay-method-info { display: flex; flex-direction: column; gap: 2px; }
        .pay-method-info b { font-size: 15px; font-weight: 800; color: var(--text-0); }
        .pay-method-info span { font-size: 13px; color: var(--text-2); }
        .pay-warn { padding: 10px 14px; background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; border-radius: 10px; font-size: 13px; text-align: center; margin-bottom: 12px; }
        .pay-warn a { color: #7c3aed; font-weight: 700; text-decoration: underline; }

        /* QR */
        .pay-card-qr { text-align: center; }
        .pay-qr-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .pay-qr-header h2 { font-size: 20px; font-weight: 900; }
        .pay-timer { padding: 6px 12px; background: #fef3c7; color: #d97706; border-radius: 999px; font-size: 13px; font-weight: 800; }
        .pay-qr-info { padding: 14px 18px; background: var(--bg-2); border-radius: 12px; margin-bottom: 20px; text-align: left; }
        .pay-qr-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px; }
        .pay-qr-row:last-child { margin-bottom: 0; }
        .pay-qr-row span { color: var(--text-2); }
        .pay-code { font-family: monospace; font-size: 15px; color: #7c3aed; }
        .pay-qr-wrap { padding: 16px; background: #fff; border-radius: 16px; border: 2px dashed #7c3aed; display: inline-block; margin-bottom: 20px; }
        .pay-qr-img { width: 260px; height: 260px; display: block; border-radius: 8px; }
        .pay-qr-status { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; font-size: 14px; color: #16a34a; font-weight: 700; margin-bottom: 12px; }
        .pay-spinner { width: 16px; height: 16px; border: 2px solid #86efac; border-top-color: #16a34a; border-radius: 50%; animation: paySpin 0.6s linear infinite; }
        @keyframes paySpin { to { transform: rotate(360deg); } }

        /* Success */
        .pay-card-success { text-align: center; padding: 48px 24px; }
        .pay-success-icon { font-size: 64px; margin-bottom: 16px; animation: pop 0.5s ease; }
        @keyframes pop { 0% { transform: scale(0); } 80% { transform: scale(1.2); } 100% { transform: scale(1); } }
        .pay-card-success h2 { font-size: 24px; font-weight: 900; color: #16a34a; margin-bottom: 12px; }
        .pay-card-success p { font-size: 15px; color: var(--text-1); margin-bottom: 6px; }
        .pay-success-sub { color: var(--text-2) !important; font-size: 13.5px !important; }

        @media (max-width: 480px) {
          .pay-header h1 { font-size: 26px; }
          .pay-card { padding: 20px 16px; border-radius: 16px; }
          .pay-step span { display: none; }
          .pay-qr-img { width: 220px; height: 220px; }
        }
      `}</style>
    </div>
  );
}
