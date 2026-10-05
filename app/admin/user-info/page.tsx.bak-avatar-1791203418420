"use client";

import { useEffect, useState } from "react";

interface CredentialUser {
  id: string;
  email: string;
  username: string;
  name: string | null;
  picture: string | null;
  phone: string | null;
  passwordMasked: string;
  passwordFull: string;
  registerMethod: string;
  role: string;
  balance: number;
  bonusBalance: number;
  isActive: boolean;
  isBanned: boolean;
  telegramId: string | null;
  telegramLinkedAt: string | null;
  referralCode: string | null;
  referredBy: string | null;
  totalReferrals: number;
  commission: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUserInfoPage() {
  const [users, setUsers] = useState<CredentialUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CredentialUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: string; msg: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/user-credentials?search=${encodeURIComponent(search)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUsers(d.users || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [search]);

  const showToast = (type: string, msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChangePassword = async () => {
    if (!selected || !newPassword) return;
    if (newPassword.length < 6) {
      showToast("error", "Mật khẩu phải từ 6 ký tự trở lên");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/user-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selected.id, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", data.message);
        setSelected(null);
        setNewPassword("");
        load();
      } else {
        showToast("error", data.message);
      }
    } catch {
      showToast("error", "Lỗi kết nối");
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";
  const fmtDate = (s: string) =>
    new Date(s).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="admin-page">
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
        🔑 Quản lý Mật khẩu & Đăng ký
      </h1>
      <p style={{ color: "#6b7280", marginBottom: 20 }}>
        Xem thông tin đăng ký, đổi mật khẩu người dùng
      </p>

      {toast && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            marginBottom: 16,
            background: toast.type === "success" ? "#ecfdf5" : "#fef2f2",
            border: `1px solid ${toast.type === "success" ? "#86efac" : "#fecaca"}`,
            color: toast.type === "success" ? "#059669" : "#dc2626",
            fontWeight: 600,
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Tìm theo email, username, tên..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 500,
          padding: "12px 16px",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          fontSize: 14,
          fontFamily: "inherit",
          marginBottom: 20,
        }}
      />

      {loading && (
        <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
          Đang tải...
        </div>
      )}

      {!loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {users.map((u) => (
            <div
              key={u.id}
              style={{
                padding: 16,
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
              }}
            >
              {/* Hàng 1: avatar + info + role */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 900,
                    fontSize: 18,
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  {u.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={u.picture}
                      alt={u.username}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    (u.username || u.email).charAt(0).toUpperCase()
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>
                    @{u.username} {u.name && <span style={{ color: "#6b7280", fontWeight: 600 }}>· {u.name}</span>}
                  </div>
                  <div style={{ fontSize: 12.5, color: "#6b7280" }}>
                    📧 {u.email}
                    {u.phone && ` • 📱 ${u.phone}`}
                  </div>
                </div>
                <div
                  style={{
                    padding: "6px 12px",
                    background: u.role === "admin" ? "#fef3c7" : "#eff6ff",
                    color: u.role === "admin" ? "#b45309" : "#2563eb",
                    fontSize: 11,
                    fontWeight: 800,
                    borderRadius: 6,
                    textTransform: "uppercase",
                  }}
                >
                  {u.role}
                </div>
              </div>

              {/* Hàng 2: thông tin chi tiết */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 10,
                  padding: 12,
                  background: "#f9fafb",
                  borderRadius: 10,
                  fontSize: 12.5,
                  marginBottom: 12,
                }}
              >
                <div>
                  <div style={{ color: "#9ca3af", fontWeight: 700, fontSize: 10.5, marginBottom: 3 }}>
                    🔐 MẬT KHẨU (HASH)
                  </div>
                  <div style={{ fontFamily: "monospace", color: "#374151", wordBreak: "break-all" }}>
                    {showPassword === u.id ? u.passwordFull : u.passwordMasked}
                  </div>
                </div>

                <div>
                  <div style={{ color: "#9ca3af", fontWeight: 700, fontSize: 10.5, marginBottom: 3 }}>
                    📝 ĐĂNG KÝ QUA
                  </div>
                  <div style={{ color: "#374151", fontWeight: 700 }}>
                    {u.registerMethod}
                  </div>
                </div>

                <div>
                  <div style={{ color: "#9ca3af", fontWeight: 700, fontSize: 10.5, marginBottom: 3 }}>
                    💰 SỐ DƯ
                  </div>
                  <div style={{ color: "#059669", fontWeight: 800 }}>
                    {fmt(u.balance)}
                  </div>
                </div>

                <div>
                  <div style={{ color: "#9ca3af", fontWeight: 700, fontSize: 10.5, marginBottom: 3 }}>
                    🎁 BONUS
                  </div>
                  <div style={{ color: "#7c3aed", fontWeight: 800 }}>
                    {fmt(u.bonusBalance)}
                  </div>
                </div>

                <div>
                  <div style={{ color: "#9ca3af", fontWeight: 700, fontSize: 10.5, marginBottom: 3 }}>
                    📅 NGÀY ĐĂNG KÝ
                  </div>
                  <div style={{ color: "#374151" }}>{fmtDate(u.createdAt)}</div>
                </div>

                <div>
                  <div style={{ color: "#9ca3af", fontWeight: 700, fontSize: 10.5, marginBottom: 3 }}>
                    🆔 TELEGRAM ID
                  </div>
                  <div style={{ color: "#374151" }}>
                    {u.telegramId || "—"}
                  </div>
                </div>

                <div>
                  <div style={{ color: "#9ca3af", fontWeight: 700, fontSize: 10.5, marginBottom: 3 }}>
                    🔗 MÃ GIỚI THIỆU
                  </div>
                  <div style={{ color: "#374151", fontFamily: "monospace" }}>
                    {u.referralCode || "—"}
                  </div>
                </div>

                <div>
                  <div style={{ color: "#9ca3af", fontWeight: 700, fontSize: 10.5, marginBottom: 3 }}>
                    👥 ĐÃ GIỚI THIỆU
                  </div>
                  <div style={{ color: "#374151", fontWeight: 700 }}>
                    {u.totalReferrals} người
                  </div>
                </div>
              </div>

              {/* Hàng 3: trạng thái + nút */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <div
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: u.isBanned ? "#fef2f2" : "#ecfdf5",
                    color: u.isBanned ? "#dc2626" : "#059669",
                  }}
                >
                  {u.isBanned ? "🚫 Đã ban" : "✅ Hoạt động"}
                </div>

                <button
                  onClick={() => setShowPassword(showPassword === u.id ? null : u.id)}
                  style={{
                    padding: "6px 12px",
                    background: "#f3f4f6",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 11.5,
                    cursor: "pointer",
                  }}
                >
                  {showPassword === u.id ? "🙈 Ẩn hash" : "👁️ Xem hash"}
                </button>

                <button
                  onClick={() => {
                    setSelected(u);
                    setNewPassword("");
                  }}
                  style={{
                    padding: "6px 12px",
                    background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 11.5,
                    cursor: "pointer",
                  }}
                >
                  🔑 Đổi mật khẩu
                </button>
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div
              style={{
                padding: 60,
                textAlign: "center",
                color: "#9ca3af",
                background: "#fff",
                borderRadius: 14,
                border: "1px dashed #e5e7eb",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div>Không tìm thấy user nào</div>
            </div>
          )}
        </div>
      )}

      {/* Modal đổi mật khẩu */}
      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
            padding: 20,
          }}
          onClick={() => !submitting && setSelected(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 28,
              width: "100%",
              maxWidth: 420,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>
              🔑 Đổi mật khẩu
            </h3>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
              User: <b>@{selected.username}</b> ({selected.email})
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                Mật khẩu mới *
              </label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 10,
                  fontSize: 15,
                  fontFamily: "monospace",
                  fontWeight: 700,
                }}
              />
              <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 6 }}>
                Mật khẩu sẽ được hash bằng bcrypt trước khi lưu
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setSelected(null)}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: 13,
                  background: "#f3f4f6",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleChangePassword}
                disabled={submitting || !newPassword}
                style={{
                  flex: 2,
                  padding: 13,
                  background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting || !newPassword ? 0.6 : 1,
                }}
              >
                {submitting ? "Đang xử lý..." : "Xác nhận đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
