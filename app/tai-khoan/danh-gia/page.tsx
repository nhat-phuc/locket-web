"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Order {
  id: string;
  orderCode: string;
  serviceName: string;
  finalAmount: number;
  createdAt: string;
}

export default function DanhGiaPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("locket_user");
    if (!stored) return;

    try {
      const u = JSON.parse(stored);
      fetch(`/api/users/orders?userId=${u.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            const completed = (data.orders || []).filter(
              (o: any) => o.status === "completed" || o.status === "paid"
            );
            setOrders(completed);
          }
        })
        .catch(() => {});
    } catch {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedOrder) {
      setError("Vui lòng chọn đơn hàng");
      return;
    }
    if (text.trim().length < 5) {
      setError("Đánh giá phải có ít nhất 5 ký tự");
      return;
    }

    const stored = sessionStorage.getItem("locket_user");
    if (!stored) {
      setError("Vui lòng đăng nhập");
      return;
    }

    const user = JSON.parse(stored);
    setLoading(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          orderId: selectedOrder,
          rating,
          text,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Có lỗi xảy ra");
        return;
      }

      setSuccess(true);
      setText("");
      setSelectedOrder("");
      setRating(5);
    } catch {
      setError("Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-form">
        <div style={{ textAlign: "center", color: "var(--green)", padding: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
          <strong style={{ display: "block", marginBottom: 8, fontSize: 18 }}>
            Cảm ơn bạn đã đánh giá!
          </strong>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>
            Đánh giá sẽ hiển thị sau khi được duyệt.
          </p>
          <div style={{ marginTop: 20, display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => setSuccess(false)}
              className="auth-btn"
              style={{ width: "auto", padding: "10px 20px" }}
            >
              Gửi đánh giá khác
            </button>
            <Link
              href="/tai-khoan"
              style={{ color: "var(--accent-bright)", fontWeight: 700, alignSelf: "center" }}
            >
              Về tài khoản →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <h1 className="auth-title">Đánh Giá Dịch Vụ</h1>
      <p className="auth-sub">Chia sẻ trải nghiệm của bạn với khách hàng khác</p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label>Chọn đơn hàng</label>
          <select
            value={selectedOrder}
            onChange={(e) => setSelectedOrder(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "14px 16px",
              background: "var(--bg-2)",
              border: "1.5px solid var(--border)",
              borderRadius: 12,
              color: "var(--text-0)",
              fontSize: 15,
              fontFamily: "inherit",
            }}
          >
            <option value="">-- Chọn đơn hàng --</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.orderCode} - {o.serviceName}
              </option>
            ))}
          </select>
          {orders.length === 0 && (
            <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 6 }}>
              Bạn chưa có đơn hàng nào đã hoàn thành.
            </p>
          )}
        </div>

        <div className="auth-field">
          <label>Đánh giá</label>
          <div style={{ display: "flex", gap: 8, fontSize: 32, cursor: "pointer" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                style={{
                  color: star <= rating ? "#fbbf24" : "var(--text-2)",
                  transition: "transform 0.2s",
                  transform: star <= rating ? "scale(1.1)" : "scale(1)",
                  userSelect: "none",
                }}
              >
                ★
              </span>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 4 }}>
            {rating}/5 sao
          </p>
        </div>

        <div className="auth-field">
          <label>Nội dung đánh giá</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ..."
            required
            rows={4}
            disabled={loading}
            style={{ resize: "vertical", minHeight: 100 }}
          />
        </div>

        <button
          type="submit"
          className="auth-btn"
          disabled={loading || !selectedOrder || !text}
        >
          {loading ? "Đang gửi..." : "Gửi Đánh Giá"}
        </button>

        <div className="auth-footer">
          <Link href="/tai-khoan" style={{ color: "var(--accent-bright)" }}>
            ← Về tài khoản
          </Link>
        </div>
      </form>
    </div>
  );
}