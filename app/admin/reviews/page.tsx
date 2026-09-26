"use client";

import { useEffect, useState } from "react";
import AdminPage from "@/components/admin/AdminPage";

interface Review {
  id: string;
  name: string;
  initial: string;
  text: string;
  rating: number;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadReviews = () => {
    setLoading(true);
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setReviews(d.reviews || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const filtered = reviews.filter((r) => {
    if (filter === "pending") return !r.isApproved;
    if (filter === "approved") return r.isApproved;
    return true;
  });

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isApproved: true } : r))
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnapprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: false }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isApproved: false } : r))
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa đánh giá này?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = reviews.filter((r) => !r.isApproved).length;

  return (
    <AdminPage title="Đánh giá" description="Quản lý và duyệt đánh giá khách hàng">
      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button
          onClick={() => setFilter("pending")}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "1.5px solid var(--border)",
            background: filter === "pending" ? "var(--accent)" : "var(--bg-1)",
            color: filter === "pending" ? "#fff" : "var(--text-1)",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          ⏳ Chờ duyệt ({pendingCount})
        </button>
        <button
          onClick={() => setFilter("approved")}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "1.5px solid var(--border)",
            background: filter === "approved" ? "var(--accent)" : "var(--bg-1)",
            color: filter === "approved" ? "#fff" : "var(--text-1)",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          ✅ Đã duyệt ({reviews.length - pendingCount})
        </button>
        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "1.5px solid var(--border)",
            background: filter === "all" ? "var(--accent)" : "var(--bg-1)",
            color: filter === "all" ? "#fff" : "var(--text-1)",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          📋 Tất cả ({reviews.length})
        </button>
      </div>

      {/* List */}
      {loading ? (
        <p style={{ color: "var(--text-2)" }}>Đang tải...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: "var(--text-2)" }}>
          {filter === "pending"
            ? "Không có đánh giá nào chờ duyệt."
            : "Không có đánh giá nào."}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((r) => (
            <div
              key={r.id}
              style={{
                padding: 16,
                background: "var(--bg-1)",
                border: "1px solid var(--border)",
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                    color: "#fff",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {r.initial}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                    {new Date(r.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>
                <div style={{ color: "#fbbf24", fontSize: 14, whiteSpace: "nowrap" }}>
                  {"★".repeat(r.rating)}
                  <span style={{ color: "var(--text-2)" }}>
                    {"★".repeat(5 - r.rating)}
                  </span>
                </div>
                <span
                  className={`status-badge ${r.isApproved ? "paid" : "pending"}`}
                  style={{ flexShrink: 0 }}
                >
                  {r.isApproved ? "Đã duyệt" : "Chờ"}
                </span>
              </div>

              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-1)",
                  marginBottom: 12,
                  lineHeight: 1.5,
                }}
              >
                {r.text}
              </p>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {!r.isApproved && (
                  <button
                    onClick={() => handleApprove(r.id)}
                    disabled={actionLoading === r.id}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      background: "#10b981",
                      color: "#fff",
                      border: "none",
                      fontWeight: 700,
                      cursor: actionLoading === r.id ? "wait" : "pointer",
                      fontSize: 13,
                      opacity: actionLoading === r.id ? 0.6 : 1,
                    }}
                  >
                    {actionLoading === r.id ? "Đang xử lý..." : "✅ Duyệt"}
                  </button>
                )}
                {r.isApproved && (
                  <button
                    onClick={() => handleUnapprove(r.id)}
                    disabled={actionLoading === r.id}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      background: "rgba(251,191,36,0.15)",
                      color: "#fbbf24",
                      border: "none",
                      fontWeight: 700,
                      cursor: actionLoading === r.id ? "wait" : "pointer",
                      fontSize: 13,
                      opacity: actionLoading === r.id ? 0.6 : 1,
                    }}
                  >
                    {actionLoading === r.id ? "Đang xử lý..." : "↩️ Bỏ duyệt"}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={actionLoading === r.id}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    background: "rgba(248,113,113,0.15)",
                    color: "#f87171",
                    border: "none",
                    fontWeight: 700,
                    cursor: actionLoading === r.id ? "wait" : "pointer",
                    fontSize: 13,
                    opacity: actionLoading === r.id ? 0.6 : 1,
                  }}
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPage>
  );
}