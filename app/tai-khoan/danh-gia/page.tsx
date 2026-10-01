"use client";

import { useEffect, useState } from "react";

interface Order {
  id: string;
  orderCode: string;
  serviceName: string;
  finalAmount: number;
  paidAt: string;
}

const RATING_LABELS: Record<number, { text: string; color: string; emoji: string }> = {
  1: { text: "Rất tệ", color: "#ef4444", emoji: "😞" },
  2: { text: "Tệ",     color: "#f97316", emoji: "😕" },
  3: { text: "Bình thường", color: "#eab308", emoji: "😐" },
  4: { text: "Tốt",    color: "#22c55e", emoji: "😊" },
  5: { text: "Tuyệt vời", color: "#a78bfa", emoji: "🤩" },
};

export default function DanhGiaPage() {
  const [user, setUser] = useState<{ id: string; email: string; username?: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
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
        fetch(`/api/users/orders`)
          .then((r) => r.json())
          .then((d) => {
            if (d.success) {
              const paid = (d.orders || []).filter((o: any) => o.status === "paid");
              setOrders(paid);
            }
          });
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

  const displayRating = hoverRating || rating;
  const label = RATING_LABELS[displayRating];

  return (
    <div className="dg-wrap">
      <h1 className="dg-h1">Đánh giá dịch vụ</h1>
      <p className="dg-sub">
        Chia sẻ trải nghiệm của bạn — đánh giá sẽ hiển thị sau khi admin duyệt
      </p>

      {message && (
        <div className={`dg-alert ${message.type === "success" ? "is-ok" : "is-err"}`}>
          {message.text}
        </div>
      )}

      <div className="dg-card">
        {/* Chọn đơn hàng */}
        <div className="dg-field">
          <label className="dg-label">Chọn đơn hàng *</label>
          <select
            value={selectedOrder}
            onChange={(e) => setSelectedOrder(e.target.value)}
            className="dg-select"
          >
            <option value="">-- Chọn đơn đã mua --</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.orderCode} — {o.serviceName} — {o.finalAmount.toLocaleString("vi-VN")}đ
              </option>
            ))}
          </select>
          {orders.length === 0 && (
            <div className="dg-hint-error">Bạn chưa có đơn hàng nào đã thanh toán</div>
          )}
        </div>

        {/* ═══════ RATING SAO EMOJI ═══════ */}
        <div className="dg-field">
          <label className="dg-label">Đánh giá *</label>

          <div className="star-row">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= displayRating;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={`star-btn ${active ? "is-active" : ""}`}
                  aria-label={`${star} sao`}
                >
                  <span className="star-emoji">{active ? "⭐" : "☆"}</span>
                </button>
              );
            })}
          </div>

          {/* Label mô tả bên dưới */}
          <div
            className="star-desc"
            style={{ color: label.color }}
          >
            <span className="star-desc-emoji">{label.emoji}</span>
            <span>{label.text}</span>
            <span className="star-desc-num">({displayRating}/5)</span>
          </div>
        </div>

        {/* Nội dung */}
        <div className="dg-field">
          <label className="dg-label">Nội dung *</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="VD: Dịch vụ uy tín, locket hoạt động tốt..."
            rows={4}
            className="dg-textarea"
          />
          <div className="dg-counter">{text.length} ký tự (tối thiểu 5)</div>
        </div>

        {/* Upload ảnh */}
        <div className="dg-field">
          <label className="dg-label">Ảnh đánh giá (tối đa 3)</label>
          <div className="dg-uploads">
            {images.map((img, i) => (
              <div key={i} className="dg-upload-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, x) => x !== i))}
                  className="dg-upload-remove"
                >
                  ✕
                </button>
              </div>
            ))}

            {images.length < 3 && (
              <label className="dg-upload-add">
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
          className="dg-submit"
        >
          {submitting ? "Đang gửi..." : "Gửi đánh giá"}
        </button>
      </div>

      {/* Đánh giá đã gửi */}
      {myReviews.length > 0 && (
        <div className="dg-mine">
          <h2 className="dg-mine-title">Đánh giá của bạn ({myReviews.length})</h2>
          <div className="dg-mine-list">
            {myReviews.map((r: any) => (
              <div key={r.id} className="dg-mine-item">
                <div className="dg-mine-head">
                  <span className="dg-mine-stars">
                    {"⭐".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                  </span>
                  <span className={`dg-mine-badge ${r.status === "approved" ? "is-ok" : r.status === "rejected" ? "is-err" : "is-pending"}`}>
                    {r.status === "approved" ? "ĐÃ DUYỆT" : r.status === "rejected" ? "TỪ CHỐI" : "CHỜ DUYỆT"}
                  </span>
                </div>
                <div className="dg-mine-text">{r.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .dg-wrap {
          max-width: 640px;
          margin: 0 auto;
          padding: 20px 16px 60px;
        }

        .dg-h1 {
          font-size: 26px;
          font-weight: 900;
          margin-bottom: 8px;
          color: var(--text-0, #111827);
        }
        .dg-sub {
          color: var(--text-2, #6b7280);
          margin-bottom: 24px;
          font-size: 14px;
          line-height: 1.5;
        }

        .dg-alert {
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 16px;
          font-weight: 600;
          font-size: 13.5px;
        }
        .dg-alert.is-ok { background: #ecfdf5; border: 1px solid #86efac; color: #059669; }
        .dg-alert.is-err { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }

        .dg-card {
          background: var(--bg-1);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
        }

        .dg-field { margin-bottom: 20px; }
        .dg-label {
          display: block;
          font-size: 13.5px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #1f2937;
        }

        .dg-select {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid var(--border);
          border-radius: 12px;
          font-size: 14px;
          font-family: inherit;
          background: var(--bg-1);
          color: var(--text-0);
          cursor: pointer;
          outline: none;
        }
        .dg-select:focus { border-color: #7c3aed; }

        .dg-hint-error {
          font-size: 12px;
          color: #dc2626;
          margin-top: 6px;
        }

        /* ═══════ SAO EMOJI ═══════ */
        .star-row {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .star-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          line-height: 1;
        }

        .star-emoji {
          font-size: 48px;
          line-height: 1;
          display: inline-block;
          filter: grayscale(1) brightness(1.2);
          opacity: 0.45;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .star-btn:hover .star-emoji {
          transform: scale(1.15) rotate(-8deg);
          filter: grayscale(0) brightness(1) drop-shadow(0 6px 16px rgba(251, 191, 36, 0.6));
          opacity: 1;
        }

        .star-btn.is-active .star-emoji {
          transform: scale(1);
          filter: grayscale(0) brightness(1) drop-shadow(0 4px 12px rgba(251, 191, 36, 0.45));
          opacity: 1;
        }

        /* Label mô tả bên dưới */
        .star-desc {
          margin-top: 12px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(167, 139, 250, 0.08);
          border: 1px solid currentColor;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 800;
          transition: all 0.3s;
          animation: labelFade 0.35s ease;
        }

        @keyframes labelFade {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .star-desc-emoji {
          font-size: 18px;
          line-height: 1;
          filter: grayscale(0);
        }

        .star-desc-num {
          font-size: 12px;
          opacity: 0.7;
        }

        /* Textarea */
        .dg-textarea {
          width: 100%;
          padding: 13px 16px;
          border: 1.5px solid var(--border);
          border-radius: 12px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          outline: none;
          color: var(--text-0);
        }
        .dg-textarea:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
        }
        .dg-counter {
          font-size: 11px;
          color: var(--text-2);
          margin-top: 4px;
        }

        /* Upload */
        .dg-uploads {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .dg-upload-item {
          position: relative;
        }
        .dg-upload-item :global(img) {
          width: 80px;
          height: 120px;
          object-fit: cover;
          border-radius: 10px;
          border: 1px solid var(--border);
          display: block;
        }
        .dg-upload-remove {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 22px;
          height: 22px;
          background: rgba(0, 0, 0, 0.7);
          color: var(--text-0);
          border: none;
          border-radius: 50%;
          font-size: 12px;
          cursor: pointer;
        }
        .dg-upload-add {
          width: 80px;
          height: 120px;
          border: 2px dashed #d1d5db;
          border-radius: 10px;
          display: grid;
          place-items: center;
          cursor: pointer;
          background: var(--bg-2);
          font-size: 24px;
          color: var(--text-2);
          transition: all 0.2s;
        }
        .dg-upload-add:hover {
          border-color: #a78bfa;
          color: #a78bfa;
          background: rgba(167, 139, 250, 0.05);
        }

        /* Submit */
        .dg-submit {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: var(--text-0);
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 800;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
        }
        .dg-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(124, 58, 237, 0.45);
        }
        .dg-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* My reviews */
        .dg-mine { margin-top: 32px; }
        .dg-mine-title {
          font-size: 18px;
          font-weight: 900;
          margin-bottom: 12px;
          color: var(--text-0, #111827);
        }
        .dg-mine-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .dg-mine-item {
          padding: 14px;
          background: var(--bg-1);
          border: 1px solid var(--border);
          border-radius: 12px;
        }
        .dg-mine-head {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }
        .dg-mine-stars { font-size: 14px; }
        .dg-mine-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 800;
        }
        .dg-mine-badge.is-ok { background: #ecfdf5; color: #059669; }
        .dg-mine-badge.is-err { background: #fef2f2; color: #dc2626; }
        .dg-mine-badge.is-pending { background: #fffbeb; color: #d97706; }
        .dg-mine-text { font-size: 13px; color: var(--text-1); }

        @media (max-width: 500px) {
          .star-emoji { font-size: 40px; }
          .star-row { gap: 6px; }
          .star-desc { font-size: 13px; padding: 6px 12px; }
          .dg-card { padding: 18px; }
        }
      `}</style>
    </div>
  );
}
