"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface UserData {
  id: string;
  email: string;
  username: string;
  name: string | null;
  balance: number;
  createdAt: string;
}

export default function TaiKhoanPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState({ orders: 0, paid: 0, spent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/users/me").then((r) => r.json()),
      fetch("/api/users/orders?limit=100").then((r) => r.json()),
    ])
      .then(([meData, ordersData]) => {
        if (meData.success) setUser(meData.user);
        if (ordersData.success) {
          const orders = ordersData.orders || [];
          setStats({
            orders: orders.length,
            paid: orders.filter((o: any) => o.status === "paid" || o.status === "completed").length,
            spent: orders
              .filter((o: any) => o.status === "paid" || o.status === "completed")
              .reduce((sum: number, o: any) => sum + o.finalAmount, 0),
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--text-2)" }}>
        Đang tải...
      </div>
    );
  if (!user) return null;

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>
          Xin chào, {user.name || user.username}!
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: 14 }}>
          Quản lý tài khoản và đơn hàng của bạn
        </p>
      </div>

      <div className="user-stats-grid">
        <div className="user-stat-card">
          <div style={{ fontSize: 24, marginBottom: 8 }}>💰</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 4 }}>Số dư</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#4ade80" }}>
            {user.balance.toLocaleString("vi-VN")}đ
          </div>
        </div>
        <div className="user-stat-card">
          <div style={{ fontSize: 24, marginBottom: 8 }}>📦</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 4 }}>Tổng đơn</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--accent-bright)" }}>
            {stats.orders}
          </div>
        </div>
        <div className="user-stat-card">
          <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 4 }}>Đã thanh toán</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#34d399" }}>
            {stats.paid}
          </div>
        </div>
        <div className="user-stat-card">
          <div style={{ fontSize: 24, marginBottom: 8 }}>💸</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 4 }}>Tổng chi tiêu</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#fbbf24" }}>
            {stats.spent.toLocaleString("vi-VN")}đ
          </div>
        </div>
      </div>

      {/* Nút hành động chính */}
      <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
        <Link
          href="/nap-tien"
          style={{
            padding: "14px 24px",
            borderRadius: 12,
            background: "linear-gradient(135deg, var(--accent), var(--accent-bright))",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          💰 Nạp tiền
        </Link>
        <Link
          href="/bang-gia"
          style={{
            padding: "14px 24px",
            borderRadius: 12,
            background: "var(--bg-1)",
            border: "1px solid var(--border)",
            color: "var(--text-1)",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          🛒 Mua dịch vụ
        </Link>
        <Link
          href="/tai-khoan/don-hang"
          style={{
            padding: "14px 24px",
            borderRadius: 12,
            background: "var(--bg-1)",
            border: "1px solid var(--border)",
            color: "var(--text-1)",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          📦 Xem đơn hàng
        </Link>
        <Link
          href="/tai-khoan/danh-gia"
          style={{
            padding: "14px 24px",
            borderRadius: 12,
            background: "var(--bg-1)",
            border: "1px solid var(--border)",
            color: "var(--text-1)",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          ⭐ Đánh giá dịch vụ
        </Link>
        <Link
          href="/tai-khoan/ma-giam-gia"
          style={{
            padding: "14px 24px",
            borderRadius: 12,
            background: "var(--bg-1)",
            border: "1px solid var(--border)",
            color: "var(--text-1)",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          🎁 Mã giảm giá
        </Link>
      </div>

      <div
        style={{
          marginTop: 32,
          padding: 20,
          background: "var(--bg-1)",
          border: "1px solid var(--border)",
          borderRadius: 16,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Thông tin tài khoản</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-2)" }}>Email</span>
            <span style={{ fontWeight: 600 }}>{user.email}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-2)" }}>Username</span>
            <span style={{ fontWeight: 600 }}>{user.username}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-2)" }}>Ngày tham gia</span>
            <span style={{ fontWeight: 600 }}>
              {new Date(user.createdAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}