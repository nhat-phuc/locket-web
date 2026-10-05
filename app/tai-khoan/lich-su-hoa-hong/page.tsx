"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CommissionItem {
  id: string;
  username: string;
  name: string | null;
  avatar: string | null;
  joinedAt: string;
  commission: number;
  paid: boolean;
  createdAt: string;
  paidAt: string | null;
}

interface Summary {
  total: number;
  paid: number;
  pending: number;
  totalReferrals: number;
}

export default function LichSuHoaHongPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    paid: 0,
    pending: 0,
    totalReferrals: 0,
  });
  const [history, setHistory] = useState<CommissionItem[]>([]);

  useEffect(() => {
    fetch("/api/referral/commission-history")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setSummary(d.summary);
          setHistory(d.history);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatVND = (n: number) => n.toLocaleString("vi-VN") + "đ";
  const formatDate = (s: string) =>
    new Date(s).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "var(--text-2)" }}>
        Đang tải...
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 0" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/tai-khoan/gioi-thieu"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--text-2)",
            fontSize: 13,
            textDecoration: "none",
            marginBottom: 12,
          }}
        >
          ← Quay lại giới thiệu
        </Link>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 900,
            color: "var(--text-0)",
            marginBottom: 6,
          }}
        >
          💰 Lịch sử hoa hồng
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: 14 }}>
          Xem tất cả hoa hồng từ người bạn đã giới thiệu
        </p>
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <SummaryCard
          icon="💵"
          label="Tổng hoa hồng"
          value={formatVND(summary.total)}
          color="#7c3aed"
        />
        <SummaryCard
          icon="✅"
          label="Đã nhận"
          value={formatVND(summary.paid)}
          color="#10b981"
        />
        <SummaryCard
          icon="⏳"
          label="Chờ duyệt"
          value={formatVND(summary.pending)}
          color="#f59e0b"
        />
        <SummaryCard
          icon="👥"
          label="Số người giới thiệu"
          value={summary.totalReferrals.toString()}
          color="#3b82f6"
        />
      </div>

      {/* History list */}
      {history.length === 0 ? (
        <div
          style={{
            padding: 60,
            textAlign: "center",
            background: "var(--bg-surface)",
            borderRadius: 16,
            border: "1.5px dashed var(--border-accent)",
            color: "var(--text-2)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎁</div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            Chưa có hoa hồng nào
          </div>
          <div style={{ fontSize: 13 }}>
            Chia sẻ link giới thiệu để nhận hoa hồng!
          </div>
          <Link
            href="/tai-khoan/gioi-thieu"
            style={{
              display: "inline-block",
              marginTop: 16,
              padding: "10px 20px",
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              color: "#fff",
              borderRadius: 12,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Xem link giới thiệu
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {history.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: 14,
                background: "var(--bg-surface)",
                borderRadius: 14,
                border: `1.5px solid ${
                  item.paid
                    ? "rgba(16, 185, 129, 0.3)"
                    : "rgba(245, 158, 11, 0.3)"
                }`,
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                  fontWeight: 900,
                  flexShrink: 0,
                }}
              >
                {item.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.avatar}
                    alt={item.username}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  (item.username || "U").charAt(0).toUpperCase()
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 15,
                    color: "var(--text-0)",
                    marginBottom: 2,
                  }}
                >
                  @{item.username}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                  Tham gia: {formatDate(item.joinedAt)}
                </div>
              </div>

              {/* Amount + Status */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 16,
                    color: item.paid ? "#10b981" : "#f59e0b",
                    marginBottom: 2,
                  }}
                >
                  +{formatVND(item.commission)}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: item.paid ? "#10b981" : "#f59e0b",
                  }}
                >
                  {item.paid ? "✅ Đã cộng ví" : "⏳ Chờ duyệt"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        padding: 16,
        background: "var(--bg-surface)",
        borderRadius: 14,
        border: `1.5px solid ${color}33`,
      }}
    >
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div
        style={{
          fontSize: 11,
          color: "var(--text-2)",
          fontWeight: 700,
          marginBottom: 4,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 900,
          color,
        }}
      >
        {value}
      </div>
    </div>
  );
}
