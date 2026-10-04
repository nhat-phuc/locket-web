"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface HistoryItem {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface OrderInfo {
  orderId: string;
  orderCode: string;
  amount: number;
  qrUrl: string;
  bank: string;
  accountNumber: string;
  accountName: string;
  expiresAt: string;
}

const QUICK_AMOUNTS = [
  { value: 20000, label: "20.000đ", icon: "💵", tier: "starter" },
  { value: 50000, label: "50.000đ", icon: "💵", tier: "starter" },
  { value: 100000, label: "100.000đ", icon: "💎", tier: "popular" },
  { value: 200000, label: "200.000đ", icon: "💎", tier: "popular" },
  { value: 500000, label: "500.000đ", icon: "💎", tier: "premium" },
  { value: 1000000, label: "1.000.000đ", icon: "👑", tier: "premium" },
];
const MIN_AMOUNT = 10000;

export default function NapTienPage() {
  const router = useRouter();

  const [user, setUser] = useState<{ id: string; email: string; username?: string; name?: string } | null>(null);
  const [balance, setBalance] = useState(0);
  const [step, setStep] = useState<"input" | "qr">("input");
  const [amount, setAmount] = useState("");
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [paid, setPaid] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

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

        fetch(`/api/users/transactions`)
          .then((r) => r.json())
          .then((d) => {
            if (d.success && Array.isArray(d.transactions)) {
              const recharges = d.transactions
                .filter((t: { type: string }) => t.type === "recharge" || t.type === "admin_recharge")
                .slice(0, 5);
              setHistory(recharges);
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, [router]);

  useEffect(() => {
    if (step !== "qr" || timeLeft <= 0 || paid) return;
    const t = setInterval(() => setTimeLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [step, timeLeft, paid]);

  // Poll trạng thái thanh toán
  useEffect(() => {
    if (step !== "qr" || !order || paidSuccess) return;
    const check = async () => {
      try {
        const r = await fetch(`/api/recharge/check?code=${order.orderCode}&email=${encodeURIComponent(user?.email || "")}`, { cache: "no-store" });
        const d = await r.json();
        if (d.status === "paid" || d.status === "success") {
          setPaidSuccess(true);
          if (user?.email) {
            fetch(`/api/balance?email=${encodeURIComponent(user.email)}`)
              .then((r) => r.json())
              .then((d) => { if (typeof d.balance === "number") setBalance(d.balance); })
              .catch(() => {});
          }
          setTimeout(() => router.push(`/nap-tien/thanh-cong?orderId=${order?.orderId || ""}`), 1500);
        }
      } catch {}
    };
    check();
    const iv = setInterval(check, 3000);
    return () => clearInterval(iv);
  }, [step, order, paidSuccess, user?.email, router]);

  const selectAmount = (v: number) => setAmount(String(v));

  const handleCreateOrder = async () => {
    const amt = Number(amount);
    if (!amt || amt < MIN_AMOUNT) {
      setError(`Số tiền tối thiểu ${MIN_AMOUNT.toLocaleString("vi-VN")}đ`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userName = (user?.username || user?.name || user?.email?.split("@")[0] || "user")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
      const code = `${userName}nap${amt}${rand}`;

      const res = await fetch("/api/recharge/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
          username: user?.username,
          amount: amt,
          content: code,
          orderCode: code,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Không thể tạo đơn nạp");
        return;
      }

      const orderId = data.orderId || data.order?.id;
      const detailRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentMethod: "bank_transfer" }),
      });
      const detail = await detailRes.json();
      if (detail.success) {
        setOrder({
          orderId,
          orderCode: detail.orderCode,
          amount: detail.amount,
          qrUrl: detail.qrUrl,
          bank: detail.bank,
          accountNumber: detail.accountNumber,
          accountName: detail.accountName,
          expiresAt: detail.expiresAt,
        });
        const expires = new Date(detail.expiresAt).getTime();
        setTimeLeft(Math.max(0, Math.floor((expires - Date.now()) / 1000)));
        setStep("qr");
      } else {
        setError(detail.message || "Không tạo được QR");
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  if (!user) return null;

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const selectedAmount = Number(amount) || 0;

  return (
    <main className="nt-page">
      <div className="nt-bg-glow nt-glow-1" />
      <div className="nt-bg-glow nt-glow-2" />

      <div className="nt-wrap">
        {/* HEADER */}
        <header className="nt-head">
          <div className="nt-badge">⚡ NẠP TIỀN TỰ ĐỘNG</div>
          <h1>
            Nạp Tiền Vào <span className="nt-grad">Ví Locket Gold</span>
          </h1>
          <p>Nạp nhanh qua VietQR — Tiền vào ví tự động trong vài giây</p>

          <div className="nt-balance">
            <div className="nt-balance-lbl">SỐ DƯ HIỆN TẠI</div>
            <div className="nt-balance-val">{balance.toLocaleString("vi-VN")}đ</div>
          </div>
        </header>

        {/* STEP 1: CHỌN SỐ TIỀN */}
        {step === "input" && (
          <div className="nt-card">
            <div className="nt-card-head">
              <div className="nt-card-icon">💰</div>
              <div>
                <div className="nt-card-title">Chọn số tiền nạp</div>
                <div className="nt-card-sub">Chọn 1 trong các gói có sẵn hoặc nhập tùy ý</div>
              </div>
            </div>

            <div className="nt-grid-amount">
              {QUICK_AMOUNTS.map((q) => {
                const active = selectedAmount === q.value;
                return (
                  <button
                    key={q.value}
                    type="button"
                    onClick={() => selectAmount(q.value)}
                    className={`nt-amt ${active ? "on" : ""} nt-amt-${q.tier}`}
                  >
                    <div className="nt-amt-val">{q.label}</div>
                    {q.tier === "popular" && !active && <div className="nt-amt-tag">PHỔ BIẾN</div>}
                    {active && <div className="nt-amt-check">✓</div>}
                  </button>
                );
              })}
            </div>

            <div className="nt-field">
              <label className="nt-lbl">Hoặc nhập số tiền khác</label>
              <div className="nt-input-wrap">
                <span className="nt-input-pre">₫</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount ? Number(amount).toLocaleString("vi-VN") : ""}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                  placeholder="Nhập số tiền"
                  className="nt-input"
                />
              </div>
              <div className="nt-hint">Số tiền tối thiểu 10.000đ</div>
            </div>

            {error && <div className="nt-error">⚠ {error}</div>}

            <button
              onClick={handleCreateOrder}
              disabled={loading || !selectedAmount || selectedAmount < MIN_AMOUNT}
              className="nt-btn"
            >
              {loading ? (
                <>Đang xử lý...</>
              ) : (
                <>Tạo QR nạp {selectedAmount > 0 ? selectedAmount.toLocaleString("vi-VN") + "đ" : ""}</>
              )}
            </button>

            {history.length > 0 && (
              <div className="nt-history">
                <div className="nt-history-title">Lịch sử nạp gần đây</div>
                {history.map((h) => (
                  <div key={h.id} className="nt-history-row">
                    <span className="nt-history-amt">+{h.amount.toLocaleString("vi-VN")}đ</span>
                    <span className={`nt-history-status nt-st-${h.status}`}>
                      {h.status === "completed" || h.status === "success" ? "Thành công" : h.status === "pending" ? "Đang xử lý" : h.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: QR */}
        {step === "qr" && order && (
          <div className="nt-card nt-card-qr">
            <div className="nt-qr-head">
              <div>
                <div className="nt-qr-head-title">Quét mã QR để nạp tiền</div>
                <div className="nt-qr-head-sub">Mở app ngân hàng bất kỳ</div>
              </div>
              <div className="nt-qr-timer">⏱ {mm}:{ss}</div>
            </div>

            <div className="nt-qr-amount">
              <div className="nt-qr-amount-lbl">SỐ TIỀN</div>
              <div className="nt-qr-amount-val">{order.amount.toLocaleString("vi-VN")}đ</div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div className="nt-qr-box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={order.qrUrl} alt="QR" className="nt-qr-img" />
            </div>
              </div>

            <div className="nt-info">
              <div className="nt-info-row" onClick={() => copy(order.bank, "bank")}>
                <span className="nt-info-lbl">Ngân hàng</span>
                <b>{order.bank}</b>
                <span className="nt-copy">{copied === "bank" ? "✓" : "Copy"}</span>
              </div>
              <div className="nt-info-row" onClick={() => copy(order.accountNumber, "acc")}>
                <span className="nt-info-lbl">Số tài khoản</span>
                <b className="nt-mono">{order.accountNumber}</b>
                <span className="nt-copy">{copied === "acc" ? "✓" : "Copy"}</span>
              </div>
              <div className="nt-info-row" onClick={() => copy(order.accountName, "name")}>
                <span className="nt-info-lbl">Chủ tài khoản</span>
                <b>{order.accountName}</b>
                <span className="nt-copy">{copied === "name" ? "✓" : "Copy"}</span>
              </div>
              <div className="nt-info-row nt-info-hl" onClick={() => copy(order.orderCode, "code")}>
                <span className="nt-info-lbl">Nội dung CK</span>
                <b className="nt-mono nt-purple">{order.orderCode}</b>
                <span className="nt-copy">{copied === "code" ? "✓" : "Copy"}</span>
              </div>
            </div>

            <div className="nt-warn">
              ⚠️ Nhập <b>đúng nội dung CK</b> để hệ thống tự động cộng tiền
            </div>

            <div className="nt-wait">
              <span className="nt-pulse" /> Đang chờ thanh toán...
            </div>

            <button
              onClick={() => { setStep("input"); setOrder(null); setPaid(false); }}
              className="nt-btn-ghost"
            >
              ← Quay lại
            </button>
          </div>
        )}
      </div>

      {/* POPUP THÀNH CÔNG */}
      {paidSuccess && (
        <div className="nt-modal-overlay">
          <div className="nt-modal">
            <div className="nt-modal-icon">🎉</div>
            <h3>Nạp tiền thành công!</h3>
            <p>Tiền đã được cộng vào ví của bạn</p>
            <p className="nt-modal-sub">Đang chuyển về trang tài khoản...</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .nt-page { min-height: 100vh; padding: 40px 16px 80px; position: relative; overflow: hidden; }
        .nt-bg-glow { position: absolute; border-radius: 50%; filter: blur(120px); opacity: .28; pointer-events: none; }
        .nt-glow-1 { width: 420px; height: 420px; background: #a78bfa; top: -140px; left: -80px; }
        .nt-glow-2 { width: 380px; height: 380px; background: #f472b6; bottom: -120px; right: -80px; }
        .nt-wrap { max-width: 720px; margin: 0 auto; position: relative; }

        .nt-head { text-align: center; margin-bottom: 32px; }
        .nt-badge { display: inline-block; padding: 6px 14px; background: rgba(167,139,250,.15); border: 1px solid rgba(167,139,250,.3); border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #7c3aed; margin-bottom: 16px; }
        .nt-head h1 { font-size: 34px; font-weight: 800; margin: 0 0 10px; color: #0f172a; line-height: 1.2; }
        .nt-grad { background: linear-gradient(135deg, #a78bfa, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .nt-head p { color: #64748b; margin: 0 0 24px; font-size: 14px; }
        .nt-balance { display: inline-block; background: #fff; border-radius: 20px; padding: 20px 40px; box-shadow: 0 12px 40px rgba(124,58,237,.12); border: 1px solid #f1f5f9; }
        .nt-balance-lbl { font-size: 11px; font-weight: 800; color: #7c3aed; letter-spacing: 1.2px; margin-bottom: 6px; }
        .nt-balance-val { font-size: 32px; font-weight: 900; background: linear-gradient(135deg, #a78bfa, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; }

        .nt-card { background: #fff; border-radius: 20px; padding: 16px; box-shadow: 0 12px 40px rgba(124,58,237,.1); border: 1px solid #f1f5f9; }
        .nt-card-head { display: flex; gap: 12px; align-items: center; margin-bottom: 20px; }
        .nt-card-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #faf5ff, #f3e8ff); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
        .nt-card-title { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 2px; }
        .nt-card-sub { font-size: 13px; color: #94a3b8; }

        .nt-grid-amount { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
        .nt-amt { position: relative; padding: 16px 12px; background: #fff; border: 2px solid #e2e8f0; border-radius: 16px; cursor: pointer; transition: all .18s; text-align: center; overflow: hidden; }
        .nt-amt:hover { border-color: #c4b5fd; transform: translateY(-2px); }
        .nt-amt.on { border-color: #7c3aed; background: linear-gradient(135deg, #faf5ff, #f3e8ff); box-shadow: 0 8px 24px rgba(124,58,237,.2); }
                .nt-amt-val { font-size: 14px; font-weight: 800; color: #0f172a; }
        .nt-amt.on .nt-amt-val { color: #7c3aed; }
        .nt-amt-tag { position: absolute; top: 4px; right: 4px; background: linear-gradient(135deg, #ec4899, #f43f5e); color: #fff; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 4px; }
        .nt-amt-check { position: absolute; top: 6px; right: 8px; color: #10b981; font-size: 16px; font-weight: 900; }

        .nt-amt-popular { border-color: #c4b5fd; }
        .nt-amt-premium { border-color: #fcd34d; }

        .nt-field { margin-bottom: 16px; }
        .nt-lbl { display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 8px; }
        .nt-input-wrap { display: flex; align-items: center; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 14px; padding: 0 16px; transition: all .18s; }
        .nt-input-wrap:focus-within { border-color: #a78bfa; background: #fff; }
        .nt-input-pre { color: #a78bfa; font-weight: 800; font-size: 16px; margin-right: 6px; }
        .nt-input { flex: 1; padding: 14px 0; border: none; outline: none; background: transparent; font-size: 16px; font-weight: 700; color: #0f172a; }
        .nt-hint { font-size: 12px; color: #94a3b8; margin-top: 6px; }

        .nt-error { background: #fef2f2; color: #dc2626; padding: 12px 14px; border-radius: 12px; margin-bottom: 16px; font-size: 13px; border: 1px solid #fecaca; }

        .nt-btn { width: 100%; padding: 16px; background: linear-gradient(135deg, #a78bfa, #ec4899); color: #fff; border: none; border-radius: 14px; font-size: 15px; font-weight: 800; cursor: pointer; transition: all .18s; box-shadow: 0 8px 24px rgba(124,58,237,.35); }
        .nt-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(124,58,237,.45); }
        .nt-btn:disabled { opacity: .5; cursor: not-allowed; }
        .nt-btn-ghost { width: 100%; padding: 12px; background: transparent; border: 1px solid #e2e8f0; border-radius: 12px; color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 12px; }
        .nt-btn-ghost:hover { background: #f8fafc; }

        .nt-history { margin-top: 20px; padding-top: 20px; border-top: 1px dashed #e2e8f0; }
        .nt-history-title { font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 12px; }
        .nt-history-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .nt-history-row:last-child { border-bottom: none; }
        .nt-history-amt { font-weight: 700; color: #10b981; }
        .nt-history-status { font-size: 12px; color: #64748b; }
        .nt-st-completed, .nt-st-success { color: #10b981; font-weight: 700; }

        /* QR */
        .nt-card-qr { padding: 24px; }
        .nt-qr-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .nt-qr-head-title { font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 2px; }
        .nt-qr-head-sub { font-size: 12px; color: #94a3b8; }
        .nt-qr-timer { background: #fef2f2; color: #dc2626; font-weight: 800; font-size: 13px; padding: 6px 10px; border-radius: 999px; }

        .nt-qr-amount { text-align: center; padding: 12px; background: linear-gradient(135deg, #faf5ff, #fdf4ff); border-radius: 16px; border: 1px solid #e9d5ff; margin-bottom: 20px; }
        .nt-qr-amount-lbl { font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #a78bfa; margin-bottom: 4px; }
        .nt-qr-amount-val { font-size: 24px; font-weight: 900; color: #7c3aed; line-height: 1; }

        .nt-qr-box {
          position: relative;
          display: inline-block;
          padding: 12px;
          background: #fff;
          border: 3px solid #a78bfa;
          border-radius: 18px;
          box-shadow: 0 0 0 4px rgba(167,139,250,.15), 0 12px 40px rgba(124,58,237,.2);
          overflow: hidden;
          margin: 14px auto;
        }
        .nt-qr-box::before {
          content: '';
          position: absolute;
          left: 12px;
          right: 12px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #38bdf8, #7dd3fc, #38bdf8, transparent);
          box-shadow: 0 0 12px 3px rgba(56,189,248,.9), 0 0 24px 8px rgba(125,211,252,.5);
          border-radius: 2px;
          animation: ntScan 2.2s ease-in-out infinite;
          pointer-events: none;
          z-index: 10;
        }
        @keyframes ntScan {
          0%   { top: 14px; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: calc(100% - 18px); opacity: 0; }
        }
        .nt-qr-box::after {
          content: '';
          position: absolute;
          inset: 6px;
          border-radius: 12px;
          pointer-events: none;
        }
        .nt-qr-img { width: 220px !important; height: 220px !important; border-radius: 10px; object-fit: contain; display: block; }

        .nt-info { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
        .nt-info-row {
          display: grid;
          grid-template-columns: 100px 1fr auto;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
          transition: all .15s;
          font-size: 12px;
        }
        .nt-info-row:hover { background: #faf5ff; border-color: #c4b5fd; }
        .nt-info-hl { background: linear-gradient(135deg, #faf5ff, #fdf4ff); border-color: #d8b4fe; }
        .nt-info-lbl { font-size: 11px; color: #64748b; font-weight: 600; text-align: left; }
        .nt-info-row b { font-size: 13px; color: #0f172a; text-align: left; word-break: break-word; overflow-wrap: anywhere; }
        .nt-mono { font-family: ui-monospace, monospace; font-size: 13px; }
        .nt-purple { color: #7c3aed !important; }
        .nt-copy { font-size: 11px; font-weight: 700; color: #7c3aed; background: rgba(124,58,237,.1); padding: 4px 8px; border-radius: 6px; }

        .nt-warn { margin-bottom: 10px; padding: 9px 12px; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 10px; font-size: 11px; color: #92400e; line-height: 1.4; }
        .nt-warn b { color: #78350f; }

        .nt-wait { display: flex; align-items: center; justify-content: center; gap: 8px; color: #64748b; font-size: 13px; padding: 12px 0; border-top: 1px dashed #e2e8f0; }
        .nt-pulse { width: 8px; height: 8px; border-radius: 50%; background: #10b981; animation: pulse 1.2s infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .5; transform: scale(1.4); } }

        /* MODAL */
        .nt-modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; animation: fadeIn .2s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .nt-modal { background: #fff; border-radius: 24px; padding: 40px 28px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,.3); animation: pop .3s ease; }
        @keyframes pop { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .nt-modal-icon { font-size: 64px; margin-bottom: 16px; }
        .nt-modal h3 { font-size: 22px; font-weight: 800; margin: 0 0 8px; color: #10b981; }
        .nt-modal p { font-size: 14px; color: #334155; margin: 0 0 6px; }
        .nt-modal-sub { font-size: 13px; color: #94a3b8 !important; margin-top: 12px !important; }

        @media (max-width: 600px) {
          .nt-head h1 { font-size: 24px; }
          .nt-balance { padding: 16px 28px; }
          .nt-balance-val { font-size: 24px; }
          .nt-grid-amount { grid-template-columns: repeat(2, 1fr); }
          .nt-qr-img { width: 220px !important; height: 220px !important; border-radius: 10px; object-fit: contain; display: block; }
        }
      `}</style>
    </main>
  );
}
