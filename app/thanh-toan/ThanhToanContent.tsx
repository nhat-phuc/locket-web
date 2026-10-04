"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Pkg { id: string; name: string; duration: string; price: number; originalPrice?: number | null; }
interface Service { id: string; name: string; slug: string; type: string; price: number; packages?: Pkg[]; }
interface Order { id: string; orderCode: string; serviceName: string; finalAmount: number; locketUsername: string; status: string; }

type Step = "info" | "method" | "qr" | "success";

export default function ThanhToanContent() {
  const router = useRouter();
  const params = useSearchParams();
  const serviceId = params.get("serviceId");
  const packageId = params.get("packageId");

  const [balance, setBalance] = useState(0);
  const [service, setService] = useState<Service | null>(null);
  const [pkg, setPkg] = useState<Pkg | null>(null);
  const [locketUsername, setLocketUsername] = useState("");
  const [coupon, setCoupon] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [step, setStep] = useState<Step>("info");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState("");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => { if (!serviceId) router.push("/bang-gia"); }, [serviceId, router]);

  useEffect(() => {
    if (!serviceId) return;
    fetch("/api/services").then(r => r.json()).then(d => {
      const s = (d.services || []).find((x: any) => x.slug === serviceId || x.id === serviceId || x.type === serviceId);
      if (s) {
        setService(s);
        if (packageId) {
          const p = (s.packages || []).find((x: Pkg) => x.id === packageId);
          setPkg(p || s.packages?.[0] || null);
        } else setPkg(s.packages?.[0] || null);
      }
    }).catch(() => {});
  }, [serviceId, packageId]);

  const loadBalance = () => {
    const stored = sessionStorage.getItem("locket_user");
    if (!stored) { router.push("/dang-nhap"); return; }
    try {
      const u = JSON.parse(stored);
      if (u.email) fetch(`/api/balance?email=${encodeURIComponent(u.email)}`)
        .then(r => r.json()).then(d => { if (typeof d.balance === "number") setBalance(d.balance); }).catch(() => {});
    } catch {}
  };

  useEffect(() => { loadBalance(); }, [router]);

  useEffect(() => {
    const t = locketUsername.trim();
    if (!t || t.length < 2) { setUsernameValid(null); setUsernameError(""); setUsernameChecking(false); setProfile(null); return; }
    setUsernameChecking(true);
    const timer = setTimeout(async () => {
      try {
        const r = await fetch(`/api/locket/check?username=${encodeURIComponent(t)}`);
        const d = await r.json();
        if (d.valid) { setUsernameValid(true); setUsernameError(""); setProfile(d); }
        else { setUsernameValid(false); setUsernameError(d.message || "Username không đúng"); setProfile(null); }
      } catch { setUsernameValid(false); setUsernameError("Không thể kiểm tra"); setProfile(null); }
      finally { setUsernameChecking(false); }
    }, 600);
    return () => clearTimeout(timer);
  }, [locketUsername]);

  useEffect(() => {
    if (step !== "qr" || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(v => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [step, timeLeft]);

  useEffect(() => {
    if (step !== "qr" || !order) return;
    const check = async () => {
      try {
        const r = await fetch(`/api/payments/check?orderId=${order.id}`, { cache: "no-store" });
        const d = await r.json();
        if (d.success && (d.status === "paid" || d.status === "completed")) {
          setStep("success");
          setTimeout(() => router.push(`/thanh-toan/thanh-cong?orderId=${order.id}`), 2500);
        }
      } catch {}
    };
    check();
    const iv = setInterval(check, 3000);
    return () => clearInterval(iv);
  }, [step, order, router]);

  const currentPrice = pkg?.price || service?.price || 0;
  const currentOriginal = pkg?.originalPrice || 0;

  const createOrder = async () => {
    if (!serviceId) return setError("Thiếu thông tin");
    if (usernameValid !== true) return setError(usernameError || "Username không đúng");
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, packageId: pkg?.id || undefined, locketUsername: profile?.username || locketUsername.trim(), couponCode: coupon.trim() || undefined }),
      });
      const d = await r.json();
      if (d.success) { setOrder(d.order); setStep("method"); }
      else setError(d.message || "Không thể tạo đơn");
    } catch { setError("Lỗi kết nối"); }
    finally { setLoading(false); }
  };

  const openConfirm = () => {
    if (!order) return;
    if (balance < order.finalAmount) return;
    setShowConfirm(true);
  };

  const confirmPay = async () => {
    if (!order) return;
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/payments/pay-with-balance", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const d = await r.json();
      if (d.success) {
        setShowConfirm(false);
        setShowSuccess(true);
        loadBalance();
        setTimeout(() => router.push(`/thanh-toan/thanh-cong?orderId=${order.id}`), 2500);
      } else {
        setShowConfirm(false);
        setError(d.message || "Thanh toán thất bại");
      }
    } catch { setShowConfirm(false); setError("Lỗi kết nối"); }
    finally { setLoading(false); }
  };

  const showQR = async () => {
    if (!order) return;
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/payments/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, paymentMethod: "bank_transfer" }),
      });
      const d = await r.json();
      if (d.success) { setStep("qr"); setTimeLeft(15 * 60); }
      else setError(d.message || "Không tạo được QR");
    } catch { setError("Lỗi kết nối"); }
    finally { setLoading(false); }
  };

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";
  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const notEnough = balance < (order?.finalAmount || 0);

  if (!serviceId) return <div style={{ padding: 80, textAlign: "center" }}>Đang chuyển hướng...</div>;

  return (
    <div className="pt-page">
      <div className="pt-bg pt-bg-1" />
      <div className="pt-bg pt-bg-2" />

      <div className="pt-wrap">
        <div className="pt-head">
          <h1>Thanh toán</h1>
          <p>Hoàn tất đơn hàng chỉ trong vài giây</p>
        </div>

        {error && <div className="pt-alert">⚠ {error}</div>}

        {step === "info" && (
          <div className="pt-card">
            <div className="pt-banner">
              <div>
                <div className="pt-banner-lbl">DỊCH VỤ</div>
                <div className="pt-banner-name">{service?.name || "..."}</div>
                <div className="pt-banner-pkg">{pkg?.name || "—"}</div>
              </div>
              <div className="pt-banner-right">
                {currentOriginal > currentPrice && <div className="pt-banner-old">{fmt(currentOriginal)}</div>}
                <div className="pt-banner-final">{fmt(currentPrice)}</div>
              </div>
            </div>

            <div className="pt-field">
              <label className="pt-lbl">Username Locket <span className="pt-req">*</span></label>
              <div className={`pt-input-box ${usernameValid === true ? "ok" : ""} ${usernameValid === false ? "err" : ""}`}>
                <span className="pt-input-ico">@</span>
                <input type="text" value={locketUsername} onChange={e => setLocketUsername(e.target.value)} placeholder="username hoặc link locket" className="pt-input" />
                <span className="pt-status">
                  {usernameChecking && <span className="pt-spin" />}
                  {!usernameChecking && usernameValid === true && <span className="pt-ok">✓</span>}
                  {!usernameChecking && usernameValid === false && <span className="pt-err-icon">✕</span>}
                </span>
              </div>
              {usernameError && <div className="pt-hint-err">{usernameError}</div>}
              {usernameValid === true && profile && (
                <div className="pt-profile">
                  <div className="pt-avatar">
                    {profile.avatar ? <img src={profile.avatar} alt="" referrerPolicy="no-referrer" /> : <span>{(profile.username || "U").charAt(0).toUpperCase()}</span>}
                  </div>
                  <div>
                    <div className="pt-profile-name">@{profile.username}</div>
                    <div className="pt-profile-ok">● Đã xác thực</div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-field">
              <label className="pt-lbl">Mã giảm giá</label>
              <input type="text" value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} placeholder="Nhập mã (nếu có)" className="pt-input-simple" />
            </div>

            <button onClick={createOrder} disabled={loading || usernameValid !== true} className="pt-btn-primary">
              {loading ? "Đang xử lý..." : "Tiếp tục →"}
            </button>
            <button onClick={() => router.push("/bang-gia")} className="pt-btn-ghost">← Đổi gói khác</button>
          </div>
        )}

        {step === "method" && order && (
          <div className="pt-card">
            <div className="pt-order-info">
              <div className="pt-order-row"><span>Mã đơn</span><b className="pt-mono">{order.orderCode}</b></div>
              <div className="pt-order-row"><span>Dịch vụ</span><b>{order.serviceName}</b></div>
              <div className="pt-order-total"><span>Tổng cộng</span><strong>{fmt(order.finalAmount)}</strong></div>
            </div>

            <h3 className="pt-pick">Chọn phương thức</h3>

            <div className="pt-method-wrap">
              <button onClick={openConfirm} disabled={loading || notEnough} className={`pt-method ${notEnough ? "off" : ""}`}>
                <div className="pt-method-ico">💰</div>
                <div className="pt-method-body">
                  <div className="pt-method-name">Trả bằng số dư</div>
                  <div className="pt-method-desc">
                    Số dư: <b>{fmt(balance)}</b>
                    {notEnough && <span className="pt-method-warn"> — không đủ</span>}
                  </div>
                </div>
                <div className="pt-method-arrow">→</div>
              </button>
              {notEnough && (
                <button onClick={() => router.push("/nap-tien")} className="pt-deposit-btn">
                  💳 Nạp tiền
                </button>
              )}
            </div>

            <button onClick={showQR} disabled={loading} className="pt-method">
              <div className="pt-method-ico">🏦</div>
              <div className="pt-method-body">
                <div className="pt-method-name">Chuyển khoản QR</div>
                <div className="pt-method-desc">Quét mã VietQR, tự động xác nhận</div>
              </div>
              <div className="pt-method-arrow">→</div>
            </button>

            <button onClick={() => setStep("info")} className="pt-btn-ghost">← Quay lại</button>
          </div>
        )}

                {step === "qr" && order && (
          <div className="pt-card">
            <div className="pt-qr2-head">
              <div className="pt-qr2-head-left">
                <div className="pt-qr2-icon">📱</div>
                <div>
                  <h2>Quét mã thanh toán</h2>
                  <p>Mở app ngân hàng để quét</p>
                </div>
              </div>
              <div className="pt-qr2-timer">⏱ {fmtTime(timeLeft)}</div>
            </div>

            <div className="pt-qr2-amount">
              <div className="pt-qr2-amount-lbl">SỐ TIỀN</div>
              <div className="pt-qr2-amount-val">{fmt(order.finalAmount)}</div>
              <div className="pt-qr2-code">Nội dung: <b style={{background:"#fef3c7",padding:"4px 8px",borderRadius:6,display:"inline-block",color:"#92400e"}}>{order.orderCode.replace(/[-\s]/g, "")}</b></div>
            </div>

            <div className="pt-qr2-body">
              <div className="pt-qr2-img-wrap">
                <img
                  src={`https://img.vietqr.io/image/TPBANK-36886368888-compact2.png?amount=${order.finalAmount}&addInfo=${encodeURIComponent(order.orderCode.replace(/[-\s]/g, ""))}&accountName=${encodeURIComponent("TRAN NHAT PHUC")}`}
                  alt="QR"
                  className="pt-qr2-img"
                />
              </div>

              <div className="pt-qr2-info">
                <div className="pt-qr2-info-item">
                  <div className="pt-qr2-info-lbl">Ngân hàng</div>
                  <div className="pt-qr2-info-val">TPBank</div>
                </div>
                <div className="pt-qr2-info-item">
                  <div className="pt-qr2-info-lbl">Số tài khoản</div>
                  <div className="pt-qr2-info-val pt-mono">36886368888</div>
                </div>
                <div className="pt-qr2-info-item">
                  <div className="pt-qr2-info-lbl">Chủ tài khoản</div>
                  <div className="pt-qr2-info-val">TRAN NHAT PHUC</div>
                </div>
                <div className="pt-qr2-info-item pt-qr2-info-hl">
                  <div className="pt-qr2-info-lbl">Nội dung CK</div>
                  <div className="pt-qr2-info-val pt-mono pt-purple">{order.orderCode.replace(/[-\s]/g, "")}</div>
                </div>
              </div>
            </div>

            <div className="pt-qr2-warn">
              ⚠️ Vui lòng giữ <b>nguyên nội dung CK</b> để hệ thống tự động xác nhận
            </div>

            <div className="pt-qr2-wait">
              <span className="pt-qr2-pulse" /> Đang chờ thanh toán...
            </div>

            <button onClick={() => setStep("method")} className="pt-btn-ghost">← Chọn phương thức khác</button>
          </div>
        )}


        {step === "success" && (
          <div className="pt-card pt-card-success">
            <div className="pt-success-ico">��</div>
            <h2>Thanh toán thành công!</h2>
            <p>Đơn <b className="pt-mono">{order?.orderCode}</b> đã được xác nhận</p>
            <p className="pt-dim">Đang chuyển trang...</p>
          </div>
        )}
      </div>

      {showConfirm && order && (
        <div className="pt-modal-overlay" onClick={() => !loading && setShowConfirm(false)}>
          <div className="pt-modal" onClick={e => e.stopPropagation()}>
            <div className="pt-modal-icon">💳</div>
            <h3>Xác nhận thanh toán</h3>
            <p className="pt-modal-text">Bạn có chắc muốn thanh toán đơn hàng này bằng số dư?</p>

            <div className="pt-modal-info">
              <div className="pt-modal-row"><span>Mã đơn</span><b className="pt-mono">{order.orderCode}</b></div>
              <div className="pt-modal-row"><span>Số tiền</span><b className="pt-modal-amount">{fmt(order.finalAmount)}</b></div>
              <div className="pt-modal-row"><span>Số dư hiện tại</span><b>{fmt(balance)}</b></div>
              <div className="pt-modal-row pt-modal-row-green"><span>Còn lại sau thanh toán</span><b>{fmt(balance - order.finalAmount)}</b></div>
            </div>

            <div className="pt-modal-actions">
              <button onClick={() => setShowConfirm(false)} disabled={loading} className="pt-modal-btn pt-modal-btn-cancel">Hủy</button>
              <button onClick={confirmPay} disabled={loading} className="pt-modal-btn pt-modal-btn-ok">
                {loading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="pt-modal-overlay">
          <div className="pt-modal pt-modal-success">
            <div className="pt-modal-success-icon">✅</div>
            <h3>Thanh toán thành công!</h3>
            <p className="pt-modal-text">Đơn hàng đã được xử lý.</p>
            <p className="pt-modal-sub">Đang chuyển trang...</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .pt-page { min-height: 100vh; padding: 40px 16px 80px; position: relative; overflow: hidden; }
        .pt-bg { position: absolute; border-radius: 50%; filter: blur(120px); opacity: .3; pointer-events: none; }
        .pt-bg-1 { width: 420px; height: 420px; background: #a78bfa; top: -140px; left: -100px; }
        .pt-bg-2 { width: 380px; height: 380px; background: #f472b6; bottom: -120px; right: -100px; }
        .pt-wrap { max-width: 520px; margin: 0 auto; position: relative; }
        .pt-head { text-align: center; margin-bottom: 24px; }
        .pt-head h1 { font-size: 32px; font-weight: 800; margin: 0 0 6px; background: linear-gradient(135deg, #7c3aed, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .pt-head p { color: #64748b; margin: 0; font-size: 14px; }
        .pt-alert { background: #fef2f2; color: #dc2626; padding: 12px 16px; border-radius: 12px; margin-bottom: 16px; font-size: 14px; border: 1px solid #fecaca; }
        .pt-card { background: #fff; border-radius: 24px; padding: 24px; box-shadow: 0 12px 40px rgba(124,58,237,.1); border: 1px solid #f1f5f9; }
        .pt-banner { display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #faf5ff, #fdf4ff); border: 1px solid #e9d5ff; border-radius: 16px; padding: 16px 18px; margin-bottom: 20px; }
        .pt-banner-lbl { font-size: 10px; font-weight: 800; letter-spacing: 1px; color: #a78bfa; margin-bottom: 4px; }
        .pt-banner-name { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 2px; }
        .pt-banner-pkg { font-size: 13px; color: #64748b; }
        .pt-banner-right { text-align: right; }
        .pt-banner-old { font-size: 12px; color: #94a3b8; text-decoration: line-through; }
        .pt-banner-final { font-size: 22px; font-weight: 800; color: #7c3aed; }
        .pt-field { margin-bottom: 18px; }
        .pt-lbl { display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 8px; }
        .pt-req { color: #ef4444; }
        
        .pt-input:focus, .pt-input:focus-visible {
          outline: none;
          border: none;
          box-shadow: none;
        }
    
        .pt-input-box { display: flex; align-items: center; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 14px; padding: 0 14px; transition: all .18s; }
        .pt-input-box:focus-within { border-color: #a78bfa; background: #fff; }
        .pt-input-box.ok { border-color: #10b981; background: #f0fdf4; }
        .pt-input-box.err { border-color: #ef4444; background: #fef2f2; }
        .pt-input-ico { color: #94a3b8; font-weight: 700; margin-right: 6px; }
        .pt-input { flex: 1; padding: 14px 0; border: none; outline: none; box-shadow: none; background: transparent; font-size: 15px; -webkit-appearance: none; }
        .pt-status { margin-left: 6px; }
        .pt-spin { width: 14px; height: 14px; border: 2px solid #e2e8f0; border-top-color: #7c3aed; border-radius: 50%; display: inline-block; animation: spin .6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .pt-ok { color: #10b981; font-weight: 800; font-size: 18px; }
        .pt-err-icon { color: #ef4444; font-weight: 800; font-size: 18px; }
        .pt-hint-err { font-size: 12px; color: #dc2626; margin-top: 6px; }
        .pt-profile { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; margin-top: 10px; }
        .pt-avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #a78bfa); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; overflow: hidden; flex-shrink: 0; }
        .pt-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .pt-profile-name { font-weight: 700; color: #0f172a; font-size: 14px; }
        .pt-profile-ok { color: #10b981; font-size: 12px; font-weight: 600; margin-top: 2px; }
        .pt-input-simple { width: 100%; padding: 14px 16px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 14px; font-size: 15px; outline: none; transition: all .18s; }
        .pt-input-simple:focus { border-color: #a78bfa; background: #fff; }
        .pt-btn-primary { width: 100%; padding: 16px; background: linear-gradient(135deg, #7c3aed, #a78bfa); color: #fff; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all .18s; box-shadow: 0 8px 24px rgba(124,58,237,.3); }
        .pt-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(124,58,237,.4); }
        .pt-btn-primary:disabled { opacity: .5; cursor: not-allowed; }
        .pt-btn-ghost { width: 100%; padding: 12px; background: transparent; border: 1px solid #e2e8f0; border-radius: 12px; color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 10px; }
        .pt-btn-ghost:hover { background: #f8fafc; }
        .pt-order-info { background: #f8fafc; border-radius: 14px; padding: 16px; margin-bottom: 20px; }
        .pt-order-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; color: #64748b; }
        .pt-order-row b { color: #0f172a; }
        .pt-order-total { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; margin-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 15px; font-weight: 600; color: #334155; }
        .pt-order-total strong { font-size: 24px; color: #7c3aed; }
        .pt-mono { font-family: ui-monospace, monospace; font-size: 13px; }
        .pt-pick { font-size: 15px; font-weight: 700; margin: 0 0 12px; color: #0f172a; }
        .pt-method-wrap { position: relative; margin-bottom: 10px; }
        .pt-method { display: flex; align-items: center; gap: 14px; width: 100%; padding: 16px; background: #fff; border: 2px solid #e2e8f0; border-radius: 16px; cursor: pointer; text-align: left; transition: all .18s; }
        .pt-method:hover:not(:disabled):not(.off) { border-color: #a78bfa; background: #faf5ff; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,58,237,.12); }
        .pt-method.off { opacity: .6; cursor: not-allowed; background: #f8fafc; }
        .pt-method:disabled { cursor: not-allowed; }
        .pt-method-ico { font-size: 28px; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: #faf5ff; border-radius: 12px; flex-shrink: 0; }
        .pt-method-body { flex: 1; }
        .pt-method-name { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 3px; }
        .pt-method-desc { font-size: 13px; color: #64748b; }
        .pt-method-desc b { color: #10b981; }
        .pt-method-warn { color: #ef4444; font-weight: 700; }
        .pt-method-arrow { font-size: 20px; color: #a78bfa; font-weight: 700; }
        .pt-deposit-btn {
          position: absolute;
          top: 50%;
          right: 10px;
          transform: translateY(-50%);
          background: linear-gradient(135deg, #10b981, #34d399);
          color: #fff;
          border: none;
          padding: 6px 10px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 11px;
          line-height: 1;
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(16,185,129,.35);
          transition: all .18s;
          z-index: 2;
          white-space: nowrap;
        }
        .pt-deposit-btn:hover {
          transform: translateY(-50%) scale(1.08);
          box-shadow: 0 5px 16px rgba(16,185,129,.55);
        }
        .pt-deposit-btn:hover {
          transform: translateY(-50%) scale(1.08);
          box-shadow: 0 5px 16px rgba(16,185,129,.55);
        }
        .pt-deposit-btn:hover { transform: translateY(-50%) scale(1.05); box-shadow: 0 6px 18px rgba(16,185,129,.5); }
                .pt-qr2-body { display: flex; flex-direction: column; gap: 20px; align-items: center; margin: 16px 0; }
        
        @keyframes qrGlow {
          0%, 100% { box-shadow: 0 0 0 4px rgba(124,58,237,.15), 0 12px 32px rgba(124,58,237,.25); }
          50% { box-shadow: 0 0 0 8px rgba(124,58,237,.25), 0 16px 44px rgba(124,58,237,.4); }
        }
        
        .pt-qr2-img-wrap {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
        }
        .pt-qr2-img-wrap::after {
          content: '';
          position: absolute;
          left: 8px;
          right: 8px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #38bdf8, #7dd3fc, #38bdf8, transparent);
          box-shadow: 0 0 12px 3px rgba(56,189,248,.9), 0 0 24px 8px rgba(125,211,252,.5);
          border-radius: 2px;
          animation: qrScan 2.2s ease-in-out infinite;
          pointer-events: none;
          z-index: 10;
        }
        @keyframes qrScan {
          0%   { top: 12px; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: calc(100% - 16px); opacity: 0; }
        }

        .pt-qr2-img {
          animation: qrGlow 2.5s ease-in-out infinite;
        }
    
        .pt-qr2-img-wrap { text-align: center; }
        .pt-qr2-img {
          width: 100%;
          max-width: 240px;
          border-radius: 16px;
          border: 3px solid #7c3aed;
          padding: 8px;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(124,58,237,.15), 0 12px 32px rgba(124,58,237,.25);
          transition: box-shadow .3s ease;
        }
        .pt-qr2-img:hover {
          box-shadow: 0 0 0 6px rgba(124,58,237,.2), 0 16px 40px rgba(124,58,237,.35);
        }
        .pt-qr2-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; width: 100%; }
        .pt-qr2-info-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; }
        .pt-qr2-info-hl { background: linear-gradient(135deg, #faf5ff, #fdf4ff); border-color: #d8b4fe; }
        .pt-qr2-info-lbl { font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 3px; }
        .pt-qr2-info-val { font-size: 14px; font-weight: 700; color: #0f172a; }
        .pt-qr2-info-val.pt-purple { color: #7c3aed; }
        .pt-qr2-warn { margin-top: 12px; padding: 10px 12px; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 10px; font-size: 12px; color: #92400e; line-height: 1.5; }
        .pt-qr2-warn b { color: #78350f; }

        .pt-qr2-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .pt-qr2-head-left { display: flex; gap: 12px; align-items: center; }
        .pt-qr2-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #faf5ff, #f3e8ff); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .pt-qr2-head h2 { font-size: 16px; font-weight: 800; margin: 0 0 2px; color: #0f172a; }
        .pt-qr2-head p { font-size: 12px; color: #94a3b8; margin: 0; }
        .pt-qr2-timer { background: #fef2f2; color: #dc2626; font-weight: 800; font-size: 14px; padding: 8px 12px; border-radius: 999px; }
        .pt-qr2-amount { padding: 16px; text-align: center; background: linear-gradient(135deg, #faf5ff, #fdf4ff); border-radius: 14px; margin-bottom: 16px; }
        .pt-qr2-amount-lbl { font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #a78bfa; margin-bottom: 4px; }
        .pt-qr2-amount-val { font-size: 32px; font-weight: 900; color: #7c3aed; line-height: 1.1; margin-bottom: 6px; }
        .pt-qr2-code { font-size: 13px; color: #64748b; }
        .pt-qr2-code b { color: #0f172a; font-family: ui-monospace, monospace; }
        .pt-qr2-img-wrap { text-align: center; margin: 20px 0; }
        .pt-qr2-img { max-width: 260px; width: 100%; border-radius: 16px; box-shadow: 0 8px 32px rgba(124,58,237,.15); }
        .pt-qr2-wait { display: flex; align-items: center; justify-content: center; gap: 8px; color: #64748b; font-size: 13px; padding: 12px 0; border-top: 1px dashed #e2e8f0; }
        .pt-qr2-pulse { width: 8px; height: 8px; border-radius: 50%; background: #10b981; animation: pulse 1.2s infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .5; transform: scale(1.4); } }
        .pt-card-success { text-align: center; padding: 48px 24px; }
        .pt-success-ico { font-size: 72px; margin-bottom: 16px; }
        .pt-card-success h2 { margin: 0 0 8px; color: #10b981; font-size: 22px; }
        .pt-card-success p { color: #334155; margin: 0 0 8px; font-size: 14px; }
        .pt-dim { color: #94a3b8 !important; font-size: 13px !important; }
        .pt-modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, .5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; animation: fadeIn .2s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .pt-modal { background: #fff; border-radius: 24px; padding: 28px 24px 24px; max-width: 420px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,.3); animation: slideUp .25s ease; text-align: center; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .pt-modal-icon { font-size: 56px; margin-bottom: 12px; }
        .pt-modal h3 { font-size: 20px; font-weight: 800; margin: 0 0 8px; color: #0f172a; }
        .pt-modal-text { font-size: 14px; color: #64748b; margin: 0 0 20px; }
        .pt-modal-sub { font-size: 13px; color: #94a3b8; margin-top: 12px; }
        .pt-modal-info { background: #f8fafc; border-radius: 14px; padding: 14px 16px; margin-bottom: 20px; text-align: left; }
        .pt-modal-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: #64748b; }
        .pt-modal-row:last-child { margin-bottom: 0; }
        .pt-modal-row b { color: #0f172a; }
        .pt-modal-amount { color: #7c3aed !important; font-size: 15px; }
        .pt-modal-row-green { padding-top: 8px; margin-top: 8px; border-top: 1px dashed #cbd5e1; }
        .pt-modal-row-green b { color: #10b981; }
        .pt-modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .pt-modal-btn { padding: 14px; border: none; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all .18s; }
        .pt-modal-btn-cancel { background: #f1f5f9; color: #64748b; }
        .pt-modal-btn-cancel:hover:not(:disabled) { background: #e2e8f0; }
        .pt-modal-btn-ok { background: linear-gradient(135deg, #7c3aed, #a78bfa); color: #fff; box-shadow: 0 6px 20px rgba(124,58,237,.3); }
        .pt-modal-btn-ok:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,58,237,.4); }
        .pt-modal-btn:disabled { opacity: .5; cursor: not-allowed; }
        .pt-modal-success { padding: 40px 24px; }
        .pt-modal-success-icon { font-size: 64px; margin-bottom: 16px; animation: pop .4s ease; }
        @keyframes pop { 0% { transform: scale(0); } 70% { transform: scale(1.1); } 100% { transform: scale(1); } }
        @media (max-width: 480px) {
          .pt-head h1 { font-size: 26px; }
          .pt-card { padding: 20px 16px; }
          .pt-banner { flex-direction: column; align-items: flex-start; gap: 8px; }
          .pt-banner-right { text-align: left; }
          .pt-deposit-btn { position: static; transform: none; display: block; width: 100%; margin-top: 8px; padding: 10px; font-size: 13px; }
        }
      `}</style>
    </div>
  );
}
