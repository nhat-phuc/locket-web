"use client";

import { useEffect, useState } from "react";

interface ServiceStat {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  sold: number;
  isActive: boolean;
  isFeatured: boolean;
  orderCount: number;
  revenue: number;
}

interface ServiceSummary {
  totalServices: number;
  totalOrders: number;
  totalRevenue: number;
  totalStock: number;
}

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
];

export default function ServiceChart() {
  const [stats, setStats] = useState<ServiceStat[]>([]);
  const [summary, setSummary] = useState<ServiceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setStats(d.serviceStats || []);
          setSummary(d.serviceSummary || null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";
  const fmtShort = (n: number) => {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
    return n.toString();
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "#8b88a8", background: "var(--bg-1)", borderRadius: 16 }}>Đang tải biểu đồ...</div>;
  }

  if (stats.length === 0) {
    return <div style={{ padding: 40, textAlign: "center", color: "#8b88a8", background: "var(--bg-1)", borderRadius: 16, border: "1px dashed var(--border)" }}>📊 Chưa có dữ liệu dịch vụ</div>;
  }

  const sortedByOrders = [...stats].sort((a, b) => b.orderCount - a.orderCount);
  const sortedByRevenue = [...stats].sort((a, b) => b.revenue - a.revenue);
  const topByOrders = sortedByOrders.slice(0, 5);
  const maxOrders = Math.max(...stats.map((s) => s.orderCount), 1);
  const totalRevenue = summary?.totalRevenue || 1;
  const totalOrders = summary?.totalOrders || 1;

  const donutData = sortedByRevenue.map((s, i) => ({
    label: s.name,
    value: s.revenue,
    percent: (s.revenue / totalRevenue) * 100,
    color: COLORS[i % COLORS.length],
  }));

  let cumulativePercent = 0;
  const donutRadius = 70;
  const donutStroke = 28;
  const donutCircumference = 2 * Math.PI * donutRadius;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f0a1e", margin: 0 }}>📊 Thống kê tất cả dịch vụ</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ padding: "6px 12px", background: "rgba(59,130,246,.12)", color: "#3b82f6", borderRadius: 999, fontSize: 12, fontWeight: 800 }}>🎯 {summary?.totalServices || 0} dịch vụ</div>
          <div style={{ padding: "6px 12px", background: "rgba(16,185,129,.12)", color: "#10b981", borderRadius: 999, fontSize: 12, fontWeight: 800 }}>📦 {summary?.totalOrders || 0} đơn</div>
          <div style={{ padding: "6px 12px", background: "rgba(245,158,11,.12)", color: "#f59e0b", borderRadius: 999, fontSize: 12, fontWeight: 800 }}>💰 {fmt(summary?.totalRevenue || 0)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {/* DONUT */}
        <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f0a1e", marginBottom: 16, marginTop: 0 }}>🥧 Tỉ lệ doanh thu theo dịch vụ</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <svg width="180" height="180" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r={donutRadius} fill="none" stroke="rgba(167,139,250,.1)" strokeWidth={donutStroke} />
                {donutData.map((d, i) => {
                  const dash = `${(d.percent / 100) * donutCircumference} ${donutCircumference}`;
                  const offset = -(cumulativePercent / 100) * donutCircumference;
                  cumulativePercent += d.percent;
                  return <circle key={i} cx="90" cy="90" r={donutRadius} fill="none" stroke={d.color} strokeWidth={donutStroke} strokeDasharray={dash} strokeDashoffset={offset} transform="rotate(-90 90 90)" />;
                })}
              </svg>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#8b88a8", fontWeight: 700, textTransform: "uppercase" }}>Tổng</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#0f0a1e" }}>{fmtShort(totalRevenue)}</div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              {donutData.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 12.5 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>{d.label}</div>
                  <div style={{ fontWeight: 900, color: d.color, flexShrink: 0 }}>{d.percent.toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BAR */}
        <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f0a1e", marginBottom: 16, marginTop: 0 }}>📊 Top 5 dịch vụ</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {topByOrders.map((s, i) => {
              const percent = (s.orderCount / maxOrders) * 100;
              const color = COLORS[i % COLORS.length];
              return (
                <div key={s.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5, fontWeight: 700 }}>
                    <span style={{ color: "#374151" }}>{s.name}</span>
                    <span style={{ color, fontWeight: 900 }}>{s.orderCount} đơn · {fmtShort(s.revenue)}</span>
                  </div>
                  <div style={{ height: 8, background: "rgba(167,139,250,.1)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${percent}%`, height: "100%", background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, overflowX: "auto" }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f0a1e", marginTop: 0, marginBottom: 16 }}>📋 Bảng chi tiết</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)" }}>
              <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 11, fontWeight: 800, color: "#8b88a8", textTransform: "uppercase" }}>Dịch vụ</th>
              <th style={{ textAlign: "center", padding: "10px 8px", fontSize: 11, fontWeight: 800, color: "#8b88a8", textTransform: "uppercase" }}>Đã bán</th>
              <th style={{ textAlign: "right", padding: "10px 8px", fontSize: 11, fontWeight: 800, color: "#8b88a8", textTransform: "uppercase" }}>Doanh thu</th>
              <th style={{ textAlign: "center", padding: "10px 8px", fontSize: 11, fontWeight: 800, color: "#8b88a8", textTransform: "uppercase" }}>%</th>
              <th style={{ textAlign: "center", padding: "10px 8px", fontSize: 11, fontWeight: 800, color: "#8b88a8", textTransform: "uppercase" }}>Tồn</th>
            </tr>
          </thead>
          <tbody>
            {sortedByRevenue.map((s, i) => {
              const percent = (s.revenue / totalRevenue) * 100;
              const color = COLORS[i % COLORS.length];
              return (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                      <span style={{ fontWeight: 700, color: "#0f0a1e" }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: "center", padding: "12px 8px", fontWeight: 900, color: "#3b82f6" }}>{s.orderCount}</td>
                  <td style={{ textAlign: "right", padding: "12px 8px", fontWeight: 900, color: "#10b981" }}>{fmt(s.revenue)}</td>
                  <td style={{ textAlign: "center", padding: "12px 8px" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color }}>{percent.toFixed(1)}%</span>
                  </td>
                  <td style={{ textAlign: "center", padding: "12px 8px", fontWeight: 800, color: s.stock === 0 ? "#ef4444" : s.stock < 10 ? "#f59e0b" : "#6b7280" }}>{s.stock}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: "rgba(167,139,250,.06)" }}>
              <td style={{ padding: "14px 8px", fontWeight: 900, color: "#0f0a1e" }}>📊 TỔNG CỘNG</td>
              <td style={{ textAlign: "center", padding: "14px 8px", fontWeight: 900, color: "#3b82f6", fontSize: 15 }}>{totalOrders}</td>
              <td style={{ textAlign: "right", padding: "14px 8px", fontWeight: 900, color: "#10b981", fontSize: 15 }}>{fmt(totalRevenue)}</td>
              <td style={{ textAlign: "center", padding: "14px 8px", fontWeight: 900, color: "#8b88a8" }}>100%</td>
              <td style={{ textAlign: "center", padding: "14px 8px", fontWeight: 900, color: "#6b7280" }}>{summary?.totalStock || 0}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
