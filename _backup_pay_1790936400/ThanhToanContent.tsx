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
  const [step, setStep] = useState<"info" | "method">("info");
  const [method, setMethod] = useState<"balance" | "bank" | null>(null);
  const [paid, setPaid] = useState(false);

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

  // Polling check status
  useEffect(() => {
    if (!order) return;
    if (order.status === "paid" || order.status === "completed") return;
    const check = async () => {
      try {
        const res = await fetch(`/api/payments/check?orderId=${order.id}`);
        const d = await res.json();
        if (d.success && (d.status === "paid" || d.status === "completed")) {
          setPaid(true);
          setTimeout(() => router.push(`/thanh-toan/thanh-cong?orderId=${order.id}`), 800);
        }
      } catch {}
    };
    check();
    const i = setInterval(check, 3000);
    return () => clearInterval(i);
  }, [order, router]);

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
        router.push(`/thanh-toan/thanh-cong?orderId=${order.id}`);
      } else {
        setError(data.message || "Thanh toán thất bại");
      }
    } catch { setError("Lỗi kết nối"); }
    finally { setLoading(false); }
  };

  const handleBankTransfer = () => setMethod("bank");

  const formatPrice = (n: number) => n.toLocaleString("vi-VN") + "đ";

  if (!serviceId) return <div style={{ textAlign: "center", padding: 80 }}>Đang chuyển hướng...</div>;

  const notEnough = balance < (order?.finalAmount || 0);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 16px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, textAlign: "center", marginBottom: 8 }}>Thanh toán</h1>
      <p style={{ textAlign: "center", color: "var(--text-2)", marginBottom: 32 }}>Hoàn tất thông tin để tạo đơn hàng</p>

      {error && <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 12, marginBottom: 16, fontSize: 14 }}>{error}</div>}
      {paid && <div style={{ padding: "12px 16px", background: "#f0fdf4", border: "1px solid #86efac", color: "#16a34a", borderRadius: 12, marginBottom: 16, fontSize: 14 }}>✅ Thanh toán thành công! Đang chuyển trang...</div>}

      {step === "info" && (
        <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 20, padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Username Locket <span style={{ color: "#dc2626" }}>*</span></label>
            <input type="text" value={locketUsername} onChange={(e) => setLocketUsername(e.target.value)} placeholder="Nhập username Locket"
              style={{ width: "100%", padding: "13px 16px", background: "var(--bg-2)", border: "1.5px solid var(--border)", borderRadius: 12, fontSize: 15, fontFamily: "inherit", outline: "none" }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Mã giảm giá (nếu có)</label>
            <input type="text" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Nhập mã giảm giá"
              style={{ width: "100%", padding: "13px 16px", background: "var(--bg-2)", border: "1.5px solid var(--border)", borderRadius: 12, fontSize: 15, fontFamily: "inherit", outline: "none" }} />
          </div>
          <button onClick={handleCreateOrder} disabled={loading || !locketUsername.trim()}
            style={{ width: "100%", padding: 16, background: loading ? "#ccc" : "linear-gradient(135deg, #7c3aed, #a78bfa)", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {loading ? "Đang xử lý..." : "Tạo đơn và thanh toán"}
          </button>
        </div>
      )}

      {step === "method" && order && (
        <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 20, padding: 24 }}>
          {/* Order summary */}
          <div style={{ padding: 16, background: "var(--bg-2)", borderRadius: 12, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: "var(--text-2)" }}>Mã đơn:</span><b>{order.orderCode}</b></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: "var(--text-2)" }}>Gói:</span><b>{order.serviceName}</b></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: "var(--text-2)" }}>Username:</span><b>@{order.locketUsername}</b></div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px dashed #d1d5db" }}>
              <span style={{ fontWeight: 700 }}>Tổng:</span>
              <b style={{ color: "#7c3aed", fontSize: 18 }}>{formatPrice(order.finalAmount)}</b>
            </div>
          </div>

          {/* ═══ NÚT THANH TOÁN SỐ DƯ ═══ */}
          <button onClick={handlePayWithBalance} disabled={loading || notEnough}
            style={{
              width: "100%", padding: 16, marginBottom: 12,
              background: notEnough ? "#e5e7eb" : "linear-gradient(135deg, #10b981, #34d399)",
              color: notEnough ? "#9ca3af" : "#fff",
              border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800,
              cursor: notEnough ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}>
            💰 Thanh toán bằng số dư ({formatPrice(balance)})
          </button>
          {notEnough && (
            <p style={{ fontSize: 13, color: "#dc2626", textAlign: "center", marginBottom: 12 }}>
              Số dư không đủ. Cần thêm {formatPrice(order.finalAmount - balance)} — <Link href="/nap-tien" style={{ color: "#7c3aed", fontWeight: 700 }}>Nạp tiền</Link>
            </p>
          )}

          {/* ═══ NÚT CHUYỂN KHOẢN ═══ */}
          <button onClick={handleBankTransfer} disabled={loading}
            style={{ width: "100%", padding: 16, background: "#fff", color: "#7c3aed", border: "2px solid #7c3aed", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
            🏦 Chuyển khoản ngân hàng (QR)
          </button>

          {method === "bank" && (
            <div style={{ marginTop: 20, padding: 16, background: "#f9fafb", borderRadius: 12, textAlign: "center" }}>
              <p style={{ marginBottom: 12, fontWeight: 700 }}>Quét QR để thanh toán</p>
              <p style={{ fontSize: 13, color: "var(--text-2)" }}>Nội dung CK: <b>{order.orderCode}</b></p>
              <img src={`https://qr.sepay.vn/img?acc=36886368888&bank=TPBANK&amount=${order.finalAmount}&des=${order.orderCode}`} alt="QR" style={{ width: 240, height: 240, margin: "16px auto", display: "block", borderRadius: 12 }} />
              <p style={{ fontSize: 13, color: "var(--text-2)" }}>Hệ thống tự động xác nhận trong vài giây</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
