"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminCard from "@/components/admin/AdminCard";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminButton from "@/components/admin/AdminButton";
import AdminToast, { showToast } from "@/components/admin/AdminToast";

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  paidOrders: number;
  completedOrders: number;
}

interface Order {
  id: string;
  orderCode: string;
  serviceName: string;
  finalAmount: number;
  status: string;
  createdAt: string;
}

interface TopUser {
  id: string;
  username: string;
  name: string | null;
  totalSpent: number;
  orderCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const d = await res.json();
      if (d.success) {
        setStats(d.stats);
        setRecentOrders(d.recentOrders || []);
        setTopUsers(d.topUsers || []);
      } else {
        showToast("error", "Lỗi tải dữ liệu", d.message);
      }
    } catch {
      showToast("error", "Lỗi kết nối", "Kiểm tra server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const fmt = (n: number) => (n || 0).toLocaleString("vi-VN") + "đ";
  const fmtNum = (n: number) => (n || 0).toLocaleString("vi-VN");

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: any; label: string }> = {
      pending: { variant: "warning", label: "Chờ xử lý" },
      paid: { variant: "info", label: "Đã thanh toán" },
      processing: { variant: "purple", label: "Đang xử lý" },
      completed: { variant: "success", label: "Hoàn thành" },
      cancelled: { variant: "danger", label: "Đã hủy" },
      expired: { variant: "neutral", label: "Hết hạn" },
    };
    const b = map[status] || { variant: "neutral", label: status };
    return <AdminBadge variant={b.variant} dot>{b.label}</AdminBadge>;
  };

  // Fake data doanh thu 7 ngày (nếu API chưa có)
  const revenue7Days = [30, 55, 42, 68, 90, 75, 85];

  if (loading) {
    return (
      <div style={{ padding: 80, textAlign: "center" }}>
        <div className="adm-spinner" />
        <p style={{ color: "#64748b", marginTop: 16 }}>Đang tải...</p>
        <style jsx>{`
          .adm-spinner {
            width: 44px;
            height: 44px;
            margin: 0 auto;
            border: 3px solid #e2e8f0;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <AdminToast />

      {/* HEADER */}
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.02em" }}>
            📊 Tổng quan
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
            Toàn cảnh hoạt động của Locket Gold
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <AdminButton variant="outline" icon={<>🔄</>} onClick={load}>
            Làm mới
          </AdminButton>
          <AdminButton variant="primary" icon={<>📦</>} onClick={() => (window.location.href = "/admin/orders")}>
            Xem đơn hàng
          </AdminButton>
        </div>
      </div>

      {/* STATS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        <AdminStatCard
          label="Doanh thu"
          value={fmt(stats?.totalRevenue || 0)}
          icon={<>💰</>}
          color="#10b981"
          trend={{ value: 12.5 }}
        />
        <AdminStatCard
          label="Người dùng"
          value={fmtNum(stats?.totalUsers || 0)}
          icon={<>👥</>}
          color="#2563eb"
          trend={{ value: 5.2 }}
        />
        <AdminStatCard
          label="Đơn hàng"
          value={fmtNum(stats?.totalOrders || 0)}
          icon={<>📦</>}
          color="#7c3aed"
          trend={{ value: 8.1 }}
        />
        <AdminStatCard
          label="Chờ xử lý"
          value={fmtNum(stats?.pendingOrders || 0)}
          icon={<>⏳</>}
          color="#f59e0b"
          trend={{ value: -3.2 }}
        />
      </div>

      {/* CHART + TOP USERS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, marginBottom: 24 }}>
        {/* BIỂU ĐỒ DOANH THU */}
        <AdminCard
          title="Doanh thu 7 ngày gần đây"
          subtitle="Đơn vị: nghìn đồng"
          icon={<>📈</>}
          action={<AdminBadge variant="success">+12.5%</AdminBadge>}
          padding={24}
        >
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 200, padding: "10px 0" }}>
            {revenue7Days.map((v, i) => {
              const height = (v / 100) * 160;
              const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b" }}>{v}k</div>
                  <div
                    style={{
                      width: "100%",
                      height,
                      background: "linear-gradient(180deg, #3b82f6, #2563eb)",
                      borderRadius: "8px 8px 4px 4px",
                      transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                      animation: `grow-${i} 0.8s ease-out`,
                    }}
                  />
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>{days[i]}</div>
                </div>
              );
            })}
          </div>
          <style jsx>{`
            @keyframes grow-0 { from { height: 0; } }
            @keyframes grow-1 { from { height: 0; } }
            @keyframes grow-2 { from { height: 0; } }
            @keyframes grow-3 { from { height: 0; } }
            @keyframes grow-4 { from { height: 0; } }
            @keyframes grow-5 { from { height: 0; } }
            @keyframes grow-6 { from { height: 0; } }
          `}</style>
        </AdminCard>

        {/* TOP USERS */}
        <AdminCard
          title="Top 5 khách hàng"
          subtitle="Chi tiêu nhiều nhất"
          icon={<>🏆</>}
          action={<Link href="/admin/users" style={{ fontSize: 12.5, color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>Xem tất cả →</Link>}
          padding={16}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topUsers.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20, color: "#94a3b8", fontSize: 13 }}>
                Chưa có dữ liệu
              </div>
            ) : (
              topUsers.slice(0, 5).map((u, i) => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 4px" }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 900,
                      fontSize: 12,
                      color: "#fff",
                      background:
                        i === 0 ? "linear-gradient(135deg,#fbbf24,#f59e0b)"
                        : i === 1 ? "linear-gradient(135deg,#cbd5e1,#94a3b8)"
                        : i === 2 ? "linear-gradient(135deg,#fb923c,#ea580c)"
                        : "linear-gradient(135deg,#e2e8f0,#cbd5e1)",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      @{u.username}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748b" }}>
                      {u.orderCount} đơn hàng
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#10b981", flexShrink: 0 }}>
                    {fmt(u.totalSpent)}
                  </div>
                </div>
              ))
            )}
          </div>
        </AdminCard>
      </div>

      {/* ĐƠN HÀNG GẦN ĐÂY */}
      <AdminCard
        title="Đơn hàng gần đây"
        subtitle="10 đơn mới nhất"
        icon={<>📦</>}
        action={<Link href="/admin/orders" style={{ fontSize: 12.5, color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>Xem tất cả →</Link>}
        padding={0}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={thStyle}>Mã đơn</th>
                <th style={thStyle}>Dịch vụ</th>
                <th style={thStyle}>Số tiền</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={thStyle}>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              ) : (
                recentOrders.slice(0, 10).map((o) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={tdStyle}>
                      <code style={{ fontSize: 12, color: "#2563eb", fontWeight: 700 }}>
                        {o.orderCode}
                      </code>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>
                        {o.serviceName}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: 14, fontWeight: 900, color: "#10b981" }}>
                        {fmt(o.finalAmount)}
                      </span>
                    </td>
                    <td style={tdStyle}>{statusBadge(o.status)}</td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: 12, color: "#64748b" }}>
                        {new Date(o.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </>
  );
}

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: 11.5,
  fontWeight: 800,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  fontSize: 13,
  verticalAlign: "middle",
};
