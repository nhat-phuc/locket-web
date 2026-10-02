"use client";

import { useEffect, useState } from "react";

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrder: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ type: string; msg: string } | null>(null);

  // Form
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/coupons", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setCoupons(d.coupons || []); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showToast = (type: string, msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setCode("");
    setDiscountType("percent");
    setDiscountValue("");
    setMinOrder("");
    setMaxDiscount("");
    setUsageLimit("");
    setExpiresAt("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code,
          discountType,
          discountValue: Number(discountValue),
          minOrder: Number(minOrder) || 0,
          maxDiscount: maxDiscount ? Number(maxDiscount) : null,
          usageLimit: usageLimit ? Number(usageLimit) : null,
          expiresAt: expiresAt || null,
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast("success", "Đã tạo mã " + code.toUpperCase());
        resetForm();
        setShowForm(false);
        load();
      } else {
        showToast("error", data.message || "Lỗi tạo mã");
      }
    } catch {
      showToast("error", "Lỗi kết nối");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: coupon.id, isActive: !coupon.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", coupon.isActive ? "Đã tắt mã" : "Đã bật mã");
        load();
      }
    } catch {
      showToast("error", "Lỗi kết nối");
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Xóa mã ${code}?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Đã xóa mã");
        load();
      }
    } catch {
      showToast("error", "Lỗi kết nối");
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast("success", `Đã copy ${code}`);
  };

  const filtered = coupons.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()));

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>🏷️ Mã Giảm Giá</h1>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>Quản lý mã giảm giá cho khách hàng</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "12px 22px",
            background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
            color: "#fff", border: "none", borderRadius: 12,
            fontSize: 14.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 8px 24px rgba(124,58,237,0.3)",
          }}
        >
          {showForm ? "✕ Đóng" : "+ Tạo mã mới"}
        </button>
      </div>

      {toast && (
        <div style={{
          padding: "12px 16px", borderRadius: 12, marginBottom: 16,
          background: toast.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
          border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
          color: toast.type === "success" ? "#10b981" : "#ef4444",
          fontWeight: 600,
        }}>
          {toast.msg}
        </div>
      )}

      {/* FORM */}
      {showForm && (
        <form onSubmit={handleCreate} style={{
          background: "var(--bg-1)", border: "1px solid var(--border)",
          borderRadius: 16, padding: 20, marginBottom: 20,
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 16 }}>Tạo mã giảm giá</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 13.5, fontWeight: 700, marginBottom: 6 }}>
                Mã code <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                placeholder="SALE10"
                required
                style={{ width: "100%", padding: "11px 14px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 15, fontWeight: 800, fontFamily: "monospace", color: "var(--text-0)", outline: "none", boxSizing: "border-box", letterSpacing: 1 }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13.5, fontWeight: 700, marginBottom: 6 }}>
                Loại giảm <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "percent" | "fixed")}
                style={{ width: "100%", padding: "11px 14px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14.5, fontWeight: 700, color: "var(--text-0)", outline: "none", boxSizing: "border-box" }}
              >
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13.5, fontWeight: 700, marginBottom: 6 }}>
                {discountType === "percent" ? "Giảm (%)" : "Giảm (VNĐ)"} <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percent" ? "10" : "50000"}
                required
                min="1"
                style={{ width: "100%", padding: "11px 14px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14.5, fontWeight: 700, color: "var(--text-0)", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13.5, fontWeight: 700, marginBottom: 6 }}>
                Đơn tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                placeholder="100000"
                min="0"
                style={{ width: "100%", padding: "11px 14px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14.5, fontWeight: 700, color: "var(--text-0)", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {discountType === "percent" && (
              <div>
                <label style={{ display: "block", fontSize: 13.5, fontWeight: 700, marginBottom: 6 }}>
                  Giảm tối đa (VNĐ)
                </label>
                <input
                  type="number"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  placeholder="50000"
                  min="0"
                  style={{ width: "100%", padding: "11px 14px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14.5, fontWeight: 700, color: "var(--text-0)", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: 13.5, fontWeight: 700, marginBottom: 6 }}>
                Giới hạn sử dụng
              </label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="100"
                min="1"
                style={{ width: "100%", padding: "11px 14px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14.5, fontWeight: 700, color: "var(--text-0)", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13.5, fontWeight: 700, marginBottom: 6 }}>
                Ngày hết hạn
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14.5, fontWeight: 700, color: "var(--text-0)", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button
              type="button"
              onClick={() => { resetForm(); setShowForm(false); }}
              style={{ flex: 1, padding: 13, borderRadius: 12, border: "1px solid var(--border)", background: "transparent", color: "var(--text-1)", fontWeight: 700, fontSize: 14.5, cursor: "pointer", fontFamily: "inherit" }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ flex: 2, padding: 13, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", fontWeight: 800, fontSize: 14.5, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: submitting ? 0.6 : 1, boxShadow: "0 8px 24px rgba(34,197,94,0.3)" }}
            >
              {submitting ? "Đang tạo..." : "✅ Tạo mã"}
            </button>
          </div>
        </form>
      )}

      {/* SEARCH */}
      <input
        type="text"
        placeholder="�� Tìm mã..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%", maxWidth: 400, padding: "12px 16px", borderRadius: 12,
          border: "1px solid var(--border)", background: "var(--bg-1)",
          color: "var(--text-0)", fontSize: 14.5, fontFamily: "inherit",
          outline: "none", marginBottom: 20, boxSizing: "border-box",
        }}
      />

      {/* LIST */}
      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--text-2)" }}>Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--text-2)", background: "var(--bg-1)", borderRadius: 16, border: "1px dashed var(--border)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏷️</div>
          <p style={{ fontSize: 15, fontWeight: 600 }}>Chưa có mã giảm giá nào</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {filtered.map((c) => (
            <div key={c.id} style={{
              background: "var(--bg-1)",
              border: c.isActive ? "1.5px solid rgba(167,139,250,0.3)" : "1.5px dashed var(--border)",
              borderRadius: 16, padding: 18,
              opacity: c.isActive ? 1 : 0.6,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    fontFamily: "monospace", fontSize: 20, fontWeight: 900,
                    color: "#7c3aed", letterSpacing: 2,
                  }}>
                    {c.code}
                  </div>
                  <button
                    onClick={() => handleCopy(c.code)}
                    title="Copy"
                    style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 14, padding: 0 }}
                  >
                    📋
                  </button>
                </div>
                <div style={{
                  padding: "3px 10px", borderRadius: 999,
                  fontSize: 10.5, fontWeight: 800,
                  background: c.isActive ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                  color: c.isActive ? "#10b981" : "#ef4444",
                }}>
                  {c.isActive ? "✓ Hoạt động" : "✕ Đã tắt"}
                </div>
              </div>

              <div style={{ fontSize: 26, fontWeight: 900, background: "linear-gradient(135deg, #a78bfa, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}>
                {c.discountType === "percent" ? `Giảm ${c.discountValue}%` : `Giảm ${fmt(c.discountValue)}`}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5, color: "var(--text-2)", marginBottom: 14 }}>
                {c.minOrder > 0 && <div>💰 Đơn tối thiểu: <b>{fmt(c.minOrder)}</b></div>}
                {c.maxDiscount && <div>🎯 Giảm tối đa: <b>{fmt(c.maxDiscount)}</b></div>}
                {c.usageLimit && <div>🔢 Số lần dùng: <b>{c.usedCount}/{c.usageLimit}</b></div>}
                {c.expiresAt && <div>📅 Hết hạn: <b>{new Date(c.expiresAt).toLocaleDateString("vi-VN")}</b></div>}
                <div>🕒 Tạo: {new Date(c.createdAt).toLocaleDateString("vi-VN")}</div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => handleToggle(c)}
                  style={{
                    flex: 1, padding: "9px", borderRadius: 10,
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: c.isActive ? "#f59e0b" : "#10b981",
                    fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  {c.isActive ? "⏸ Tắt" : "▶ Bật"}
                </button>
                <button
                  onClick={() => handleDelete(c.id, c.code)}
                  style={{
                    flex: 1, padding: "9px", borderRadius: 10,
                    border: "1px solid rgba(239,68,68,0.3)",
                    background: "rgba(239,68,68,0.1)",
                    color: "#ef4444",
                    fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
