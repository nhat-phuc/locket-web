"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PaymentModal from "@/components/PaymentModal";

interface Order {
  id: string;
  orderCode: string;
  serviceName: string;
  finalAmount: number;
  locketUsername: string;
  status: string;
  expiresAt: string | null;
}

interface LocketProfile {
  valid: boolean;
  username?: string;
  avatar?: string | null;
  message?: string;
}

type Step = "info" | "method";

export default function ThanhToanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("serviceId");
  const packageId = searchParams.get("packageId");

  const [user, setUser] = useState<{ username: string; email?: string } | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [locketUsername, setLocketUsername] = useState("");
  const [coupon, setCoupon] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<Step>("info");
  const [method, setMethod] = useState<"balance" | "bank" | null>(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [paying, setPaying] = useState(false);

  // Username validation
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState("");
  const [profile, setProfile] = useState<LocketProfile | null>(null);

  // Load user + balance
  useEffect(() => {
    const stored = sessionStorage.getItem("locket_user");
    if (!stored) {
      router.push("/dang-nhap");
      return;
    }
    try {
      const u = JSON.parse(stored);
      setUser(u);
      if (u.email) {
        fetch(`/api/balance?email=${encodeURIComponent(u.email)}`)
          .then((r) => r.json())
          .then((d) => {
            if (typeof d.balance === "number") setBalance(d.balance);
          })
          .catch(() => {});
      }
    } catch {}
  }, [router]);

  useEffect(() => {
    if (step === "method" && user?.email) {
      fetch(`/api/balance?email=${encodeURIComponent(user.email)}`)
        .then((r) => r.json())
        .then((d) => {
          if (typeof d.balance === "number") setBalance(d.balance);
        })
        .catch(() => {});
    }
  }, [step, user?.email]);

  // ===== VALIDATE USERNAME (debounce 500ms) =====
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
        const res = await fetch(
          `/api/locket/check?username=${encodeURIComponent(trimmed)}`
        );
        const data: LocketProfile = await res.json();

        if (data.valid) {
          setUsernameValid(true);
          setUsernameError("");
          setProfile(data);
        } else {
          setUsernameValid(false);
          setUsernameError(data.message || "Username hoặc link bị sai");
          setProfile(null);
        }
      } catch {
        setUsernameValid(false);
        setUsernameError("Không thể kiểm tra, vui lòng thử lại");
        setProfile(null);
      } finally {
        setUsernameChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [locketUsername]);

  const handleCreateOrder = async () => {
    if (!serviceId) {
      setError("Thiếu thông tin dịch vụ");
      return;
    }
    if (!locketUsername.trim()) {
      setError("Vui lòng nhập username Locket");
      return;
    }
    if (usernameValid !== true) {
      setError(usernameError || "Username hoặc link bị sai");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          packageId: packageId || undefined,
          locketUsername: profile?.username || locketUsername.trim(),
          couponCode: coupon.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setStep("method");
      } else {
        setError(data.message || "Không thể tạo đơn");
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const handlePayWithBalance = async () => {
    if (!order) return;
    setPaying(true);
    setError("");
    try {
      const res = await fetch("/api/payments/pay-with-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/thanh-toan/thanh-cong?orderId=${order.id}`);
      } else {
        if (data.code === "INSUFFICIENT_BALANCE") {
          setError(
            `Số dư không đủ. Cần ${order.finalAmount.toLocaleString("vi-VN")}đ, hiện có ${(balance || 0).toLocaleString("vi-VN")}đ`
          );
        } else {
          setError(data.message || "Thanh toán thất bại");
        }
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setPaying(false);
    }
  };

  const handleConfirm = async () => {
    if (!method) {
      setError("Vui lòng chọn phương thức thanh toán");
      return;
    }
    if (method === "balance") await handlePayWithBalance();
    else setShowBankModal(true);
  };

  const handleSuccess = () => router.push("/thanh-toan/thanh-cong");

  if (!user) return null;

  const notEnough = balance !== null && order !== null && balance < order.finalAmount;
  const remaining = balance !== null && order !== null ? balance - order.finalAmount : 0;

  return (
    <div className="pay-wrap">
      <div className="pay-head">
        <h1 className="pay-h1">Thanh toán</h1>
        <p className="pay-sub">
          {step === "info" ? "Hoàn tất thông tin để tạo đơn hàng" : "Chọn phương thức thanh toán"}
        </p>
        <div className="pay-steps">
          <div className={`pay-step ${step === "info" ? "is-active" : "is-done"}`}>
            <span className="pay-step-num">1</span>
            <span className="pay-step-lbl">Thông tin</span>
          </div>
          <div className={`pay-step-line ${step === "method" ? "is-done" : ""}`} />
          <div className={`pay-step ${step === "method" ? "is-active" : ""}`}>
            <span className="pay-step-num">2</span>
            <span className="pay-step-lbl">Thanh toán</span>
          </div>
        </div>
      </div>

      {error && <div className="pay-error">{error}</div>}

      {/* ============ STEP 1 ============ */}
      {step === "info" && (
        <div className="pay-card">
          <div className="pay-field">
            <label>
              Username Locket <span className="pay-req">*</span>
            </label>
            <div className="pay-input-wrap">
              <input
                type="text"
                value={locketUsername}
                onChange={(e) => setLocketUsername(e.target.value)}
                placeholder="username hoặc link Locket"
                autoFocus
                className={
                  usernameValid === true
                    ? "is-valid"
                    : usernameValid === false
                    ? "is-invalid"
                    : ""
                }
              />
              {usernameChecking && (
                <div className="pay-input-status">
                  <div className="pay-mini-spinner" />
                </div>
              )}
              {!usernameChecking && usernameValid === true && (
                <div className="pay-input-status pay-status-ok">✓</div>
              )}
              {!usernameChecking && usernameValid === false && (
                <div className="pay-input-status pay-status-err">✕</div>
              )}
            </div>

            {/* Profile preview khi đúng */}
            {!usernameChecking && usernameValid === true && profile && (
              <div className="pay-profile-preview">
                {profile.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar}
                    alt={profile.username || "avatar"}
                    className="pay-profile-avatar"
                  />
                ) : (
                  <div className="pay-profile-avatar pay-profile-avatar-fallback">
                    {(profile.username || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="pay-profile-info">
                  <div className="pay-profile-name">@{profile.username}</div>
                  <div className="pay-profile-status">✓ Đã tìm thấy trên Locket</div>
                </div>
              </div>
            )}

            {usernameError ? (
              <small className="pay-hint-error">{usernameError}</small>
            ) : usernameValid === true ? null : (
              <small className="pay-hint">
                Chúng tôi không cần mật khẩu, chỉ cần username công khai
              </small>
            )}
          </div>

          <div className="pay-field">
            <label>Mã giảm giá (nếu có)</label>
            <input
              type="text"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              placeholder="Nhập mã giảm giá"
              className="pay-input"
            />
          </div>

          <button
            onClick={handleCreateOrder}
            disabled={loading || usernameValid !== true}
            className="pay-btn"
          >
            {loading ? "Đang xử lý..." : "Tạo đơn và thanh toán"}
          </button>
        </div>
      )}

      {/* ============ STEP 2 ============ */}
      {step === "method" && order && (
        <div className="pay-card">
          <div className="pay-summary">
            <div className="pay-summary-row">
              <span>Đơn hàng</span>
              <b>{order.orderCode}</b>
            </div>
            <div className="pay-summary-row">
              <span>Dịch vụ</span>
              <b>{order.serviceName}</b>
            </div>
            <div className="pay-summary-row">
              <span>Username</span>
              <b>@{order.locketUsername}</b>
            </div>
            <div className="pay-summary-row pay-summary-total">
              <span>Tổng tiền</span>
              <b>{order.finalAmount.toLocaleString("vi-VN")}đ</b>
            </div>
          </div>

          <div className="pay-methods">
            <button
              type="button"
              onClick={() => !notEnough && setMethod("balance")}
              disabled={notEnough}
              className={`pay-method ${method === "balance" ? "is-on" : ""} ${notEnough ? "is-disabled" : ""}`}
            >
              <div className="pay-method-radio">
                {method === "balance" && <div className="pay-method-dot" />}
              </div>
              <div className="pay-method-body">
                <div className="pay-method-title">
                  <span className="pay-method-icon">💰</span>
                  Số dư tài khoản
                </div>
                <div className="pay-method-desc">
                  {balance === null ? (
                    "Đang tải số dư..."
                  ) : notEnough ? (
                    <>
                      Số dư: <b className="pay-warn">{balance.toLocaleString("vi-VN")}đ</b> — Không đủ (cần thêm {(order.finalAmount - balance).toLocaleString("vi-VN")}đ)
                    </>
                  ) : (
                    <>
                      Số dư: <b>{balance.toLocaleString("vi-VN")}đ</b> — Còn lại: <b className="pay-ok">{remaining.toLocaleString("vi-VN")}đ</b>
                    </>
                  )}
                </div>
                {notEnough && (
                  <div className="pay-method-action">
                    <a href="/nap-tien" className="pay-topup" onClick={(e) => e.stopPropagation()}>
                      + Nạp thêm tiền
                    </a>
                  </div>
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMethod("bank")}
              className={`pay-method ${method === "bank" ? "is-on" : ""}`}
            >
              <div className="pay-method-radio">
                {method === "bank" && <div className="pay-method-dot" />}
              </div>
              <div className="pay-method-body">
                <div className="pay-method-title">
                  <span className="pay-method-icon">🏦</span>
                  Chuyển khoản ngân hàng
                </div>
                <div className="pay-method-desc">Quét mã QR — Hệ thống tự động xác nhận trong 1-2 phút</div>
              </div>
            </button>
          </div>

          <button onClick={handleConfirm} disabled={!method || paying} className="pay-btn">
            {paying ? "Đang xử lý..." : method === "bank" ? "Hiện mã QR thanh toán" : "Xác nhận thanh toán"}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep("info");
              setOrder(null);
              setMethod(null);
              setError("");
            }}
            className="pay-btn-back"
          >
            ← Quay lại
          </button>
        </div>
      )}

      {showBankModal && order && (
        <PaymentModal order={order} onClose={() => setShowBankModal(false)} onSuccess={handleSuccess} />
      )}

      <style jsx>{`
        .pay-wrap { width: 100%; max-width: 560px; margin: 40px auto 60px; padding: 0 16px; }
        .pay-head { text-align: center; margin-bottom: 28px; }
        .pay-h1 { font-size: 30px; font-weight: 900; color: var(--text-0); margin-bottom: 6px; letter-spacing: -0.02em; }
        .pay-sub { font-size: 14px; color: var(--text-2); }
        .pay-steps { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 24px; }
        .pay-step { display: flex; align-items: center; gap: 8px; color: var(--text-2); font-size: 12px; font-weight: 700; }
        .pay-step.is-active { color: #7c3aed; }
        .pay-step.is-done { color: #10b981; }
        .pay-step-num { width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; background: #f3f4f6; color: var(--text-2); font-size: 12px; font-weight: 800; border: 1.5px solid var(--border); }
        .pay-step.is-active .pay-step-num { background: linear-gradient(135deg, #7c3aed, #a78bfa); color: var(--text-0); border-color: transparent; box-shadow: 0 4px 12px rgba(124,58,237,0.35); }
        .pay-step.is-done .pay-step-num { background: #10b981; color: var(--text-0); border-color: transparent; }
        .pay-step-line { width: 40px; height: 2px; background: #e5e7eb; border-radius: 2px; }
        .pay-step-line.is-done { background: #10b981; }
        .pay-error { padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; border-radius: 12px; font-size: 13.5px; margin-bottom: 16px; }
        .pay-card { background: var(--bg-1); border: 1px solid var(--border); border-radius: 20px; padding: 28px 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); }
        @media (max-width: 500px) { .pay-card { padding: 20px 16px; } .pay-h1 { font-size: 24px; } }
        .pay-field { margin-bottom: 20px; }
        .pay-field label { display: block; font-size: 13.5px; font-weight: 700; color: #1f2937; margin-bottom: 8px; }
        .pay-req { color: #ef4444; }
        .pay-input-wrap { position: relative; }
        .pay-input-wrap input { width: 100%; padding: 13px 42px 13px 16px; background: var(--bg-2); border: 1.5px solid var(--border); border-radius: 12px; font-size: 14.5px; font-family: inherit; color: var(--text-0); outline: none; transition: all 0.2s; }
        .pay-input-wrap input:focus { border-color: #7c3aed; background: var(--bg-1); box-shadow: 0 0 0 4px rgba(124,58,237,0.1); }
        .pay-input-wrap input.is-valid { border-color: #10b981; background: #f0fdf4; }
        .pay-input-wrap input.is-invalid { border-color: #ef4444; background: #fef2f2; }
        .pay-input-status { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 16px; font-weight: 900; display: grid; place-items: center; }
        .pay-status-ok { color: #10b981; }
        .pay-status-err { color: #ef4444; }
        .pay-mini-spinner { width: 16px; height: 16px; border: 2px solid #e5e7eb; border-top-color: #7c3aed; border-radius: 50%; animation: paySpin 0.6s linear infinite; }
        @keyframes paySpin { to { transform: rotate(360deg); } }
        .pay-hint { display: block; margin-top: 8px; font-size: 12px; color: var(--text-2); line-height: 1.5; }
        .pay-hint-error { display: block; margin-top: 8px; font-size: 12px; color: #ef4444; font-weight: 600; line-height: 1.5; }
        .pay-profile-preview { display: flex; align-items: center; gap: 12px; margin-top: 12px; padding: 12px 14px; background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; animation: payFadeIn 0.3s ease; }
        @keyframes payFadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .pay-profile-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid #10b981; flex-shrink: 0; }
        .pay-profile-avatar-fallback { display: grid; place-items: center; background: linear-gradient(135deg, #7c3aed, #a78bfa); color: var(--text-0); font-weight: 900; font-size: 20px; }
        .pay-profile-info { flex: 1; min-width: 0; }
        .pay-profile-name { font-size: 14px; font-weight: 800; color: #065f46; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pay-profile-status { font-size: 11.5px; color: #059669; margin-top: 2px; font-weight: 600; }
        .pay-btn { width: 100%; padding: 15px; background: linear-gradient(135deg, #7c3aed, #a78bfa); color: var(--text-0); border: none; border-radius: 12px; font-size: 15px; font-weight: 800; font-family: inherit; cursor: pointer; transition: all 0.25s; box-shadow: 0 8px 24px rgba(124,58,237,0.3); margin-top: 8px; }
        .pay-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(124,58,237,0.45); }
        .pay-btn:active:not(:disabled) { transform: translateY(0); }
        .pay-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .pay-btn-back { width: 100%; padding: 12px; background: transparent; border: none; color: var(--text-2); font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; margin-top: 8px; border-radius: 10px; }
        .pay-btn-back:hover { background: var(--bg-2); color: var(--text-0); }
        .pay-summary { padding: 16px 18px; background: var(--bg-2); border: 1px solid var(--border); border-radius: 14px; margin-bottom: 24px; }
        .pay-summary-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; font-size: 13.5px; color: var(--text-2); gap: 12px; }
        .pay-summary-row b { color: var(--text-0); font-weight: 700; text-align: right; word-break: break-word; }
        .pay-summary-total { padding-top: 12px; margin-top: 6px; border-top: 1px dashed #d1d5db; font-size: 14.5px; }
        .pay-summary-total b { font-size: 20px; background: linear-gradient(135deg, #7c3aed, #ec4899); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .pay-methods { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
        .pay-method { display: flex; align-items: flex-start; gap: 14px; padding: 16px; background: var(--bg-1); border: 2px solid #e5e7eb; border-radius: 14px; cursor: pointer; transition: all 0.25s; text-align: left; font-family: inherit; width: 100%; }
        .pay-method:hover:not(:disabled) { border-color: #c4b5fd; background: #faf5ff; }
        .pay-method.is-on { border-color: #7c3aed; background: #faf5ff; box-shadow: 0 0 0 4px rgba(124,58,237,0.1); }
        .pay-method.is-disabled { opacity: 0.65; cursor: not-allowed; }
        .pay-method-radio { width: 22px; height: 22px; border: 2px solid #d1d5db; border-radius: 50%; display: grid; place-items: center; flex-shrink: 0; margin-top: 2px; transition: all 0.2s; }
        .pay-method.is-on .pay-method-radio { border-color: #7c3aed; }
        .pay-method-dot { width: 10px; height: 10px; background: #7c3aed; border-radius: 50%; }
        .pay-method-body { flex: 1; min-width: 0; }
        .pay-method-title { display: flex; align-items: center; gap: 8px; font-size: 14.5px; font-weight: 800; color: var(--text-0); margin-bottom: 4px; }
        .pay-method-icon { font-size: 18px; }
        .pay-method-desc { font-size: 12.5px; color: var(--text-2); line-height: 1.5; }
        .pay-method-desc b { color: var(--text-0); font-weight: 700; }
        .pay-warn { color: #ef4444 !important; }
        .pay-ok { color: #10b981 !important; }
        .pay-method-action { margin-top: 8px; }
        .pay-topup { display: inline-block; padding: 5px 12px; background: #fef3c7; color: #b45309; font-size: 12px; font-weight: 700; border-radius: 8px; text-decoration: none; border: 1px solid #fde68a; }
        .pay-topup:hover { background: #fde68a; }
      `}</style>
    </div>
  );
}
