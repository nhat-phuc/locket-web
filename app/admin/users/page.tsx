"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  username: string;
  balance: number;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<User | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: string; msg: string } | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => { if (d.success) setUsers(d.users || d.items || []); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showToast = (type: string, msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleRecharge = async () => {
    if (!selected) return;
    const amt = Number(amount.replace(/\D/g, ""));
    if (!amt) {
      showToast("error", "Nhập số tiền");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${selected.id}/recharge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, note }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", data.message);
        setSelected(null);
        setAmount("");
        setNote("");
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

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Quản lý người dùng</h1>
      <p style={{ color: "#6b7280", marginBottom: 20 }}>Nạp tiền, xem số dư, quản lý tài khoản</p>

      {toast && (
        <div style={{
          padding: "12px 16px",
          borderRadius: 12,
          marginBottom: 16,
          background: toast.type === "success" ? "#ecfdf5" : "#fef2f2",
          border: `1px solid ${toast.type === "success" ? "#86efac" : "#fecaca"}`,
          color: toast.type === "success" ? "#059669" : "#dc2626",
          fontWeight: 600,
        }}>
          {toast.msg}
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Tìm theo email hoặc username..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 400,
          padding: "12px 16px",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          fontSize: 14,
          fontFamily: "inherit",
          marginBottom: 20,
        }}
      />

      {loading && <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>Đang tải...</div>}

      {!loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((u) => (
            <div key={u.id} style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: 16,
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 14,
            }}>
              <div style={{
                width: 40, height: 40,
                display: "grid", placeItems: "center",
                background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                color: "#fff",
                fontWeight: 900,
                borderRadius: "50%",
                fontSize: 16,
              }}>
                {(u.username || u.email).charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>
                  @{u.username}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{u.email}</div>
              </div>
              <div style={{
                padding: "6px 12px",
                background: u.role === "admin" ? "#fef3c7" : "#f3f4f6",
                color: u.role === "admin" ? "#b45309" : "#374151",
                fontSize: 11,
                fontWeight: 800,
                borderRadius: 6,
                textTransform: "uppercase",
              }}>
                {u.role}
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#059669", minWidth: 100, textAlign: "right" }}>
                {u.balance.toLocaleString("vi-VN")}đ
              </div>
              <button
                onClick={() => { setSelected(u); setAmount(""); setNote(""); }}
                style={{
                  padding: "8px 16px",
                  background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                💰 Nạp tiền
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal nạp tiền */}
      {selected && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          display: "grid",
          placeItems: "center",
          zIndex: 100,
          padding: 20,
        }} onClick={() => !submitting && setSelected(null)}>
          <div style={{
            background: "#fff",
            borderRadius: 20,
            padding: 28,
            width: "100%",
            maxWidth: 420,
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>
              Nạp tiền cho user
            </h3>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
              @{selected.username} — Số dư hiện tại: <b>{selected.balance.toLocaleString("vi-VN")}đ</b>
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                Số tiền (đ) *
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                placeholder="VD: 100000"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 10,
                  fontSize: 15,
                  fontFamily: "inherit",
                  fontWeight: 700,
                }}
              />
              {amount && (
                <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
                  = {Number(amount).toLocaleString("vi-VN")}đ
                </div>
              )}
            </div>

            {/* Quick amounts */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {[10000, 50000, 100000, 500000, 1000000].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(String(v))}
                  style={{
                    padding: "6px 12px",
                    border: "1px solid #e5e7eb",
                    background: amount === String(v) ? "#7c3aed" : "#fff",
                    color: amount === String(v) ? "#fff" : "#374151",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {v.toLocaleString("vi-VN")}đ
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                Lý do (tùy chọn)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Nạp tiền mặt, bù lỗi..."
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 10,
                  fontSize: 14,
                  fontFamily: "inherit",
                }}
              />
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
                  fontFamily: "inherit",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleRecharge}
                disabled={submitting || !amount}
                style={{
                  flex: 2,
                  padding: 13,
                  background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting || !amount ? 0.6 : 1,
                  fontFamily: "inherit",
                }}
              >
                {submitting ? "Đang xử lý..." : "Xác nhận nạp"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
