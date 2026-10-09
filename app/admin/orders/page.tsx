"use client";

import { useEffect, useState, useMemo } from "react";
import AdminCard from "@/components/admin/AdminCard";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminButton from "@/components/admin/AdminButton";
import AdminToast, { showToast } from "@/components/admin/AdminToast";

interface Order {
  id: string;
  orderCode: string;
  serviceName: string;
  amount: number;
  discount: number;
  finalAmount: number;
  status: string;
  locketUsername: string | null;
  locketLink: string | null;
  couponCode: string | null;
  paymentMethod: string;
  createdAt: string;
  paidAt: string | null;
  completedAt: string | null;
}

const STATUS_META: Record<string, { label: string; variant: any; icon: string }> = {
  pending:    { label: "Chờ xử lý",   variant: "warning", icon: "⏳" },
  paid:       { label: "Đã thanh toán", variant: "info",   icon: "💰" },
  processing: { label: "Đang xử lý",   variant: "purple",  icon: "⚙️" },
  completed:  { label: "Hoàn thành",   variant: "success", icon: "✅" },
  cancelled:  { label: "Đã hủy",       variant: "danger",  icon: "❌" },
  expired:    { label: "Hết hạn",      variant: "neutral", icon: "⏰" },
};

const FILTERS = [
  { key: "",             label: "Tất cả",       color: "#2563eb" },
  { key: "pending",      label: "⏳ Chờ",         color: "#f59e0b" },
  { key: "paid",         label: "💰 Đã TT",       color: "#3b82f6" },
  { key: "processing",   label: "⚙️ Xử lý",       color: "#7c3aed" },
  { key: "completed",    label: "✅ Hoàn thành",  color: "#10b981" },
  { key: "cancelled",    label: "❌ Đã hủy",      color: "#dc2626" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadOrders = () => {
    setLoading(true);
    fetch(`/api/admin/orders?page=${page}&limit=20&status=${filter}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.orders);
          setTotalPages(data.totalPages);
          setTotal(data.total || data.orders.length);
        }
      })
      .catch(() => showToast("error", "Lỗi tải"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, [page, filter]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Đã cập nhật", STATUS_META[newStatus]?.label);
        setSelected(null);
        loadOrders();
      } else {
        showToast("error", "Lỗi", data.message);
      }
    } catch {
      showToast("error", "Lỗi kết nối");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search) return orders;
    const q = search.toLowerCase();
    return orders.filter((o) =>
      o.orderCode.toLowerCase().includes(q) ||
      o.serviceName.toLowerCase().includes(q) ||
      (o.locketUsername || "").toLowerCase().includes(q)
    );
  }, [orders, search]);

  const stats = useMemo(() => {
    const totalRevenue = orders.filter((o) => ["paid", "completed"].includes(o.status))
      .reduce((s, o) => s + o.finalAmount, 0);
    return {
      total,
      pending: orders.filter((o) => o.status === "pending").length,
      paid: orders.filter((o) => o.status === "paid").length,
      completed: orders.filter((o) => o.status === "completed").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      totalRevenue,
    };
  }, [orders, total]);

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  const exportCSV = () => {
    const headers = ["Mã đơn", "Dịch vụ", "Locket", "Số tiền", "Trạng thái", "Ngày tạo"];
    const rows = orders.map((o) => [
      o.orderCode,
      o.serviceName,
      o.locketUsername || "",
      o.finalAmount.toString(),
      o.status,
      new Date(o.createdAt).toLocaleString("vi-VN"),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("success", "Đã tải file");
  };

  return (
    <>
      <AdminToast />

      {/* HEADER */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.02em" }}>
            📦 Quản lý đơn hàng
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
            Theo dõi và xử lý đơn hàng của người dùng
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <AdminButton variant="outline" icon={<>📥</>} onClick={exportCSV}>Export CSV</AdminButton>
          <AdminButton variant="outline" icon={<>🔄</>} onClick={loadOrders}>Làm mới</AdminButton>
        </div>
      </div>

      {/* MINI STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        <MiniStat label="Tổng đơn" value={stats.total} color="#2563eb" icon="��" />
        <MiniStat label="Chờ xử lý" value={stats.pending} color="#f59e0b" icon="⏳" />
        <MiniStat label="Đã thanh toán" value={stats.paid} color="#3b82f6" icon="💰" />
        <MiniStat label="Hoàn thành" value={stats.completed} color="#10b981" icon="✅" />
        <MiniStat label="Đã hủy" value={stats.cancelled} color="#dc2626" icon="❌" />
        <MiniStat label="Doanh thu" value={fmt(stats.totalRevenue)} color="#7c3aed" icon="💎" />
      </div>

      {/* FILTERS */}
      <AdminCard padding={16} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="🔍 Tìm mã đơn, dịch vụ, locket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: 240,
              padding: "10px 14px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              fontSize: 13.5,
              fontFamily: "inherit",
              color: "#0f172a",
              outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => { setFilter(f.key); setPage(1); }}
                style={{
                  padding: "8px 14px",
                  fontSize: 12.5,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  borderRadius: 8,
                  border: "1px solid",
                  borderColor: filter === f.key ? f.color : "#e2e8f0",
                  background: filter === f.key ? `${f.color}15` : "#fff",
                  color: filter === f.key ? f.color : "#475569",
                  cursor: "pointer",
                }}
              >
                {f.label}
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
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#64748b" }}>
              {search || filter ? "Không tìm thấy đơn nào" : "Chưa có đơn hàng nào"}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={th}>Mã đơn</th>
                  <th style={th}>Dịch vụ</th>
                  <th style={th}>Locket</th>
                  <th style={th}>Số tiền</th>
                  <th style={th}>Trạng thái</th>
                  <th style={th}>Ngày tạo</th>
                  <th style={{ ...th, textAlign: "right" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const meta = STATUS_META[o.status] || STATUS_META.pending;
                  return (
                    <tr key={o.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={td}>
                        <code style={{
                          fontSize: 12,
                          color: "#2563eb",
                          fontWeight: 800,
                          background: "#eff6ff",
                          padding: "3px 8px",
                          borderRadius: 6,
                        }}>
                          {o.orderCode}
                        </code>
                      </td>
                      <td style={td}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>
                          {o.serviceName}
                        </div>
                      </td>
                      <td style={td}>
                        <span style={{ fontSize: 12, color: "#64748b" }}>
                          {o.locketUsername || "—"}
                        </span>
                      </td>
                      <td style={td}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: "#10b981" }}>
                          {fmt(o.finalAmount)}
                        </div>
                        {o.discount > 0 && (
                          <div style={{ fontSize: 11, color: "#f59e0b" }}>
                            −{fmt(o.discount)}
                          </div>
                        )}
                      </td>
                      <td style={td}>
                        <AdminBadge variant={meta.variant} dot>
                          {meta.icon} {meta.label}
                        </AdminBadge>
                      </td>
                      <td style={td}>
                        <span style={{ fontSize: 12, color: "#64748b" }}>
                          {new Date(o.createdAt).toLocaleString("vi-VN")}
                        </span>
                      </td>
                      <td style={{ ...td, textAlign: "right" }}>
                        <AdminButton variant="primary" size="sm" onClick={() => setSelected(o)}>
                          Chi tiết
                        </AdminButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={pageBtn(false, page === 1)}
          >
            ←
          </button>
          <div style={{
            padding: "10px 16px",
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            fontSize: 13.5,
            fontWeight: 700,
            color: "#0f172a",
          }}>
            {page} / {totalPages}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={pageBtn(false, page === totalPages)}
          >
            →
          </button>
        </div>
      )}

      {/* MODAL CHI TIẾT */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.7)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", zIndex: 9999, padding: 20 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 20, maxWidth: 560, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 30px 80px rgba(0,0,0,.4)" }}
          >
            {/* HEAD */}
            <div style={{ padding: 20, background: "linear-gradient(135deg, #eff6ff, #dbeafe)", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 800, textTransform: "uppercase", letterSpacing: .5, marginBottom: 4 }}>
                    Mã đơn
                  </div>
                  <code style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>
                    {selected.orderCode}
                  </code>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer", color: "#64748b", padding: 4 }}
                >
                  ×
                </button>
              </div>
              <AdminBadge variant={(STATUS_META[selected.status] || STATUS_META.pending).variant} dot>
                {(STATUS_META[selected.status] || STATUS_META.pending).icon} {(STATUS_META[selected.status] || STATUS_META.pending).label}
              </AdminBadge>
            </div>

            {/* BODY */}
            <div style={{ padding: 20 }}>
              <div style={{ display: "grid", gap: 8, marginBottom: 20 }}>
                <Row label="Dịch vụ" value={selected.serviceName} />
                <Row label="Locket username" value={selected.locketUsername || "—"} />
                {selected.locketLink && (
                  <Row label="Locket link" value={
                    <a href={selected.locketLink} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontSize: 12 }}>
                      {selected.locketLink.slice(0, 30)}...
                    </a>
                  } />
                )}
                <Row label="Giá gốc" value={fmt(selected.amount)} />
                {selected.discount > 0 && (
                  <Row label="Giảm giá" value={<span style={{ color: "#f59e0b" }}>−{fmt(selected.discount)}</span>} />
                )}
                {selected.couponCode && (
                  <Row label="Mã giảm giá" value={<code style={{ background: "#f5f3ff", padding: "2px 8px", borderRadius: 4, color: "#7c3aed" }}>{selected.couponCode}</code>} />
                )}
                <Row label="Thanh toán" value={<span style={{ color: "#10b981", fontWeight: 900, fontSize: 16 }}>{fmt(selected.finalAmount)}</span>} />
                <Row label="Phương thức" value={selected.paymentMethod === "bank_transfer" ? "🏦 Chuyển khoản" : selected.paymentMethod} />
                <Row label="Ngày tạo" value={new Date(selected.createdAt).toLocaleString("vi-VN")} />
                {selected.paidAt && <Row label="Đã thanh toán" value={new Date(selected.paidAt).toLocaleString("vi-VN")} />}
                {selected.completedAt && <Row label="Hoàn thành" value={new Date(selected.completedAt).toLocaleString("vi-VN")} />}
              </div>

              {/* ACTIONS */}
              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>
                  🔄 Đổi trạng thái
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  <AdminButton
                    variant={selected.status === "paid" ? "primary" : "outline"}
                    size="sm"
                    loading={submitting}
                    disabled={selected.status === "paid"}
                    onClick={() => updateStatus(selected.id, "paid")}
                  >
                    💰 Đã TT
                  </AdminButton>
                  <AdminButton
                    variant={selected.status === "completed" ? "success" : "outline"}
                    size="sm"
                    loading={submitting}
                    disabled={selected.status === "completed"}
                    onClick={() => updateStatus(selected.id, "completed")}
                  >
                    ✅ Hoàn thành
                  </AdminButton>
                  <AdminButton
                    variant={selected.status === "cancelled" ? "danger" : "outline"}
                    size="sm"
                    loading={submitting}
                    disabled={selected.status === "cancelled"}
                    onClick={() => {
                      if (confirm("Hủy đơn hàng này?")) updateStatus(selected.id, "cancelled");
                    }}
                  >
                    ❌ Hủy
                  </AdminButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const th: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: 11.5,
  fontWeight: 800,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: .5,
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "14px 16px",
  verticalAlign: "middle",
};

function pageBtn(_active: boolean, disabled: boolean): React.CSSProperties {
  return {
    width: 42,
    height: 42,
    borderRadius: 8,
    background: "#fff",
    border: "1px solid #e2e8f0",
    color: disabled ? "#cbd5e1" : "#475569",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "inherit",
    fontWeight: 700,
    fontSize: 16,
    display: "grid",
    placeItems: "center",
  };
}

function MiniStat({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}15`, color, display: "grid", placeItems: "center", fontSize: 18, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10.5, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: .3 }}>
          {label}
        </div>
        <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a", marginTop: 2 }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ color: "#64748b", fontSize: 13 }}>{label}</span>
      <span style={{ fontWeight: 700, color: "#0f172a", textAlign: "right", fontSize: 13.5 }}>{value}</span>
    </div>
  );
}
