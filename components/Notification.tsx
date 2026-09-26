"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface NotificationItem {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const typeConfig: Record<string, { icon: string; color: string; label: string }> = {
  info: { icon: "ℹ️", color: "#60a5fa", label: "Thông tin" },
  success: { icon: "✅", color: "#34d399", label: "Thành công" },
  warning: { icon: "⚠️", color: "#fbbf24", label: "Cảnh báo" },
  error: { icon: "❌", color: "#f87171", label: "Lỗi" },
  order: { icon: "📦", color: "#a78bfa", label: "Đơn hàng" },
  payment: { icon: "💰", color: "#4ade80", label: "Thanh toán" },
  promotion: { icon: "🎁", color: "#f472b6", label: "Khuyến mãi" },
  contact: { icon: "💬", color: "#38bdf8", label: "Liên hệ" },
};

const filters = [
  { id: "all", label: "Tất cả", icon: "📋" },
  { id: "info", label: "Thông tin", icon: "ℹ️" },
  { id: "success", label: "Thành công", icon: "✅" },
  { id: "order", label: "Đơn hàng", icon: "📦" },
  { id: "payment", label: "Thanh toán", icon: "💰" },
  { id: "promotion", label: "Khuyến mãi", icon: "🎁" },
];

export default function Notification() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadNotifications = useCallback(() => {
    setLoading(true);
    fetch(`/api/notifications?type=${filter}&page=${page}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
          setTotalPages(data.totalPages);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter, page]);

  useEffect(() => {
    const stored = sessionStorage.getItem("locket_user");
    if (!stored) {
      router.push("/dang-nhap");
      return;
    }
    try {
      setUser(JSON.parse(stored));
    } catch {}
  }, [router]);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user, loadNotifications]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, loadNotifications]);

  const markAsRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  if (!user) return null;

  return (
    <>
      <Header />
      <main className="wrap center-y" style={{ paddingTop: 32, paddingBottom: 60 }}>
        <div style={{ width: "100%", maxWidth: 900 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  marginBottom: 6,
                  color: "var(--text-0)",
                }}
              >
                🔔 Thông Báo
                {unreadCount > 0 && (
                  <span
                    style={{
                      marginLeft: 12,
                      fontSize: 14,
                      padding: "4px 12px",
                      borderRadius: 999,
                      background: "#ef4444",
                      color: "#fff",
                      fontWeight: 700,
                      verticalAlign: "middle",
                    }}
                  >
                    {unreadCount} mới
                  </span>
                )}
              </h1>
              <p style={{ color: "var(--text-2)", fontSize: 14 }}>
                Cập nhật thông tin mới nhất về đơn hàng, khuyến mãi và hệ thống
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  padding: "10px 20px",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--bg-1)",
                  color: "var(--text-1)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all .2s",
                }}
              >
                ✓ Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 24,
            }}
          >
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setFilter(f.id);
                  setPage(1);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: `1.5px solid ${filter === f.id ? "transparent" : "var(--border)"}`,
                  background:
                    filter === f.id
                      ? "linear-gradient(135deg, var(--accent), var(--accent-bright))"
                      : "var(--bg-1)",
                  color: filter === f.id ? "#fff" : "var(--text-2)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all .2s",
                }}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div
              style={{
                padding: 60,
                textAlign: "center",
                color: "var(--text-2)",
              }}
            >
              Đang tải thông báo...
            </div>
          ) : notifications.length === 0 ? (
            <div
              style={{
                padding: 60,
                textAlign: "center",
                background: "var(--bg-1)",
                borderRadius: 16,
                border: "1px dashed var(--border)",
              }}
            >
              <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  marginBottom: 8,
                  color: "var(--text-0)",
                }}
              >
                Chưa có thông báo nào
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-2)" }}>
                Bạn sẽ nhận được thông báo khi có cập nhật mới
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {notifications.map((n) => {
                const cfg = typeConfig[n.type] || typeConfig.info;
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && markAsRead(n.id)}
                    style={{
                      display: "flex",
                      gap: 16,
                      padding: 20,
                      background: "var(--bg-1)",
                      border: `1.5px solid ${n.isRead ? "var(--border)" : "rgba(167,139,250,.3)"}`,
                      borderRadius: 16,
                      cursor: n.isRead ? "default" : "pointer",
                      transition: "all .2s",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: `${cfg.color}22`,
                        border: `1px solid ${cfg.color}44`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        flexShrink: 0,
                      }}
                    >
                      {cfg.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 6,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: "var(--text-0)",
                          }}
                        >
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 999,
                              background: "#ef4444",
                              color: "#fff",
                              textTransform: "uppercase",
                            }}
                          >
                            Mới
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 10px",
                            borderRadius: 999,
                            background: `${cfg.color}22`,
                            color: cfg.color,
                            textTransform: "uppercase",
                          }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 14,
                          color: "var(--text-1)",
                          lineHeight: 1.6,
                          margin: "0 0 8px 0",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {n.content}
                      </p>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-2)",
                        }}
                      >
                        {new Date(n.createdAt).toLocaleString("vi-VN")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                marginTop: 24,
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="admin-btn"
              >
                ← Trước
              </button>
              <span style={{ padding: "10px 16px", color: "var(--text-2)" }}>
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="admin-btn"
              >
                Sau →
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
