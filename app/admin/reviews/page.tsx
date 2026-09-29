"use client";

import { useEffect, useState } from "react";

interface Review {
  id: string;
  userId: string | null;
  orderId: string | null;
  name: string;
  initial: string;
  text: string;
  rating: number;
  image: string | null;
  images: string | null;
  time: string;
  status: string;
  isApproved: boolean;
  isFeatured: boolean;
  rejectReason: string | null;
  createdAt: string;
  user?: { email: string; username: string } | null;
}

type Tab = "pending" | "approved" | "rejected" | "all";

export default function AdminReviewsPage() {
  const [tab, setTab] = useState<Tab>("pending");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/reviews?status=${tab}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setReviews(d.reviews);
          const c: Record<string, number> = {};
          d.counts.forEach((x: { status: string; _count: number }) => { c[x.status] = x._count; });
          setCounts(c);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [tab]);

  const handleAction = async (id: string, action: string, reason?: string) => {
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, reason }),
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa đánh giá này?")) return;
    await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    load();
  };

  const parseImages = (r: Review): string[] => {
    if (r.images) {
      try { return JSON.parse(r.images); } catch { return []; }
    }
    return r.image ? [r.image] : [];
  };

  const tabs: { id: Tab; label: string; color: string }[] = [
    { id: "pending",  label: `Chờ duyệt (${counts.pending || 0})`,   color: "#d97706" },
    { id: "approved", label: `Đã duyệt (${counts.approved || 0})`,   color: "#059669" },
    { id: "rejected", label: `Từ chối (${counts.rejected || 0})`,    color: "#dc2626" },
    { id: "all",      label: "Tất cả",                              color: "#6b7280" },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Quản lý đánh giá</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>
        Duyệt đánh giá để hiển thị trên trang chủ
      </p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              border: `2px solid ${tab === t.id ? t.color : "#e5e7eb"}`,
              background: tab === t.id ? t.color : "#fff",
              color: tab === t.id ? "#fff" : "#374151",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div style={{ padding: 60, textAlign: "center", color: "#6b7280" }}>Đang tải...</div>}

      {!loading && reviews.length === 0 && (
        <div style={{
          padding: 60,
          textAlign: "center",
          background: "#f9fafb",
          borderRadius: 16,
          color: "#6b7280",
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div>Không có đánh giá nào</div>
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {reviews.map((r) => {
            const imgs = parseImages(r);
            return (
              <div key={r.id} style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}>
                {/* Images row */}
                {imgs.length > 0 && (
                  <div style={{
                    display: "flex",
                    gap: 4,
                    padding: 8,
                    background: "#f9fafb",
                    overflowX: "auto",
                  }}>
                    {imgs.map((img, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={img}
                        alt=""
                        onClick={() => setLightbox(img)}
                        style={{
                          width: 80,
                          height: 140,
                          objectFit: "cover",
                          borderRadius: 8,
                          cursor: "zoom-in",
                          flexShrink: 0,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Content */}
                <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#a78bfa,#7c3aed)",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 14,
                      display: "grid", placeItems: "center",
                    }}>
                      {r.initial}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>{r.name}</div>
                      {r.user && (
                        <div style={{ fontSize: 11, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {r.user.email}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>

                  {/* Rating */}
                  <div style={{ fontSize: 14, color: "#fbbf24" }}>
                    {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                  </div>

                  {/* Text */}
                  <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>
                    {r.text}
                  </div>

                  {/* Badges */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {r.isFeatured && (
                      <span style={{
                        padding: "3px 8px", background: "#fef3c7", color: "#b45309",
                        fontSize: 10, fontWeight: 800, borderRadius: 4,
                      }}>
                        ⭐ NỔI BẬT
                      </span>
                    )}
                    <span style={{
                      padding: "3px 8px",
                      background: r.status === "approved" ? "#ecfdf5" : r.status === "rejected" ? "#fef2f2" : "#fffbeb",
                      color: r.status === "approved" ? "#059669" : r.status === "rejected" ? "#dc2626" : "#d97706",
                      fontSize: 10,
                      fontWeight: 800,
                      borderRadius: 4,
                      textTransform: "uppercase",
                    }}>
                      {r.status === "pending" ? "CHỜ DUYỆT" : r.status === "approved" ? "ĐÃ DUYỆT" : "TỪ CHỐI"}
                    </span>
                    {r.orderId && (
                      <span style={{ padding: "3px 8px", background: "#f3f4f6", color: "#374151", fontSize: 10, fontWeight: 700, borderRadius: 4 }}>
                        Đơn: {r.orderId.slice(0, 8)}...
                      </span>
                    )}
                  </div>

                  {r.rejectReason && (
                    <div style={{ fontSize: 11, color: "#dc2626", fontStyle: "italic" }}>
                      Lý do: {r.rejectReason}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6, marginTop: "auto", paddingTop: 10, borderTop: "1px solid #f3f4f6" }}>
                    {r.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAction(r.id, "approve")}
                          style={{
                            flex: 1, padding: "8px 12px",
                            background: "#10b981", color: "#fff",
                            border: "none", borderRadius: 8,
                            fontSize: 12, fontWeight: 800, cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          ✓ Duyệt
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt("Lý do từ chối:");
                            if (reason) handleAction(r.id, "reject", reason);
                          }}
                          style={{
                            flex: 1, padding: "8px 12px",
                            background: "#fff", color: "#dc2626",
                            border: "1px solid #fecaca", borderRadius: 8,
                            fontSize: 12, fontWeight: 800, cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          ✕ Từ chối
                        </button>
                      </>
                    )}
                    {r.status === "approved" && (
                      <button
                        onClick={() => handleAction(r.id, r.isFeatured ? "unfeature" : "feature")}
                        style={{
                          flex: 1, padding: "8px 12px",
                          background: r.isFeatured ? "#fef3c7" : "#fff",
                          color: r.isFeatured ? "#b45309" : "#6b7280",
                          border: "1px solid #e5e7eb", borderRadius: 8,
                          fontSize: 12, fontWeight: 800, cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        {r.isFeatured ? "⭐ Bỏ nổi bật" : "☆ Đặt nổi bật"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(r.id)}
                      style={{
                        padding: "8px 12px",
                        background: "#fff", color: "#6b7280",
                        border: "1px solid #e5e7eb", borderRadius: 8,
                        fontSize: 12, fontWeight: 800, cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.9)",
            display: "grid", placeItems: "center",
            zIndex: 999, cursor: "zoom-out",
            padding: 20,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 12 }} />
        </div>
      )}
    </div>
  );
}
