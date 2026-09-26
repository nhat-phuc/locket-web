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

export default function ThanhToanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("serviceId");

  const [user, setUser] = useState<{ username: string } | null>(null);
  const [locketUsername, setLocketUsername] = useState("");
  const [coupon, setCoupon] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("locket_user");
    if (!stored) {
      router.push("/dang-nhap");
      return;
    }
    try {
      const u = JSON.parse(stored);
      setUser(u);
    } catch {}
  }, [router]);

  const handleCreateOrder = async () => {
    if (!serviceId) {
      setError("Thiếu thông tin dịch vụ");
      return;
    }
    if (!locketUsername.trim()) {
      setError("Vui lòng nhập username Locket");
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
          locketUsername: locketUsername.trim(),
          couponCode: coupon.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.message || "Không thể tạo đơn");
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    router.push("/thanh-toan/thanh-cong");
  };

  if (!user) return null;

  return (
    <div style={{ width: "100%", maxWidth: 560, marginTop: 40, marginBottom: 60 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, textAlign: "center" }}>Thanh toán</h1>
      <p style={{ textAlign: "center", color: "var(--text-2)", marginBottom: 32 }}>Hoàn tất thông tin để tạo đơn hàng</p>

      {error && <div className="auth-error">{error}</div>}

      <div className="auth-form">
        <div className="auth-field">
          <label>Username Locket <span style={{ color: "var(--red)" }}>*</span></label>
          <input
            type="text"
            value={locketUsername}
            onChange={(e) => setLocketUsername(e.target.value)}
            placeholder="username hoặc link Locket"
            disabled={!!order}
          />
          <small style={{ color: "var(--text-2)", fontSize: 12 }}>Chúng tôi không cần mật khẩu, chỉ cần username công khai</small>
        </div>

        <div className="auth-field">
          <label>Mã giảm giá (nếu có)</label>
          <input
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            placeholder="Nhập mã giảm giá"
            disabled={!!order}
          />
        </div>

        <button onClick={handleCreateOrder} disabled={loading || !!order} className="auth-btn">
          {loading ? "Đang xử lý..." : order ? "Đã tạo đơn" : "Tạo đơn và thanh toán"}
        </button>
      </div>

      {order && <PaymentModal order={order} onClose={() => setOrder(null)} onSuccess={handleSuccess} />}
    </div>
  );
}
