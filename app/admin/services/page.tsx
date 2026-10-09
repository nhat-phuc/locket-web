"use client";

import { useEffect, useState, useMemo } from "react";
import AdminCard from "@/components/admin/AdminCard";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminButton from "@/components/admin/AdminButton";
import AdminToast, { showToast } from "@/components/admin/AdminToast";
import ServiceModal from "./ServiceModal";

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  platform: string;
  price: number;
  originalPrice?: number | null;
  discount?: number | null;
  duration?: string | null;
  features: string;
  image?: string | null;
  badge?: string | null;
  badgeColor?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  stock?: number | null;
  sold: number;
  sortOrder: number;
}

const TYPE_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  gold:    { label: "GOLD",   color: "#dc2626", bg: "#fef2f2", icon: "⭐" },
  vip:     { label: "VIP",    color: "#7c3aed", bg: "#f5f3ff", icon: "💜" },
  luxury:  { label: "LUXURY", color: "#f59e0b", bg: "#fffbeb", icon: "💎" },
  premium: { label: "PREMIUM", color: "#db2777", bg: "#fdf2f8", icon: "👑" },
  adr:     { label: "ANDROID", color: "#10b981", bg: "#ecfdf5", icon: "📱" },
  agent:   { label: "ĐẠI LÝ", color: "#fb923c", bg: "#fff7ed", icon: "��" },
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services");
      const d = await res.json();
      if (d.success) setServices(d.services);
      else showToast("error", "Lỗi tải", d.message);
    } catch {
      showToast("error", "Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (s: Service) => {
    if (!confirm(`Xóa gói "${s.name}"?\nHành động không thể hoàn tác.`)) return;
    try {
      const res = await fetch(`/api/admin/services/${s.id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        showToast("success", "Đã xóa", s.name);
        load();
      } else {
        showToast("error", "Không xóa được", d.message);
      }
    } catch {
      showToast("error", "Lỗi kết nối");
    }
  };

  const handleToggleActive = async (s: Service) => {
    try {
      const res = await fetch(`/api/admin/services/${s.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...s, isActive: !s.isActive }),
      });
      const d = await res.json();
      if (d.success) {
        showToast("success", s.isActive ? "Đã tắt" : "Đã bật", s.name);
        load();
      }
    } catch {
      showToast("error", "Lỗi");
    }
  };

  const filtered = useMemo(() => {
    return services.filter((s) => {
      if (filterType !== "all" && s.type !== filterType) return false;
      if (filterActive === "active" && !s.isActive) return false;
      if (filterActive === "inactive" && s.isActive) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !s.name.toLowerCase().includes(q) &&
          !s.slug.toLowerCase().includes(q) &&
          !s.type.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [services, search, filterType, filterActive]);

  const totalRevenue = services.reduce((sum, s) => sum + s.price * s.sold, 0);
  const totalSold = services.reduce((sum, s) => sum + s.sold, 0);

  const types = ["all", ...Array.from(new Set(services.map((s) => s.type)))];

  return (
    <>
      <AdminToast />

      {/* HEADER */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.02em" }}>
            ⚙️ Quản lý dịch vụ
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
            Sửa giá, badge, tính năng và gói dịch vụ
          </p>
        </div>
        <AdminButton
          variant="primary"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
          onClick={() => { setEditing(null); setModalOpen(true); }}
        >
          Thêm gói mới
        </AdminButton>
      </div>

      {/* MINI STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
        <MiniStat label="Tổng gói" value={services.length} color="#2563eb" icon="📦" />
        <MiniStat label="Đang bật" value={services.filter((s) => s.isActive).length} color="#10b981" icon="✅" />
        <MiniStat label="Đã bán" value={totalSold} color="#7c3aed" icon="🛒" />
        <MiniStat label="Doanh thu" value={totalRevenue.toLocaleString("vi-VN") + "đ"} color="#f59e0b" icon="💰" />
      </div>

      {/* FILTERS */}
      <AdminCard padding={16} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <input
              type="text"
              placeholder="🔍 Tìm theo tên, slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
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
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                style={{
                  padding: "8px 14px",
                  fontSize: 12.5,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  borderRadius: 8,
                  border: "1px solid",
                  borderColor: filterType === t ? "#2563eb" : "#e2e8f0",
                  background: filterType === t ? "#2563eb" : "#fff",
                  color: filterType === t ? "#fff" : "#475569",
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                {t === "all" ? "Tất cả" : TYPE_META[t]?.label || t.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "active", "inactive"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterActive(f)}
                style={{
                  padding: "8px 14px",
                  fontSize: 12.5,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  borderRadius: 8,
                  border: "1px solid",
                  borderColor: filterActive === f ? "#2563eb" : "#e2e8f0",
                  background: filterActive === f ? "#eff6ff" : "#fff",
                  color: filterActive === f ? "#2563eb" : "#475569",
                  cursor: "pointer",
                }}
              >
                {f === "all" ? "Mọi trạng thái" : f === "active" ? "Đang bật" : "Đã tắt"}
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
            <div style={{ fontSize: 15, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>
              {search || filterType !== "all" || filterActive !== "all" ? "Không tìm thấy gói nào" : "Chưa có gói nào"}
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
              {search || filterType !== "all" ? "Thử bỏ filter hoặc từ khóa khác" : "Thêm gói đầu tiên để bắt đầu bán"}
            </div>
            <AdminButton variant="primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
              + Thêm gói đầu tiên
            </AdminButton>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={th}>Gói</th>
                  <th style={th}>Loại</th>
                  <th style={th}>Giá</th>
                  <th style={th}>Đã bán</th>
                  <th style={th}>Trạng thái</th>
                  <th style={{ ...th, textAlign: "right" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const meta = TYPE_META[s.type] || TYPE_META.vip;
                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              background: meta.bg,
                              color: meta.color,
                              display: "grid",
                              placeItems: "center",
                              fontSize: 20,
                              flexShrink: 0,
                            }}
                          >
                            {meta.icon}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 2 }}>
                              {s.name}
                              {s.isFeatured && (
                                <span style={{ marginLeft: 6, color: "#f59e0b" }}>⭐</span>
                              )}
                            </div>
                            <code style={{ fontSize: 11, color: "#94a3b8", background: "#f1f5f9", padding: "1px 6px", borderRadius: 4 }}>
                              /{s.slug}
                            </code>
                          </div>
                        </div>
                      </td>
                      <td style={td}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            background: meta.bg,
                            color: meta.color,
                            borderRadius: 8,
                            fontSize: 10.5,
                            fontWeight: 800,
                            letterSpacing: .3,
                          }}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td style={td}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: "#10b981" }}>
                          {s.price.toLocaleString("vi-VN")}đ
                        </div>
                        {s.originalPrice && s.originalPrice > s.price && (
                          <div style={{ fontSize: 11.5, color: "#94a3b8", textDecoration: "line-through" }}>
                            {s.originalPrice.toLocaleString("vi-VN")}đ
                          </div>
                        )}
                      </td>
                      <td style={td}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                          {s.sold.toLocaleString("vi-VN")}
                        </div>
                      </td>
                      <td style={td}>
                        <button
                          onClick={() => handleToggleActive(s)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4px 10px 4px 4px",
                            borderRadius: 999,
                            border: "1px solid",
                            borderColor: s.isActive ? "#bbf7d0" : "#e2e8f0",
                            background: s.isActive ? "#ecfdf5" : "#f8fafc",
                            color: s.isActive ? "#059669" : "#94a3b8",
                            fontSize: 11.5,
                            fontWeight: 800,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          <span
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              background: s.isActive ? "#10b981" : "#cbd5e1",
                              display: "grid",
                              placeItems: "center",
                              color: "#fff",
                              fontSize: 10,
                            }}
                          >
                            {s.isActive ? "✓" : "−"}
                          </span>
                          {s.isActive ? "Đang bật" : "Đã tắt"}
                        </button>
                      </td>
                      <td style={{ ...td, textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <AdminButton
                            variant="outline"
                            size="sm"
                            onClick={() => { setEditing(s); setModalOpen(true); }}
                          >
                            Sửa
                          </AdminButton>
                          <AdminButton
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(s)}
                          >
                            Xóa
                          </AdminButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* MODAL */}
      {modalOpen && (
        <ServiceModal
          service={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            load();
            showToast("success", editing ? "Đã cập nhật" : "Đã thêm gói mới");
          }}
        />
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

function MiniStat({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: string }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 14,
        padding: 16,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: `${color}15`,
          color,
          display: "grid",
          placeItems: "center",
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: .4 }}>
          {label}
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", marginTop: 2 }}>
          {value}
        </div>
      </div>
    </div>
  );
}
