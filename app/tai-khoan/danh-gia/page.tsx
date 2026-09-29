"use client";

import { useEffect, useState } from "react";

interface Order {
  id: string;
  orderCode: string;
  serviceName: string;
  finalAmount: number;
  paidAt: string;
}

export default function DanhGiaPage() {
  const [user, setUser] = useState<{ id: string; email: string; username?: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [myReviews, setMyReviews] = useState<any[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("locket_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUser(u);
        // Load orders đã paid
        fetch(`/api/users/orders`)
          .then((r) => r.json())
          .then((d) => {
            if (d.success) {
              const paid = (d.orders || []).filter((o: any) => o.status === "paid");
              setOrders(paid);
            }
          });
        // Load reviews đã gửi
        fetch(`/api/reviews/my`)
          .then((r) => r.json())
          .then((d) => { if (d.success) setMyReviews(d.reviews); })
          .catch(() => {});
      } catch {}
    }
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 3) {
      setMessage({ type: "error", text: "Tối đa 3 ảnh" });
      return;
    }

    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) {
          setImages((prev) => [...prev, data.url]);
        } else {
          setMessage({ type: "error", text: data.error || "Upload lỗi" });
        }
      } catch {
        setMessage({ type: "error", text: "Upload lỗi" });
      }
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!selectedOrder) {
      setMessage({ type: "error", text: "Chọn đơn hàng cần đánh giá" });
      return;
    }
    if (text.trim().length < 5) {
      setMessage({ type: "error", text: "Nội dung phải từ 5 ký tự" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selectedOrder, rating, text, images }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setText("");
        setImages([]);
        setRating(5);
        setSelectedOrder("");
        // Reload reviews
        fetch(`/api/reviews/my`)
          .then((r) => r.json())
          .then((d) => { if (d.success) setMyReviews(d.reviews); });
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Lỗi kết nối" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Đánh giá dịch vụ</h1>
      <p style={{ color: "#6b7280", marginBottom: 24, fontSize: 14 }}>
        Chia sẻ trải nghiệm của bạn — đánh giá sẽ hiển thị sau khi admin duyệt
      </p>

      {message && (
        <div style={{
          padding: "12px 16px",
          borderRadius: 12,
          marginBottom: 16,
          background: message.type === "success" ? "#ecfdf5" : "#fef2f2",
          border: `1px solid ${message.type === "success" ? "#86efac" : "#fecaca"}`,
          color: message.type === "success" ? "#059669" : "#dc2626",
          fontWeight: 600,
          fontSize: 13.5,
        }}>
          {message.text}
        </div>
      )}

      <div style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 20,
        padding: 24,
        boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
      }}>
        {/* Chọn đơn */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13.5, fontWeight: 700, marginBottom: 8 }}>
            Chọn đơn hàng *
          </label>
          <select
            value={selectedOrder}
            onChange={(e) => setSelectedOrder(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1.5px solid #e5e7eb",
              borderRadius: 12,
              fontSize: 14,
              fontFamily: "inherit",
              background: "#fff",
            }}
          >
            <option value="">-- Chọn đơn đã mua --</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.orderCode} — {o.serviceName} — {o.finalAmount.toLocaleString("vi-VN")}đ
              </option>
            ))}
          </select>
          {orders.length === 0 && (
            <div style={{ fontSize: 12, color: "#dc2626", marginTop: 6 }}>
              Bạn chưa có đơn hàng nào đã thanh toán
            </div>
          )}
        </div>

        {/* Rating */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13.5, fontWeight: 700, marginBottom: 8 }}>
            Đánh giá *
          </label>
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 32,
                  cursor: "pointer",
                  color: star <= rating ? "#fbbf24" : "#e5e7eb",
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Text */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13.5, fontWeight: 700, marginBottom: 8 }}>
            Nội dung *
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="VD: Dịch vụ uy tín, locket hoạt động tốt..."
            rows={4}
            style={{
              width: "100%",
              padding: "13px 16px",
              border: "1.5px solid #e5e7eb",
              borderRadius: 12,
              fontSize: 14,
              fontFamily: "inherit",
              resize: "vertical",
            }}
          />
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
            {text.length} ký tự (tối thiểu 5)
          </div>
        </div>

        {/* Upload ảnh */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13.5, fontWeight: 700, marginBottom: 8 }}>
            Ảnh đánh giá (tối đa 3)
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {images.map((img, i) => (
              <div key={i} style={{ position: "relative" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt=""
                  style={{ width: 80, height: 120, objectFit: "cover", borderRadius: 10, border: "1px solid #e5e7eb" }}
                />
                <button
                  onClick={() => setImages((prev) => prev.filter((_, x) => x !== i))}
                  style={{
                    position: "absolute",
                    top: 4, right: 4,
                    width: 22, height: 22,
                    background: "rgba(0,0,0,0.7)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}

            {images.length < 3 && (
              <label style={{
                width: 80, height: 120,
                border: "2px dashed #d1d5db",
                borderRadius: 10,
                display: "grid",
                placeItems: "center",
                cursor: uploading ? "wait" : "pointer",
                background: "#f9fafb",
                fontSize: 24,
                color: "#9ca3af",
              }}>
                {uploading ? "..." : "+"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUpload}
                  disabled={uploading}
                  style={{ display: "none" }}
                />
              </label>
            )}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !selectedOrder || text.trim().length < 5}
          style={{
            width: "100%",
            padding: 15,
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 800,
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting || !selectedOrder || text.trim().length < 5 ? 0.6 : 1,
            fontFamily: "inherit",
          }}
        >
          {submitting ? "Đang gửi..." : "Gửi đánh giá"}
        </button>
      </div>

      {/* Đánh giá đã gửi */}
      {myReviews.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>
            Đánh giá của bạn ({myReviews.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {myReviews.map((r: any) => (
              <div key={r.id} style={{
                padding: 14,
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
              }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <span style={{ color: "#fbbf24" }}>{"★".repeat(r.rating)}</span>
                  <span style={{
                    padding: "2px 8px",
                    background: r.status === "approved" ? "#ecfdf5" : r.status === "rejected" ? "#fef2f2" : "#fffbeb",
                    color: r.status === "approved" ? "#059669" : r.status === "rejected" ? "#dc2626" : "#d97706",
                    fontSize: 10,
                    fontWeight: 800,
                    borderRadius: 4,
                  }}>
                    {r.status === "approved" ? "ĐÃ DUYỆT" : r.status === "rejected" ? "TỪ CHỐI" : "CHỜ DUYỆT"}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "#374151" }}>{r.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
