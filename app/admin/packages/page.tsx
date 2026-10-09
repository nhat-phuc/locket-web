"use client";

import { useEffect, useState, useMemo } from "react";
import AdminCard from "@/components/admin/AdminCard";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminButton from "@/components/admin/AdminButton";
import AdminToast, { showToast } from "@/components/admin/AdminToast";

interface Pkg {
  id: string;
  serviceId: string | null;
  name: string;
  duration: string;
  price: number;
  originalPrice: number | null;
  features: string;
  isPopular: boolean;
  order: number;
  service?: { name: string; slug: string; type: string };
}

interface Service {
  id: string;
  name: string;
  slug: string;
  type: string;
}

const TYPE_META: Record<string, { label: string; color: string; icon: string }> = {
  gold:    { label: "GOLD",    color: "#dc2626", icon: "⭐" },
  vip:     { label: "VIP",     color: "#7c3aed", icon: "💜" },
  luxury:  { label: "LUXURY",  color: "#f59e0b", icon: "💎" },
  premium: { label: "PREMIUM", color: "#db2777", icon: "👑" },
};

function parseFeatures(raw: string): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return raw.split("\n").filter(Boolean);
  }
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterService, setFilterService] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Pkg | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    duration: "",
    price: "",
    originalPrice: "",
    serviceId: "",
    order: "0",
    isPopular: false,
    features: [""] as string[],
  });

  const load = async () => {
    setLoading(true);
    try {
      const [pkgRes, svcRes] = await Promise.all([
        fetch("/api/admin/packages").then((r) => r.json()),
        fetch("/api/admin/services").then((r) => r.json()),
      ]);
      if (pkgRes.success) setPackages(pkgRes.packages);
      if (svcRes.success) setServices(svcRes.services);
    } catch {
      showToast("error", "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      duration: "",
      price: "",
      originalPrice: "",
      serviceId: services[0]?.id || "",
      order: "0",
      isPopular: false,
      features: [""],
    });
    setShowModal(true);
  };

  const openEdit = (p: Pkg) => {
    setEditing(p);
    const features = parseFeatures(p.features);
    setForm({
      name: p.name,
      duration: p.duration || "",
      price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      serviceId: p.serviceId || "",
      order: String(p.order || 0),
      isPopular: p.isPopular,
      features: features.length > 0 ? features : [""],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return showToast("warning", "Nhập tên gói");
    if (!form.price || Number(form.price) <= 0) return showToast("warning", "Nhập giá hợp lệ");
    if (!form.serviceId) return showToast("warning", "Chọn dịch vụ");

    setSubmitting(true);
    try {
      const cleanFeatures = form.features.map((f) => f.trim()).filter(Boolean);

      const body: any = {
        name: form.name.trim(),
        duration: form.duration.trim(),
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        serviceId: form.serviceId,
        order: Number(form.order) || 0,
        isPopular: form.isPopular,
        features: cleanFeatures,
      };
      if (editing) body.id = editing.id;

      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (d.success) {
        showToast("success", editing ? "Đã cập nhật gói" : "Đã thêm gói mới");
        setShowModal(false);
        load();
      } else showToast("error", "Lỗi", d.message);
    } catch {
      showToast("error", "Lỗi kết nối");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p: Pkg) => {
    if (!confirm(`Xóa gói "${p.name}"?\nHành động không thể hoàn tác.`)) return;
    try {
      const res = await fetch(`/api/admin/packages?id=${p.id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        showToast("success", "Đã xóa gói", p.name);
        load();
      } else showToast("error", "Lỗi", d.message);
    } catch {
      showToast("error", "Lỗi kết nối");
    }
  };

  // Features actions
  const addFeature = () => setForm({ ...form, features: [...form.features, ""] });
  const updateFeature = (i: number, val: string) => {
    const next = [...form.features];
    next[i] = val;
    setForm({ ...form, features: next });
  };
  const removeFeature = (i: number) => {
    setForm({ ...form, features: form.features.filter((_, idx) => idx !== i) });
  };

  const filtered = useMemo(() => {
    return packages.filter((p) => {
      if (filterService !== "all" && p.serviceId !== filterService) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.service?.name || "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [packages, filterService, search]);

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  return (
    <>
      <AdminToast />

      {/* HEADER */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.02em" }}>
            🎁 Quản lý gói dịch vụ
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
            Sửa tên, giá, thời hạn và tính năng của từng gói
          </p>
        </div>
        <AdminButton variant="primary" onClick={openCreate}>
          + Thêm gói mới
        </AdminButton>
      </div>

      {/* FILTERS */}
      <AdminCard padding={16} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="�� Tìm theo tên gói..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: 240, padding: "10px 14px",
              background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10,
              fontSize: 13.5, fontFamily: "inherit", color: "#0f172a", outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button onClick={() => setFilterService("all")} style={pill(filterService === "all", "#2563eb")}>
              Tất cả ({packages.length})
            </button>
            {services.map((s) => {
              const count = packages.filter((p) => p.serviceId === s.id).length;
              const meta = TYPE_META[s.type] || TYPE_META.vip;
              return (
                <button key={s.id} onClick={() => setFilterService(s.id)} style={pill(filterService === s.id, meta.color)}>
                  {meta.icon} {meta.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </AdminCard>

      {/* GRID */}
      {loading ? (
        <AdminCard padding={60}>
          <div style={{ textAlign: "center", color: "#64748b" }}>Đang tải...</div>
        </AdminCard>
      ) : filtered.length === 0 ? (
        <AdminCard padding={60}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎁</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>
              {search || filterService !== "all" ? "Không tìm thấy gói nào" : "Chưa có gói nào"}
            </div>
            <AdminButton variant="primary" onClick={openCreate}>+ Thêm gói đầu tiên</AdminButton>
          </div>
        </AdminCard>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {filtered.map((p) => {
            const svcType = p.service?.type || "vip";
            const meta = TYPE_META[svcType] || TYPE_META.vip;
            const discount = p.originalPrice && p.originalPrice > p.price
              ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
              : 0;
            const features = parseFeatures(p.features);

            return (
              <div key={p.id} style={{
                background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14,
                padding: 16, transition: "all .2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{
                    padding: "3px 8px", borderRadius: 6,
                    background: `${meta.color}15`, color: meta.color,
                    fontSize: 10, fontWeight: 800,
                  }}>
                    {meta.icon} {p.service?.name || meta.label}
                  </span>
                  {p.isPopular && <AdminBadge variant="warning">🔥 HOT</AdminBadge>}
                </div>

                <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 8, lineHeight: 1.3 }}>
                  {p.name}
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: "#2563eb" }}>{fmt(p.price)}</span>
                  {p.originalPrice && p.originalPrice > p.price && (
                    <span style={{ fontSize: 12.5, color: "#94a3b8", textDecoration: "line-through" }}>
                      {fmt(p.originalPrice)}
                    </span>
                  )}
                  {discount > 0 && (
                    <span style={{ padding: "2px 6px", background: "#fee2e2", color: "#dc2626", borderRadius: 4, fontSize: 10, fontWeight: 800 }}>
                      -{discount}%
                    </span>
                  )}
                </div>

                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
                  ⏱ {p.duration || "—"}
                </div>

                {/* FEATURES PREVIEW */}
                {features.length > 0 && (
                  <div style={{ fontSize: 11.5, color: "#475569", marginBottom: 12, paddingTop: 10, borderTop: "1px dashed #e2e8f0" }}>
                    <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4, fontSize: 11 }}>
                      ✓ Tính năng ({features.length})
                    </div>
                    {features.slice(0, 3).map((f, i) => (
                      <div key={i} style={{ display: "flex", gap: 4, marginBottom: 2 }}>
                        <span style={{ color: "#10b981" }}>•</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f}</span>
                      </div>
                    ))}
                    {features.length > 3 && (
                      <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 2 }}>
                        +{features.length - 3} tính năng khác
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", gap: 6, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                  <AdminButton variant="outline" size="sm" style={{ flex: 1 }} onClick={() => openEdit(p)}>
                    ✏️ Sửa
                  </AdminButton>
                  <AdminButton variant="danger" size="sm" onClick={() => handleDelete(p)}>
                    🗑️
                  </AdminButton>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div
          onClick={() => !submitting && setShowModal(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.7)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", zIndex: 9999, padding: 20 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 20, maxWidth: 560, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 30px 80px rgba(0,0,0,.4)" }}
          >
            <div style={{ padding: 20, background: "linear-gradient(135deg, #eff6ff, #dbeafe)", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: "#0f172a" }}>
                {editing ? "✏️ Sửa gói" : "➕ Thêm gói mới"}
              </div>
            </div>

            <div style={{ padding: 20 }}>
              <Field label="Dịch vụ *">
                <select value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })} style={input}>
                  <option value="">— Chọn dịch vụ —</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Tên gói *">
                <input
                  type="text"
                  placeholder="VD: 1 tài khoản (Quay 3s) — 79k"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={input}
                />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Giá bán *">
                  <input type="number" placeholder="79000" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={input} />
                </Field>
                <Field label="Giá gốc">
                  <input type="number" placeholder="150000" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} style={input} />
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Thời hạn">
                  <input type="text" placeholder="1 tháng" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} style={input} />
                </Field>
                <Field label="Thứ tự">
                  <input type="number" placeholder="0" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} style={input} />
                </Field>
              </div>

              {/* FEATURES EDITOR */}
              <Field label="Tính năng của gói">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {form.features.map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 6 }}>
                      <input
                        type="text"
                        placeholder={`VD: Mở khóa Locket Gold ${i + 1} năm`}
                        value={f}
                        onChange={(e) => updateFeature(i, e.target.value)}
                        style={{ ...input, marginBottom: 0, flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(i)}
                        disabled={form.features.length <= 1}
                        style={{
                          padding: "0 12px", background: form.features.length <= 1 ? "#f1f5f9" : "#fef2f2",
                          color: form.features.length <= 1 ? "#cbd5e1" : "#dc2626",
                          border: "1px solid", borderColor: form.features.length <= 1 ? "#e2e8f0" : "#fecaca",
                          borderRadius: 10, cursor: form.features.length <= 1 ? "not-allowed" : "pointer",
                          fontSize: 14, fontFamily: "inherit", fontWeight: 700,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    style={{
                      padding: "10px", background: "#f0fdf4", color: "#059669",
                      border: "1px dashed #86efac", borderRadius: 10,
                      cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13,
                    }}
                  >
                    + Thêm tính năng
                  </button>
                </div>
              </Field>

              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "#475569" }}>
                <input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({ ...form, isPopular: e.target.checked })} style={{ width: 16, height: 16, accentColor: "#2563eb" }} />
                🔥 Đánh dấu phổ biến
              </label>
            </div>

            <div style={{ padding: 16, borderTop: "1px solid #f1f5f9", display: "flex", gap: 10 }}>
              <AdminButton variant="secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)} disabled={submitting}>
                Hủy
              </AdminButton>
              <AdminButton variant="primary" style={{ flex: 1 }} onClick={handleSave} loading={submitting}>
                {editing ? "Cập nhật" : "Thêm gói"}
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const input: React.CSSProperties = {
  width: "100%", padding: "10px 14px", background: "#f8fafc",
  border: "1px solid #e2e8f0", borderRadius: 10,
  fontSize: 13.5, fontFamily: "inherit", color: "#0f172a",
  outline: "none", boxSizing: "border-box",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#475569", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function pill(active: boolean, color: string): React.CSSProperties {
  return {
    padding: "8px 14px", fontSize: 12.5, fontWeight: 700, fontFamily: "inherit",
    borderRadius: 8, border: "1px solid", borderColor: active ? color : "#e2e8f0",
    background: active ? `${color}15` : "#fff", color: active ? color : "#475569",
    cursor: "pointer",
  };
}
