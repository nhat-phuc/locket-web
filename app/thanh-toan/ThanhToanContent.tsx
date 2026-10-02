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
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  // Validate username
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState("");
  const [profile, setProfile] = useState<any>(null);

  // Redirect nếu thiếu serviceId
  useEffect(() => {
    if (!serviceId) router.push("/bang-gia");
  }, [serviceId, router]);

  // Load user
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

  // Validate username
  useEffect(() => {
    const trimmed = locketUsername.trim();
    if (!trimmed || trimmed.length < 2) {
      setUsernameValid(null);
      setUsernameError("");
      setUsernameChecking(false);
      setProfile(null);
      return;
    }
    setUsernameChecking(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/locket/check?username=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (data.valid) {
          setUsernameValid(true);
          setUsernameError("");
          setProfile(data);
        } else {
          setUsernameValid(false);
          setUsernameError(data.message || "Username không đúng");
          setProfile(null);
        }
      } catch {
        setUsernameValid(false);
        setUsernameError("Không thể kiểm tra");
        setProfile(null);
      } finally {
        setUsernameChecking(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [locketUsername]);

  // Countdown
  useEffect(() => {
    if (step !== "qr" || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [step, timeLeft]);

  // Polling
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
    if (usernameValid !== true) { setError(usernameError || "Username không đúng"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          variant: variant ? parseInt(variant) : undefined,
          locketUsername: profile?.username || locketUsername.trim(),
          couponCode: coupon.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) { setOrder(data.order); setStep("method"); }
      else { setError(data.message || "Không thể tạo đơn"); }
    } catch { setError("Lỗi kết nối"); }
    finally { setLoading(false); }
  };

  const handlePayBalance = async () => {
    if (!order) return;
    if (balance < order.finalAmount) { setError("Số dư không đủ"); return; }
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
      } else { setError(data.message || "Thanh toán thất bại"); }
    } catch { setError("Lỗi kết nối"); }
    finally { setLoading(false); }
  };

  const handleQR = () => {
    setStep("qr");
    setTimeLeft(15 * 60);
  };

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";
  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (!serviceId) return <div style={{ padding: 80, textAlign: "center" }}>Đang chuyển hướng...</div>;

  const notEnough = balance < (order?.finalAmount || 0);

  return (
    <div className="pt-page">
      {/* Glow */}
      <div className="pt-glow pt-glow-1" />
      <div className="pt-glow pt-glow-2" />
      <div className="pt-glow pt-glow-3" />

      <div className="pt-container">
        {/* Header */}
        <div className="pt-header">
          <h1>Thanh toán</h1>
          <p>Hoàn tất thông tin để tạo đơn hàng</p>
        </div>

        {/* Steps */}
        <div className="pt-steps">
          {[
            { key: "info", num: 1, label: "Thông tin" },
            { key: "method", num: 2, label: "Thanh toán" },
            { key: "success", num: 3, label: "Hoàn tất" },
          ].map((s, i) => {
            const isActive = step === s.key;
            const isDone =
              (s.key === "info" && step !== "info") ||
              (s.key === "method" && (step === "qr" || step === "success")) ||
              (s.key === "success" && step === "success");
            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8, flex: i < 2 ? 1 : 0 }}>
                <div className="pt-step">
                  <div className={`pt-step-num ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}>
                    {isDone ? "✓" : s.num}
                  </div>
                  <span className={`pt-step-label ${isActive ? "active" : ""}`}>{s.label}</span>
                </div>
                {i < 2 && <div className={`pt-step-line ${isDone ? "done" : ""}`} />}
              </div>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="pt-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* STEP 1: INFO */}
        {step === "info" && (
          <div className="pt-card">
            <div className="pt-field">
              <label className="pt-label">
                Username Locket <span className="pt-req">*</span>
              </label>
              <div className="pt-input-wrap">
                <input
                  type="text"
                  value={locketUsername}
                  onChange={(e) => setLocketUsername(e.target.value)}
                  placeholder="Nhập username hoặc link Locket"
                  className={`pt-input ${usernameValid === true ? "valid" : ""} ${usernameValid === false ? "invalid" : ""}`}
                />
                <div className="pt-input-icon">
                  {usernameChecking && <div className="pt-spinner" />}
                  {!usernameChecking && usernameValid === true && <span className="pt-ok">✓</span>}
                  {!usernameChecking && usernameValid === false && <span className="pt-err">✕</span>}
                </div>
              </div>

              {usernameValid === true && profile && (
                <div className="pt-profile">
                  <div className="pt-avatar-wrap">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt={profile.username} className="pt-avatar" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="pt-avatar pt-avatar-fallback">{(profile.username || "U").charAt(0).toUpperCase()}</div>
                    )}
                  </div>
                  <div className="pt-profile-info">
                    <div className="pt-profile-name">@{profile.username}</div>
                    <div className="pt-profile-status">
                      <span className="pt-dot" /> Đã tìm thấy
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-field">
              <label className="pt-label">Mã giảm giá (nếu có)</label>
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="Nhập mã giảm giá"
                className="pt-input"
              />
            </div>

            <button
              onClick={handleCreateOrder}
              disabled={loading || usernameValid !== true}
              className="pt-btn pt-btn-primary"
            >
              {loading ? "Đang xử lý..." : "Tạo đơn và thanh toán"}
            </button>
          </div>
        )}

        {/* STEP 2: METHOD */}
        {step === "method" && order && (
          <div className="pt-card">
            {/* Summary */}
            <div className="pt-summary">
              <div className="pt-summary-header">
                <span className="pt-summary-icon">📦</span>
                <span className="pt-summary-title">Chi tiết đơn hàng</span>
              </div>
              <div className="pt-summary-row"><span>Mã đơn:</span><b>{order.orderCode}</b></div>
              <div className="pt-summary-row"><span>Gói:</span><b>{order.serviceName}</b></div>
              <div className="pt-summary-row"><span>Username:</span><b>@{order.locketUsername}</b></div>
              <div className="pt-summary-total">
                <span>Tổng cộng</span>
                <b>{fmt(order.finalAmount)}</b>
              </div>
            </div>

            {/* Method buttons */}
            <button
              onClick={handlePayBalance}
              disabled={loading || notEnough}
              className={`pt-method ${notEnough ? "disabled" : "balance"}`}
            >
              <div className="pt-method-icon">💰</div>
              <div className="pt-method-info">
                <b>Thanh toán bằng số dư</b>
                <span>Số dư: {fmt(balance)}</span>
              </div>
              <div className="pt-method-arrow">→</div>
            </button>

            {notEnough && (
              <div className="pt-warning">
                ⚠️ Số dư không đủ. Cần thêm {fmt(order.finalAmount - balance)} —{" "}
                <Link href="/nap-tien">Nạp tiền</Link>
              </div>
            )}

            <button onClick={handleQR} disabled={loading} className="pt-method bank">
              <div className="pt-method-icon">🏦</div>
              <div className="pt-method-info">
                <b>Chuyển khoản ngân hàng</b>
                <span>Quét QR — Tự động xác nhận</span>
              </div>
              <div className="pt-method-arrow">→</div>
            </button>

            <button onClick={() => setStep("info")} className="pt-btn-back">← Quay lại</button>
          </div>
        )}

        {/* STEP 3: QR */}
        {step === "qr" && order && (
          <div className="pt-card pt-card-qr">
            <div className="pt-qr-header">
              <h2>Quét mã QR</h2>
              <div className="pt-timer">
                <span className="pt-timer-icon">⏱️</span>
                {fmtTime(timeLeft)}
              </div>
            </div>

            <div className="pt-qr-info">
              <div className="pt-qr-row">
                <span>Số tiền</span>
                <b>{fmt(order.finalAmount)}</b>
              </div>
              <div className="pt-qr-row">
                <span>Nội dung CK</span>
                <b className="pt-code">{order.orderCode}</b>
              </div>
            </div>

            <div className="pt-qr-wrap">
              <img
                src={`https://qr.sepay.vn/img?acc=36886368888&bank=TPBANK&amount=${order.finalAmount}&des=${order.orderCode}`}
                alt="QR"
                className="pt-qr-img"
              />
              <div className="pt-qr-corners">
                <div className="pt-corner tl" />
                <div className="pt-corner tr" />
                <div className="pt-corner bl" />
                <div className="pt-corner br" />
              </div>
            </div>

            <div className="pt-qr-status">
              <div className="pt-pulse" />
              <span>Đang chờ thanh toán... Hệ thống tự động xác nhận</span>
            </div>

            <button onClick={() => setStep("method")} className="pt-btn-back">← Chọn phương thức khác</button>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === "success" && (
          <div className="pt-card pt-card-success">
            <div className="pt-success-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2>Thanh toán thành công!</h2>
            <p>Đơn <b>{order?.orderCode}</b> đã được xác nhận</p>
            <p className="pt-success-sub">Đang chuyển trang...</p>
            <div className="pt-success-bar">
              <div className="pt-success-bar-fill" />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .pt-page {
          position: relative;
          min-height: 100vh;
          padding: 40px 16px 80px;
          background: var(--bg-0);
          overflow: hidden;
        }

        .pt-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.35;
          pointer-events: none;
          animation: float 8s ease-in-out infinite;
        }
        .pt-glow-1 { width: 400px; height: 400px; background: #a78bfa; top: -100px; left: -100px; }
        .pt-glow-2 { width: 350px; height: 350px; background: #7c3aed; top: 40%; right: -100px; animation-delay: 2s; }
        .pt-glow-3 { width: 300px; height: 300px; background: #10b981; bottom: -100px; left: 20%; animation-delay: 4s; }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.1); }
        }

        .pt-container {
          position: relative;
          z-index: 1;
          max-width: 640px;
          margin: 0 auto;
        }

        .pt-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .pt-header h1 {
          font-size: 36px;
          font-weight: 900;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #7c3aed, #a78bfa, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }
        .pt-header p {
          color: var(--text-2);
          font-size: 15px;
        }

        /* Steps */
        .pt-steps {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(167, 139, 250, 0.15);
          border-radius: 16px;
        }
        .pt-step {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pt-step-num {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: rgba(167, 139, 250, 0.1);
          color: var(--text-2);
          font-size: 13px;
          font-weight: 800;
          border: 2px solid rgba(167, 139, 250, 0.2);
          transition: all 0.3s;
        }
        .pt-step-num.active {
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 16px rgba(124, 58, 237, 0.4);
          transform: scale(1.1);
        }
        .pt-step-num.done {
          background: linear-gradient(135deg, #10b981, #34d399);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .pt-step-label {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-2);
          transition: color 0.3s;
        }
        .pt-step-label.active {
          color: var(--accent-bright);
        }
        .pt-step-line {
          flex: 1;
          height: 2px;
          background: rgba(167, 139, 250, 0.15);
          border-radius: 2px;
          margin: 0 12px;
          transition: background 0.3s;
        }
        .pt-step-line.done {
          background: linear-gradient(90deg, #10b981, #34d399);
        }

        .pt-error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(248, 113, 113, 0.05));
          border: 1.5px solid rgba(239, 68, 68, 0.3);
          color: #dc2626;
          border-radius: 14px;
          font-size: 13.5px;
          font-weight: 600;
          margin-bottom: 16px;
          animation: shake 0.4s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        /* Card */
        .pt-card {
          padding: 28px;
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(20px);
          border: 1.5px solid rgba(167, 139, 250, 0.2);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(124, 58, 237, 0.08), 0 8px 24px rgba(0, 0, 0, 0.04);
          animation: cardIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Field */
        .pt-field { margin-bottom: 20px; }
        .pt-label {
          display: block;
          font-weight: 700;
          margin-bottom: 10px;
          font-size: 14px;
          color: var(--text-0);
        }
        .pt-req { color: #ef4444; }

        .pt-input-wrap { position: relative; }
        .pt-input {
          width: 100%;
          padding: 14px 48px 14px 18px;
          background: rgba(255, 255, 255, 0.7);
          border: 2px solid rgba(167, 139, 250, 0.2);
          border-radius: 14px;
          font-size: 15px;
          font-family: inherit;
          color: var(--text-0);
          outline: none;
          transition: all 0.3s;
        }
        .pt-input:focus {
          border-color: #7c3aed;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
        }
        .pt-input.valid { border-color: #10b981; background: #f0fdf4; }
        .pt-input.invalid { border-color: #ef4444; background: #fef2f2; }

        .pt-input-icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
        }
        .pt-ok { color: #10b981; font-size: 22px; font-weight: 900; animation: popIn 0.3s; }
        .pt-err { color: #ef4444; font-size: 22px; font-weight: 900; animation: popIn 0.3s; }
        .pt-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(167, 139, 250, 0.2);
          border-top-color: #7c3aed;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }

        /* Profile */
        .pt-profile {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 14px;
          padding: 14px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.04));
          border: 1.5px solid rgba(16, 185, 129, 0.3);
          border-radius: 14px;
          animation: slideIn 0.4s;
        }
        .pt-avatar-wrap {
          width: 52px; height: 52px;
          flex-shrink: 0;
        }
        .pt-avatar {
          width: 100%; height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 2.5px solid #10b981;
          background: #1a1230;
        }
        .pt-avatar-fallback {
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: #fff;
          font-size: 20px;
          font-weight: 900;
        }
        .pt-profile-info { flex: 1; min-width: 0; }
        .pt-profile-name {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-0);
          margin-bottom: 2px;
        }
        .pt-profile-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: #16a34a;
          font-weight: 700;
        }
        .pt-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #10b981;
          animation: pulseDot 1.5s infinite;
        }
        @keyframes pulseDot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
          50% { box-shadow: 0 0 0 5px rgba(16, 185, 129, 0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Buttons */
        .pt-btn {
          width: 100%;
          padding: 16px 24px;
          border: none;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 800;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }
        .pt-btn-primary {
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: #fff;
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
        }
        .pt-btn-primary:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(124, 58, 237, 0.45);
        }
        .pt-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(0.3);
        }
        .pt-btn-back {
          width: 100%;
          margin-top: 12px;
          padding: 12px;
          background: transparent;
          border: none;
          color: var(--text-2);
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 10px;
          transition: all 0.2s;
        }
        .pt-btn-back:hover {
          background: rgba(167, 139, 250, 0.08);
          color: var(--accent-bright);
        }

        /* Summary */
        .pt-summary {
          padding: 20px;
          background: linear-gradient(135deg, rgba(167, 139, 250, 0.06), rgba(124, 58, 237, 0.03));
          border: 1.5px solid rgba(167, 139, 250, 0.2);
          border-radius: 16px;
          margin-bottom: 20px;
        }
        .pt-summary-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px dashed rgba(167, 139, 250, 0.2);
        }
        .pt-summary-icon { font-size: 20px; }
        .pt-summary-title {
          font-size: 15px;
          font-weight: 800;
          color: var(--text-0);
        }
        .pt-summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          margin-bottom: 10px;
        }
        .pt-summary-row span { color: var(--text-2); }
        .pt-summary-row b { color: var(--text-0); font-weight: 700; }
        .pt-summary-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 14px;
          margin-top: 8px;
          border-top: 1px dashed rgba(167, 139, 250, 0.2);
        }
        .pt-summary-total span {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-0);
        }
        .pt-summary-total b {
          font-size: 22px;
          font-weight: 900;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Method */
        .pt-method {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 18px;
          margin-bottom: 12px;
          background: rgba(255, 255, 255, 0.7);
          border: 2px solid rgba(167, 139, 250, 0.2);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: left;
          font-family: inherit;
        }
        .pt-method:hover:not(.disabled) {
          transform: translateY(-2px);
          border-color: #7c3aed;
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.15);
        }
        .pt-method.balance {
          border-color: rgba(16, 185, 129, 0.4);
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(52, 211, 153, 0.02));
        }
        .pt-method.balance:hover:not(.disabled) {
          border-color: #10b981;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
        }
        .pt-method.bank {
          border-color: rgba(124, 58, 237, 0.4);
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(167, 139, 250, 0.02));
        }
        .pt-method.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .pt-method-icon { font-size: 28px; }
        .pt-method-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .pt-method-info b {
          font-size: 15px;
          font-weight: 800;
          color: var(--text-0);
        }
        .pt-method-info span {
          font-size: 13px;
          color: var(--text-2);
        }
        .pt-method-arrow {
          font-size: 20px;
          color: var(--text-2);
          transition: transform 0.3s;
        }
        .pt-method:hover .pt-method-arrow {
          transform: translateX(4px);
          color: #7c3aed;
        }

        .pt-warning {
          padding: 12px 16px;
          margin-bottom: 12px;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(245, 158, 11, 0.05));
          border: 1.5px solid rgba(251, 191, 36, 0.3);
          color: #d97706;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
        }
        .pt-warning a {
          color: #7c3aed;
          font-weight: 800;
          text-decoration: underline;
        }

        /* QR */
        .pt-card-qr { text-align: center; }
        .pt-qr-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .pt-qr-header h2 {
          font-size: 22px;
          font-weight: 900;
          color: var(--text-0);
        }
        .pt-timer {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1));
          color: #d97706;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 800;
          border: 1.5px solid rgba(251, 191, 36, 0.3);
        }
        .pt-timer-icon { font-size: 16px; }

        .pt-qr-info {
          padding: 16px;
          background: rgba(167, 139, 250, 0.05);
          border-radius: 14px;
          margin-bottom: 20px;
          text-align: left;
        }
        .pt-qr-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .pt-qr-row:last-child { margin-bottom: 0; }
        .pt-qr-row span { color: var(--text-2); }
        .pt-qr-row b { color: var(--text-0); font-weight: 700; }
        .pt-code {
          font-family: monospace;
          color: #7c3aed !important;
          font-size: 15px;
          letter-spacing: 1px;
        }

        .pt-qr-wrap {
          position: relative;
          display: inline-block;
          padding: 20px;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 12px 40px rgba(124, 58, 237, 0.15);
          margin-bottom: 20px;
        }
        .pt-qr-img {
          width: 260px;
          height: 260px;
          display: block;
          border-radius: 12px;
        }
        .pt-qr-corners {
          position: absolute;
          inset: -8px;
          pointer-events: none;
        }
        .pt-corner {
          position: absolute;
          width: 24px;
          height: 24px;
          border: 3px solid #7c3aed;
        }
        .pt-corner.tl { top: 0; left: 0; border-right: none; border-bottom: none; border-radius: 12px 0 0 0; }
        .pt-corner.tr { top: 0; right: 0; border-left: none; border-bottom: none; border-radius: 0 12px 0 0; }
        .pt-corner.bl { bottom: 0; left: 0; border-right: none; border-top: none; border-radius: 0 0 0 12px; }
        .pt-corner.br { bottom: 0; right: 0; border-left: none; border-top: none; border-radius: 0 0 12px 0; }

        .pt-qr-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.04));
          border: 1.5px solid rgba(16, 185, 129, 0.3);
          border-radius: 14px;
          font-size: 13.5px;
          color: #16a34a;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .pt-pulse {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #10b981;
          animation: pulseDot 1.5s infinite;
        }

        /* Success */
        .pt-card-success {
          text-align: center;
          padding: 48px 28px;
        }
        .pt-success-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.08));
          color: #10b981;
          margin-bottom: 20px;
          animation: successPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes successPop {
          0% { transform: scale(0); opacity: 0; }
          80% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .pt-card-success h2 {
          font-size: 26px;
          font-weight: 900;
          color: #16a34a;
          margin-bottom: 12px;
        }
        .pt-card-success p {
          font-size: 15px;
          color: var(--text-1);
          margin-bottom: 6px;
        }
        .pt-success-sub {
          color: var(--text-2) !important;
          font-size: 13.5px !important;
        }
        .pt-success-bar {
          width: 200px;
          height: 4px;
          background: rgba(16, 185, 129, 0.15);
          border-radius: 4px;
          margin: 20px auto 0;
          overflow: hidden;
        }
        .pt-success-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #34d399);
          animation: barFill 2.5s ease-out forwards;
        }
        @keyframes barFill {
          from { width: 0%; }
          to { width: 100%; }
        }

        /* Mobile */
        @media (max-width: 480px) {
          .pt-header h1 { font-size: 28px; }
          .pt-card { padding: 20px 16px; border-radius: 20px; }
          .pt-step-label { display: none; }
          .pt-qr-img { width: 220px; height: 220px; }
          .pt-summary-total b { font-size: 18px; }
        }
      `}</style>
    </div>
  );
}
