"use client";

import { useEffect, useState } from "react";
import AdminPage from "@/components/admin/AdminPage";

interface ReferralItem {
  id: string;
  referrer: string;
  referred: string;
  code: string;
  commission: number;
  commissionPaid: boolean;
  createdAt: string;
  paidAt: string | null;
}

interface Stats {
  totalReferrals: number;
  totalCommission: number;
  pendingCommission: number;
  activeReferrers: number;
}

interface TopReferrer {
  username: string;
  email: string;
  count: number;
  commission: number;
}

export default function AdminReferralPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/referral")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setStats(d.stats);
          setTopReferrers(d.topReferrers || []);
          setReferrals(d.referrals || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => (n || 0).toLocaleString("vi-VN") + "đ";

  const filtered = referrals.filter((r) => {
    if (filter === "paid" && !r.commissionPaid) return false;
    if (filter === "pending" && r.commissionPaid) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.referrer.toLowerCase().includes(q) && !r.referred.toLowerCase().includes(q) && !r.code.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <AdminPage title="Quản lý giới thiệu" description="Theo dõi hoa hồng giới thiệu của tất cả user">
      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--text-2)" }}>Đang tải...</div>
      ) : (
        <>
          {/* 4 card thống kê */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
            <StatCard label="Tổng lượt mời" value={stats?.totalReferrals || 0} color="#60a5fa" />
            <StatCard label="Đã trả" value={fmt(stats?.totalCommission || 0)} color="#10b981" />
            <StatCard label="Chờ trả" value={fmt(stats?.pendingCommission || 0)} color="#fbbf24" />
            <StatCard label="Người mời hoạt động" value={stats?.activeReferrers || 0} color="#a78bfa" />
          </div>

          {/* Top referrers */}
          {topReferrers.length > 0 && (
            <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14, color: "var(--text-0)" }}>🏆 Top người mời</h2>
              <div style={{ display: "grid", gap: 8 }}>
                {topReferrers.map((t, i) => (
                  <div key={t.username} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < topReferrers.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: i === 0 ? "linear-gradient(135deg,#fbbf24,#f59e0b)" : i === 1 ? "linear-gradient(135deg,#cbd5e1,#94a3b8)" : i === 2 ? "linear-gradient(135deg,#fb923c,#ea580c)" : "var(--bg-2)",
                      display: "grid", placeItems: "center", color: "#fff", fontWeight: 900, fontSize: 12, flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-0)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@{t.username}</div>
                      <div style={{ fontSize: 11, color: "var(--text-2)" }}>{t.email}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-0)" }}>{t.count} người</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#10b981" }}>+{fmt(t.commission)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter */}
          <div className="admin-filter" style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="🔍 Tìm theo user hoặc mã..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {(["all", "paid", "pending"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="admin-btn"
                  style={{
                    background: filter === f ? "var(--accent)" : undefined,
                    color: filter === f ? "#fff" : undefined,
                    fontSize: 13,
                    padding: "8px 14px",
                  }}
                >
                  {f === "all" ? "Tất cả" : f === "paid" ? "✅ Đã trả" : "⏳ Chờ"}
                </button>
              ))}
            </div>
          </div>

          {/* Danh sách */}
          <div style={{ display: "grid", gap: 10 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-2)", background: "var(--bg-1)", borderRadius: 14, border: "1px solid var(--border)" }}>
                Không có dữ liệu
              </div>
            ) : (
              filtered.map((r) => (
                <div
                  key={r.id}
                  style={{
                    background: "var(--bg-1)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "#60a5fa" }}>@{r.referrer}</span>
                      <span style={{ color: "var(--text-2)" }}>→</span>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-0)" }}>@{r.referred}</span>
                    </div>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        background: r.commissionPaid ? "rgba(52,211,153,.15)" : "rgba(251,191,36,.15)",
                        color: r.commissionPaid ? "#34d399" : "#fbbf24",
                      }}
                    >
                      {r.commissionPaid ? "✅ Đã trả" : "⏳ Chờ"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", fontSize: 12, color: "var(--text-2)" }}>
                    <span>Mã: <b style={{ color: "var(--accent-bright)", fontFamily: "monospace" }}>{r.code}</b></span>
                    <span style={{ color: "#10b981", fontWeight: 700, fontSize: 13 }}>+{fmt(r.commission)}</span>
                    <span>{new Date(r.createdAt).toLocaleString("vi-VN")}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </AdminPage>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
      <div style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color }}>{value}</div>
    </div>
  );
}
