"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TelegramLink from "@/components/TelegramLink";

interface UserInfo {
  id: string;
  email: string;
  username: string;
  name: string | null;
  picture: string | null;
  phone: string | null;
  balance: number;
  role: string;
  createdAt: string;
}

export default function TaiKhoanPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/users/me", { credentials: "include" });
        const data = await res.json();
        if (data.success) setUser(data.user);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    fetch("/api/users/transactions", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setTransactions(d.transactions || []);
      })
      .catch(() => {})
      .finally(() => setLoadingTx(false));
  }, []);


  if (loading) {
    return <div style={{ textAlign: "center", padding: 80, color: "var(--text-2)" }}>Đang tải...</div>;
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <p style={{ color: "var(--text-2)", marginBottom: 16 }}>Vui lòng đăng nhập</p>
        <Link href="/dang-nhap" className="btn-nav">Đăng nhập</Link>
      </div>
    );
  }

  const initial = (user.name || user.username || "U").charAt(0).toUpperCase();
  const displayName = user.name || user.username || user.email.split("@")[0];
  const memberSince = new Date(user.createdAt).toLocaleDateString("vi-VN");

  return (
    <div className="tai-khoan-page">
      {/* Avatar lớn + Tên */}
      <div className="tk-hero">
        <div className="tk-avatar-wrapper">
          {user.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.picture}
              alt={displayName}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent && !parent.querySelector(".tk-avatar-fallback")) {
                  const div = document.createElement("div");
                  div.className = "tk-avatar-fallback";
                  div.textContent = initial;
                  parent.appendChild(div);
                }
              }}
            />
          ) : (
            <div className="tk-avatar-fallback">{initial}</div>
          )}
        </div>

        <h1 className="tk-title">Quản Lý Tài Khoản</h1>
        <div className="tk-badge">THÀNH VIÊN</div>
      </div>

      {/* Card 1: Thông Tin Cá Nhân */}
      <div className="tk-card">
        <div className="tk-card-header">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <h2>Thông Tin Cá Nhân</h2>
        </div>

        <div className="tk-row">
          <span className="tk-label">Tên đăng nhập (Email)</span>
          <span className="tk-value">{user.email}</span>
        </div>
        <div className="tk-row">
          <span className="tk-label">Số điện thoại</span>
          <span className="tk-value">{user.phone || "Chưa cập nhật"}</span>
        </div>
        <div className="tk-row">
          <span className="tk-label">Ngày tham gia</span>
          <span className="tk-value">{memberSince}</span>
        </div>
        <div className="tk-row">
          <span className="tk-label">Lượt kích hoạt</span>
          <span className="tk-value">0 / 1 ID</span>
        </div>
        <div className="tk-row">
          <span className="tk-label">Cấp bậc</span>
          <span className="tk-value">{user.role === "admin" ? "ADMIN" : "THÀNH VIÊN"}</span>
        </div>
      </div>

      {/* Card 2: Liên Kết Telegram */}
      <TelegramLink />


      {/* Card 3: Bảo Mật Tài Khoản */}
      <div className="tk-card">
        <div className="tk-card-header">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <h2>Bảo Mật Tài Khoản</h2>
        </div>

        <input type="password" placeholder="Mật khẩu cũ" className="tk-input" />
        <input type="password" placeholder="Mật khẩu mới" className="tk-input" />

        <button className="tk-btn-primary">Đổi Mật Khẩu</button>
      </div>

      {/* Card 4: Nâng cấp gói */}
      <div className="tk-card tk-card-upgrade">
        <div className="tk-card-header">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e85d04" strokeWidth="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          <h2>Nâng cấp lên gói cao hơn</h2>
        </div>
        <p className="tk-desc">
          Đã trả 0k cho MEMBER. Chỉ cần thanh toán chênh lệch để lên gói mới.
        </p>
      </div>

      {/* Card 5: Lịch Sử Giao Dịch */}
      <div className="tk-card">
        <div className="tk-card-header">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <h2>Lịch Sử Giao Dịch</h2>
        </div>

        {loadingTx ? (
          <div className="tk-empty">Đang tải...</div>
        ) : transactions.length === 0 ? (
          <div className="tk-empty">Bạn chưa có giao dịch nào.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {transactions.map((tx: any) => {
              const isPlus = tx.type === "recharge" || tx.amount > 0;
              const typeLabels: Record<string, string> = {
                recharge: "Nạp tiền",
                payment: "Thanh toán",
                refund: "Hoàn tiền",
                withdraw: "Rút tiền",
              };
              return (
                <div
                  key={tx.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    background: "var(--bg-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>
                      {typeLabels[tx.type] || tx.type}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                      {tx.description || "Không có mô tả"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 2 }}>
                      {new Date(tx.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 900,
                        color: isPlus ? "#10b981" : "#ef4444",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isPlus ? "+" : "-"}
                      {Math.abs(tx.amount).toLocaleString("vi-VN")}đ
                    </div>
                    <div
                      style={{
                        fontSize: 10.5,
                        color: tx.status === "completed" ? "#10b981" : "#f59e0b",
                        fontWeight: 700,
                        marginTop: 2,
                      }}
                    >
                      {tx.status === "completed" ? "✓ Thành công" : "⏳ Chờ"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
