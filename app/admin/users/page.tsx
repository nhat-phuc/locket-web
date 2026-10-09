"use client";

import { useEffect, useState, useMemo } from "react";
import AdminCard from "@/components/admin/AdminCard";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminButton from "@/components/admin/AdminButton";
import AdminToast, { showToast } from "@/components/admin/AdminToast";

interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  picture: string | null;
  phone: string | null;
  balance: number;
  bonusBalance: number;
  role: string;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
}

interface Order {
  id: string;
  orderCode: string;
  serviceName: string;
  amount: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
}

interface Tx {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
}

type Tab = "info" | "actions" | "orders" | "transactions" | "danger";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "banned">("all");

  const [selected, setSelected] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("info");
  const [orders, setOrders] = useState<Order[]>([]);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);

  // Action states
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [notiTitle, setNotiTitle] = useState("");
  const [notiContent, setNotiContent] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherValue, setVoucherValue] = useState("");
  const [voucherType, setVoucherType] = useState<"percent" | "fixed">("percent");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUsers(d.users || d.items || []);
      })
      .catch(() => showToast("error", "Lỗi tải danh sách"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Load data theo tab
  useEffect(() => {
    if (!selected) return;
    setLoadingTab(true);
    if (tab === "orders") {
      fetch(`/api/admin/users/${selected.id}/orders`)
        .then((r) => r.json())
        .then((d) => { if (d.success) setOrders(d.orders); })
        .finally(() => setLoadingTab(false));
    } else if (tab === "transactions") {
      fetch(`/api/admin/users/${selected.id}/transactions`)
        .then((r) => r.json())
        .then((d) => { if (d.success) setTxs(d.transactions); })
        .finally(() => setLoadingTab(false));
    } else {
      setLoadingTab(false);
    }
  }, [tab, selected]);

  const openUser = (u: User) => {
    setSelected(u);
    setTab("info");
    setAmount("");
    setNote("");
    setNewPassword("");
    setNotiTitle("");
    setNotiContent("");
    setVoucherCode("");
    setVoucherValue("");
  };

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (filterRole !== "all" && u.role !== filterRole) return false;
      if (filterStatus === "active" && u.isBanned) return false;
      if (filterStatus === "banned" && !u.isBanned) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.name || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, search, filterRole, filterStatus]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => !u.isBanned).length,
    banned: users.filter((u) => u.isBanned).length,
    admins: users.filter((u) => u.role === "admin").length,
    totalBalance: users.reduce((s, u) => s + u.balance + u.bonusBalance, 0),
  }), [users]);

  // ═══ ACTIONS ═══
  const handleToggleBan = async (u: User) => {
    const action = u.isBanned ? "mở khóa" : "khóa";
    if (!confirm(`Bạn có chắc muốn ${action} user "${u.username}"?`)) return;

    try {
      const res = await fetch("/api/admin/users/toggle-ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id, isBanned: !u.isBanned }),
      });
      const d = await res.json();
      if (d.success) {
        showToast("success", `Đã ${action}`, u.username);
        load();
        if (selected?.id === u.id) setSelected({ ...u, isBanned: !u.isBanned });
      } else showToast("error", "Lỗi", d.message);
    } catch { showToast("error", "Lỗi kết nối"); }
  };

  const handleChangeRole = async (u: User, newRole: "admin" | "user") => {
    if (!confirm(`Đổi role của "${u.username}" thành "${newRole === "admin" ? "Quản trị" : "Người dùng"}"?`)) return;
    try {
      const res = await fetch("/api/admin/users/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id, role: newRole }),
      });
      const d = await res.json();
      if (d.success) {
        showToast("success", "Đã đổi role", u.username);
        load();
        if (selected?.id === u.id) setSelected({ ...u, role: newRole });
      } else showToast("error", "Lỗi", d.message);
    } catch { showToast("error", "Lỗi kết nối"); }
  };

  const handleRecharge = async (type: "add" | "subtract") => {
    if (!selected) return;
    const num = Number(amount);
    if (!num || num <= 0) return showToast("warning", "Số tiền không hợp lệ");
    if (type === "subtract" && num > selected.balance) return showToast("warning", "Số dư không đủ");

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${selected.id}/recharge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: num, note: note || (type === "add" ? "Admin cộng tiền" : "Admin trừ tiền"), type }),
      });
      const d = await res.json();
      if (d.success) {
        showToast("success", type === "add" ? `Đã cộng ${num.toLocaleString("vi-VN")}đ` : `Đã trừ ${num.toLocaleString("vi-VN")}đ`);
        setSelected({ ...selected, balance: type === "add" ? selected.balance + num : selected.balance - num });
        setAmount(""); setNote("");
        load();
      } else showToast("error", "Lỗi", d.message);
    } catch { showToast("error", "Lỗi kết nối"); }
    finally { setSubmitting(false); }
  };

  const handleResetPassword = async () => {
    if (!selected || !newPassword) return showToast("warning", "Nhập mật khẩu mới");
    if (newPassword.length < 6) return showToast("warning", "Mật khẩu ≥ 6 ký tự");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${selected.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const d = await res.json();
      if (d.success) {
        showToast("success", "Đã reset mật khẩu", `Mật khẩu mới: ${newPassword}`);
        setNewPassword("");
      } else showToast("error", "Lỗi", d.message);
    } catch { showToast("error", "Lỗi kết nối"); }
    finally { setSubmitting(false); }
  };

  const handleNotify = async () => {
    if (!selected || !notiTitle || !notiContent) return showToast("warning", "Nhập đủ tiêu đề + nội dung");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${selected.id}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: notiTitle, content: notiContent, type: "info" }),
      });
      const d = await res.json();
      if (d.success) {
        showToast("success", "Đã gửi thông báo");
        setNotiTitle(""); setNotiContent("");
      } else showToast("error", "Lỗi", d.message);
    } catch { showToast("error", "Lỗi kết nối"); }
    finally { setSubmitting(false); }
  };

  const handleGrantVoucher = async () => {
    if (!selected || !voucherCode || !voucherValue) return showToast("warning", "Nhập mã + giá trị");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${selected.id}/grant-voucher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: voucherCode.toUpperCase(),
          discountType: voucherType,
          discountValue: Number(voucherValue),
        }),
      });
      const d = await res.json();
      if (d.success) {
        showToast("success", `Đã tặng voucher ${voucherCode}`);
        setVoucherCode(""); setVoucherValue("");
      } else showToast("error", "Lỗi", d.message);
    } catch { showToast("error", "Lỗi kết nối"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!confirm(`XÓA VĨNH VIỄN user "${selected.username}"?\n\nHành động không thể hoàn tác!`)) return;
    const confirmText = prompt(`Gõ "XOA" để xác nhận:`);
    if (confirmText !== "XOA") return showToast("warning", "Đã hủy");

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${selected.id}/delete`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        showToast("success", "Đã xóa user");
        setSelected(null);
        load();
      } else showToast("error", "Lỗi", d.message);
    } catch { showToast("error", "Lỗi kết nối"); }
    finally { setSubmitting(false); }
  };

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  return (
    <>
      <AdminToast />

      {/* HEADER */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.02em" }}>
            👥 Quản lý người dùng
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
            Ban/unban, đổi quyền, cộng/trừ số dư, reset mật khẩu, tặng voucher
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/api/admin/users/export" download>
            <AdminButton variant="outline" icon={<>📥</>}>Export CSV</AdminButton>
          </a>
          <AdminButton variant="outline" icon={<>🔄</>} onClick={load}>Làm mới</AdminButton>
        </div>
      </div>

      {/* MINI STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
        <MiniStat label="Tổng users" value={stats.total} color="#2563eb" icon="👥" />
        <MiniStat label="Hoạt động" value={stats.active} color="#10b981" icon="✅" />
        <MiniStat label="Bị khóa" value={stats.banned} color="#dc2626" icon="🚫" />
        <MiniStat label="Quản trị" value={stats.admins} color="#7c3aed" icon="👑" />
        <MiniStat label="Tổng số dư" value={fmt(stats.totalBalance)} color="#f59e0b" icon="💰" />
      </div>

      {/* FILTERS */}
      <AdminCard padding={16} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="🔍 Tìm theo username, email, tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: 220, padding: "10px 14px",
              background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10,
              fontSize: 13.5, fontFamily: "inherit", color: "#0f172a", outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "admin", "user"] as const).map((r) => (
              <button key={r} onClick={() => setFilterRole(r)} style={pill(filterRole === r)}>
                {r === "all" ? "Mọi vai trò" : r === "admin" ? "👑 Admin" : "👤 User"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "active", "banned"] as const).map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)} style={pill(filterStatus === s, s === "banned" ? "#dc2626" : "#2563eb")}>
                {s === "all" ? "Mọi trạng thái" : s === "active" ? "✅ Active" : "🚫 Banned"}
              </button>
            ))}
          </div>
        </div>
      </AdminCard>

      {/* TABLE */}
      <AdminCard padding={0}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#64748b" }}>Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#64748b" }}>Không có user nào</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={th}>User</th>
                  <th style={th}>Số dư</th>
                  <th style={th}>Vai trò</th>
                  <th style={th}>Trạng thái</th>
                  <th style={th}>Ngày tạo</th>
                  <th style={{ ...th, textAlign: "right" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={u.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=2563eb&color=fff&size=80&bold=true`}
                          alt={u.username}
                          referrerPolicy="no-referrer"
                          style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: `2px solid ${u.role === "admin" ? "#fbbf24" : "#bfdbfe"}`, flexShrink: 0 }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0f172a" }}>@{u.username}</div>
                          <div style={{ fontSize: 11.5, color: "#64748b" }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={td}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: "#10b981" }}>{fmt(u.balance)}</div>
                      {u.bonusBalance > 0 && <div style={{ fontSize: 11, color: "#f59e0b" }}>+{fmt(u.bonusBalance)}</div>}
                    </td>
                    <td style={td}>
                      {u.role === "admin" ? <AdminBadge variant="warning">👑 Admin</AdminBadge> : <AdminBadge variant="info">👤 User</AdminBadge>}
                    </td>
                    <td style={td}>
                      {u.isBanned ? <AdminBadge variant="danger" dot>Đã khóa</AdminBadge> : <AdminBadge variant="success" dot>Hoạt động</AdminBadge>}
                    </td>
                    <td style={td}>
                      <span style={{ fontSize: 12, color: "#64748b" }}>{new Date(u.createdAt).toLocaleDateString("vi-VN")}</span>
                    </td>
                    <td style={{ ...td, textAlign: "right" }}>
                      <AdminButton variant="primary" size="sm" onClick={() => openUser(u)}>Chi tiết</AdminButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* MODAL 5 TAB */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.7)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", zIndex: 9999, padding: 20 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 20, maxWidth: 720, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 30px 80px rgba(0,0,0,.4)" }}
          >
            {/* HEADER */}
            <div style={{ padding: 20, background: "linear-gradient(135deg, #eff6ff, #dbeafe)", display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid #e2e8f0" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(selected.username)}&background=2563eb&color=fff&size=100&bold=true`}
                alt={selected.username}
                referrerPolicy="no-referrer"
                style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "3px solid #3b82f6" }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>@{selected.username}</div>
                <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>{selected.email}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer", color: "#64748b", padding: 4 }}>×</button>
            </div>

            {/* TABS */}
            <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", padding: "0 20px", gap: 4, overflowX: "auto" }}>
              {([
                { key: "info", label: "📋 Thông tin" },
                { key: "actions", label: "⚡ Hành động" },
                { key: "orders", label: "📦 Đơn hàng" },
                { key: "transactions", label: "💰 Giao dịch" },
                { key: "danger", label: "⚠️ Nguy hiểm" },
              ] as const).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    padding: "12px 14px",
                    background: "transparent",
                    border: "none",
                    borderBottom: tab === t.key ? "2px solid #2563eb" : "2px solid transparent",
                    color: tab === t.key ? "#2563eb" : "#64748b",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* CONTENT */}
            <div style={{ padding: 20 }}>
              {/* TAB 1: INFO */}
              {tab === "info" && (
                <div>
                  <div style={{ background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", borderRadius: 14, padding: 16, marginBottom: 20, border: "1px solid #a7f3d0" }}>
                    <div style={{ fontSize: 11.5, color: "#047857", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Số dư</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: "#059669" }}>{fmt(selected.balance)}</div>
                    {selected.bonusBalance > 0 && <div style={{ fontSize: 12.5, color: "#f59e0b", marginTop: 4, fontWeight: 700 }}>+ {fmt(selected.bonusBalance)} thưởng</div>}
                  </div>

                  <div style={{ display: "grid", gap: 8, fontSize: 13.5 }}>
                    <Row label="ID" value={<code style={{ fontSize: 11 }}>{selected.id}</code>} />
                    <Row label="Tên" value={selected.name || "—"} />
                    <Row label="SĐT" value={selected.phone || "—"} />
                    <Row label="Vai trò" value={selected.role === "admin" ? "👑 Admin" : "👤 User"} />
                    <Row label="Trạng thái" value={selected.isBanned ? "🚫 Đã khóa" : "✅ Hoạt động"} />
                    <Row label="Ngày tạo" value={new Date(selected.createdAt).toLocaleString("vi-VN")} />
                  </div>

                  {/* Cộng/trừ tiền */}
                  <div style={{ marginTop: 20, padding: 16, background: "#f8fafc", borderRadius: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>💰 Cộng / Trừ số dư</div>
                    <input type="number" placeholder="Số tiền" value={amount} onChange={(e) => setAmount(e.target.value)} style={input} />
                    <input type="text" placeholder="Lý do" value={note} onChange={(e) => setNote(e.target.value)} style={input} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <AdminButton variant="success" loading={submitting} onClick={() => handleRecharge("add")}>+ Cộng</AdminButton>
                      <AdminButton variant="danger" loading={submitting} onClick={() => handleRecharge("subtract")}>− Trừ</AdminButton>
                    </div>
                  </div>

                  {/* Đổi role */}
                  <div style={{ marginTop: 16, padding: 16, background: "#f8fafc", borderRadius: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>👑 Đổi vai trò</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <AdminButton variant={selected.role === "user" ? "primary" : "outline"} onClick={() => selected.role !== "user" && handleChangeRole(selected, "user")}>👤 User</AdminButton>
                      <AdminButton variant={selected.role === "admin" ? "primary" : "outline"} onClick={() => selected.role !== "admin" && handleChangeRole(selected, "admin")}>👑 Admin</AdminButton>
                    </div>
                  </div>

                  {/* Ban toggle */}
                  <div style={{ marginTop: 16 }}>
                    <AdminButton
                      variant={selected.isBanned ? "success" : "danger"}
                      style={{ width: "100%" }}
                      onClick={() => handleToggleBan(selected)}
                    >
                      {selected.isBanned ? "🔓 Mở khóa tài khoản" : "🚫 Khóa tài khoản"}
                    </AdminButton>
                  </div>
                </div>
              )}

              {/* TAB 2: ACTIONS */}
              {tab === "actions" && (
                <div style={{ display: "grid", gap: 20 }}>
                  {/* Reset mật khẩu */}
                  <div style={{ padding: 16, background: "#fffbeb", borderRadius: 12, border: "1px solid #fde68a" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 10, color: "#92400e" }}>🔑 Reset mật khẩu</div>
                    <input type="text" placeholder="Mật khẩu mới (≥ 6 ký tự)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={input} />
                    <AdminButton variant="primary" style={{ width: "100%" }} loading={submitting} onClick={handleResetPassword}>Reset mật khẩu</AdminButton>
                  </div>

                  {/* Gửi thông báo */}
                  <div style={{ padding: 16, background: "#eff6ff", borderRadius: 12, border: "1px solid #bfdbfe" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 10, color: "#1e40af" }}>🔔 Gửi thông báo</div>
                    <input type="text" placeholder="Tiêu đề" value={notiTitle} onChange={(e) => setNotiTitle(e.target.value)} style={input} />
                    <textarea placeholder="Nội dung" value={notiContent} onChange={(e) => setNotiContent(e.target.value)} style={{ ...input, minHeight: 80, resize: "vertical" }} />
                    <AdminButton variant="primary" style={{ width: "100%" }} loading={submitting} onClick={handleNotify}>Gửi thông báo</AdminButton>
                  </div>

                  {/* Tặng voucher */}
                  <div style={{ padding: 16, background: "#f5f3ff", borderRadius: 12, border: "1px solid #ddd6fe" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 10, color: "#6d28d9" }}>🎁 Tặng voucher</div>
                    <input type="text" placeholder="Mã voucher (VD: VIP50)" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} style={input} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                      <select value={voucherType} onChange={(e) => setVoucherType(e.target.value as "percent" | "fixed")} style={input}>
                        <option value="percent">Giảm %</option>
                        <option value="fixed">Giảm tiền</option>
                      </select>
                      <input type="number" placeholder={voucherType === "percent" ? "VD: 10 (%)" : "VD: 50000 (đ)"} value={voucherValue} onChange={(e) => setVoucherValue(e.target.value)} style={{ ...input, marginBottom: 0 }} />
                    </div>
                    <AdminButton variant="primary" style={{ width: "100%" }} loading={submitting} onClick={handleGrantVoucher}>Tặng voucher</AdminButton>
                  </div>
                </div>
              )}

              {/* TAB 3: ORDERS */}
              {tab === "orders" && (
                loadingTab ? <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>Đang tải...</div> :
                orders.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Chưa có đơn hàng</div> :
                <div style={{ display: "grid", gap: 8 }}>
                  {orders.map((o) => (
                    <div key={o.id} style={{ padding: 12, background: "#f8fafc", borderRadius: 10, display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{o.serviceName}</div>
                        <div style={{ fontSize: 11.5, color: "#64748b" }}><code>{o.orderCode}</code> • {new Date(o.createdAt).toLocaleString("vi-VN")}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: "#10b981" }}>{fmt(o.amount)}</div>
                        <div style={{ fontSize: 11 }}>
                          {o.status === "paid" ? <AdminBadge variant="success">Đã TT</AdminBadge> :
                           o.status === "completed" ? <AdminBadge variant="success">Hoàn thành</AdminBadge> :
                           o.status === "cancelled" ? <AdminBadge variant="danger">Đã hủy</AdminBadge> :
                           <AdminBadge variant="warning">{o.status}</AdminBadge>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: TRANSACTIONS */}
              {tab === "transactions" && (
                loadingTab ? <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>Đang tải...</div> :
                txs.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Chưa có giao dịch</div> :
                <div style={{ display: "grid", gap: 8 }}>
                  {txs.map((t) => (
                    <div key={t.id} style={{ padding: 12, background: "#f8fafc", borderRadius: 10, display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{t.description}</div>
                        <div style={{ fontSize: 11.5, color: "#64748b" }}>{t.type} • {new Date(t.createdAt).toLocaleString("vi-VN")}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: t.amount >= 0 ? "#10b981" : "#dc2626" }}>
                          {t.amount >= 0 ? "+" : ""}{fmt(t.amount)}
                        </div>
                        <AdminBadge variant={t.status === "completed" ? "success" : "warning"}>{t.status}</AdminBadge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: DANGER */}
              {tab === "danger" && (
                <div style={{ padding: 20, background: "#fef2f2", borderRadius: 12, border: "1px solid #fecaca" }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#991b1b", marginBottom: 8 }}>⚠️ Vùng nguy hiểm</div>
                  <p style={{ fontSize: 13, color: "#7f1d1d", lineHeight: 1.6, marginBottom: 16 }}>
                    Xóa user sẽ <b>ẩn vĩnh viễn</b> tài khoản này. User sẽ không thể đăng nhập. Hành động này <b>KHÔNG THỂ HOÀN TÁC</b>.
                  </p>
                  <AdminButton variant="danger" style={{ width: "100%" }} loading={submitting} onClick={handleDelete}>
                    🗑️ Xóa vĩnh viễn user này
                  </AdminButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const th: React.CSSProperties = { padding: "12px 16px", textAlign: "left", fontSize: 11.5, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: .5, whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "14px 16px", verticalAlign: "middle" };
const input: React.CSSProperties = {
  width: "100%", padding: "10px 14px", background: "#fff",
  border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13.5,
  fontFamily: "inherit", color: "#0f172a", outline: "none", marginBottom: 10, boxSizing: "border-box",
};

function pill(active: boolean, color = "#2563eb"): React.CSSProperties {
  return {
    padding: "8px 14px", fontSize: 12.5, fontWeight: 700,
    fontFamily: "inherit", borderRadius: 8, border: "1px solid",
    borderColor: active ? color : "#e2e8f0",
    background: active ? `${color}15` : "#fff",
    color: active ? color : "#475569",
    cursor: "pointer",
  };
}

function MiniStat({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}15`, color, display: "grid", placeItems: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: .4 }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ color: "#64748b" }}>{label}</span>
      <span style={{ fontWeight: 700, color: "#0f172a", textAlign: "right" }}>{value}</span>
    </div>
  );
}
