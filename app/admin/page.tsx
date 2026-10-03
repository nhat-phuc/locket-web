"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setStats(d.stats);
          setRecentOrders(d.recentOrders || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 80, textAlign: "center", color: "#8b88a8" }}>
        Đang tải...
      </div>
    );
  }

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  const cards = [
    { label: "Tổng người dùng", value: stats?.totalUsers || 0, icon: "��", color: "#a78bfa" },
    { label: "Tổng đơn hàng", value: stats?.totalOrders || 0, icon: "📦", color: "#3b82f6" },
    { label: "Doanh thu", value: fmt(stats?.totalRevenue || 0), icon: "💰", color: "#10b981" },
    { label: "Đơn chờ xử lý", value: stats?.pendingOrders || 0, icon: "⏳", color: "#f59e0b" },
    { label: "Đơn đã thanh toán", value: stats?.paidOrders || 0, icon: "✅", color: "#06b6d4" },
    { label: "Đơn hoàn thành", value: stats?.completedOrders || 0, icon: "🎉", color: "#ec4899" },
  ];

  const statusLabels: Record<string, string> = {
    pending: "Chờ xử lý",
    paid: "Đã thanh toán",
    processing: "Đang xử lý",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    expired: "Hết hạn",
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f0a1e", marginBottom: 8 }}>
          📊 Dashboard
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280" }}>
          Tổng quan hoạt động của Locket Gold
        </p>
      </div>

      {/* Stats cards */}
      <div className="admin-stats-grid">
        {cards.map((c) => (
          <div key={c.label} className="admin-stat-card">
            <div
              className="admin-stat-icon"
              style={{ background: `${c.color}22`, color: c.color }}
            >
              {c.icon}
            </div>
            <div className="admin-stat-label">{c.label}</div>
            <div className="admin-stat-value" style={{ color: c.color }}>
              {c.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="admin-section">
        <div className="admin-section-head">
          <h2>🕒 Đơn hàng gần đây</h2>
          <Link href="/admin/orders" className="admin-link">
            Xem tất cả →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="admin-empty">Chưa có đơn hàng nào</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Dịch vụ</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <span className="admin-code">{o.orderCode}</span>
                    </td>
                    <td>{o.serviceName}</td>
                    <td className="admin-amount">
                      {o.finalAmount.toLocaleString("vi-VN")}đ
                    </td>
                    <td>
                      <span className={`admin-badge admin-badge-${o.status}`}>
                        {statusLabels[o.status] || o.status}
                      </span>
                    </td>
                    <td className="admin-time">
                      {new Date(o.createdAt).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        @media (max-width: 900px) { .admin-stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .admin-stats-grid { grid-template-columns: 1fr; gap: 10px; } }

        .admin-stat-card {
          background: linear-gradient(145deg, rgba(30,30,50,.8), rgba(20,20,35,.8));
          border: 1px solid rgba(167,139,250,.15);
          border-radius: 16px;
          padding: 20px;
          transition: all .3s;
        }
        .admin-stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(167,139,250,.4);
          box-shadow: 0 12px 32px rgba(124,58,237,.2);
        }

        .admin-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          margin-bottom: 12px;
        }

        .admin-stat-label {
          font-size: 12.5px;
          color: #8b88a8;
          font-weight: 600;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: .5px;
        }

        .admin-stat-value {
          font-size: 26px;
          font-weight: 900;
          letter-spacing: -.5px;
        }

        .admin-section {
          background: rgba(20,20,35,.6);
          border: 1px solid rgba(167,139,250,.12);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .admin-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .admin-section-head h2 {
          font-size: 17px;
          font-weight: 800;
          color: #f5f5ff;
          margin: 0;
        }

        .admin-link {
          color: #a78bfa;
          font-size: 13.5px;
          font-weight: 700;
          text-decoration: none;
        }
        .admin-link:hover { color: #c4b5fd; }

        .admin-empty {
          padding: 40px;
          text-align: center;
          color: #6b6885;
          font-size: 14px;
        }

        .admin-table-wrap { overflow-x: auto; }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }

        .admin-table th {
          text-align: left;
          padding: 10px 12px;
          color: #8b88a8;
          font-weight: 700;
          font-size: 11.5px;
          text-transform: uppercase;
          letter-spacing: .5px;
          border-bottom: 1px solid rgba(167,139,250,.12);
        }

        .admin-table td {
          padding: 12px;
          color: #c7c5db;
          border-bottom: 1px solid rgba(167,139,250,.06);
        }

        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tr:hover td { background: rgba(167,139,250,.04); }

        .admin-code {
          font-family: monospace;
          font-weight: 800;
          color: #a78bfa;
        }

        .admin-amount {
          font-weight: 800;
          color: #10b981;
        }

        .admin-time {
          font-size: 12px;
          color: #8b88a8;
        }

        .admin-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
        }
        .admin-badge-pending    { background: rgba(245,158,11,.15); color: #f59e0b; }
        .admin-badge-paid       { background: rgba(6,182,212,.15);  color: #06b6d4; }
        .admin-badge-processing { background: rgba(59,130,246,.15); color: #3b82f6; }
        .admin-badge-completed  { background: rgba(16,185,129,.15); color: #10b981; }
        .admin-badge-cancelled  { background: rgba(239,68,68,.15);  color: #ef4444; }
        .admin-badge-expired    { background: rgba(107,114,128,.15); color: #9ca3af; }

        @media (max-width: 640px) {
          .admin-stat-value { font-size: 22px; }
          .admin-section { padding: 14px; }
          .admin-table { font-size: 12.5px; }
          .admin-table th, .admin-table td { padding: 8px 6px; }
        }
      `}</style>
    </div>
  );
}
