"use client";

import { useEffect, useState } from "react";

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
  sortOrder: number;
}

interface Props {
  service: Service | null;
  onClose: () => void;
  onSaved: () => void;
}

const TYPES = [
  { value: "gold", label: "⭐ GOLD" },
  { value: "vip", label: "💜 VIP" },
  { value: "luxury", label: "💎 LUXURY" },
  { value: "adr", label: "📱 ANDROID" },
  { value: "agent", label: "🤝 ĐẠI LÝ" },
];

const PLATFORMS = [
  { value: "ios", label: "🍎 iOS" },
  { value: "android", label: "🤖 Android" },
  { value: "both", label: "🌐 Cả hai" },
];

export default function ServiceModal({ service, onClose, onSaved }: Props) {
  const isEdit = !!service;
  const [form, setForm] = useState({
    name: service?.name || "",
    slug: service?.slug || "",
    description: service?.description || "",
    type: service?.type || "gold",
    platform: service?.platform || "ios",
    price: service?.price?.toString() || "",
    originalPrice: service?.originalPrice?.toString() || "",
    discount: service?.discount?.toString() || "",
    duration: service?.duration || "Vĩnh viễn",
    features: (() => {
      if (!service?.features) return "";
      try { return (JSON.parse(service.features) as string[]).join("\n"); }
      catch { return service.features; }
    })(),
    image: service?.image || "",
    badge: service?.badge || "",
    badgeColor: service?.badgeColor || "#a78bfa",
    isActive: service?.isActive ?? true,
    isFeatured: service?.isFeatured ?? false,
    stock: service?.stock?.toString() || "",
    sortOrder: service?.sortOrder?.toString() || "0",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const autoSlug = () => {
    const s = form.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    update("slug", s);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Vui lòng nhập tên gói");
    if (!form.slug.trim()) return setError("Vui lòng nhập slug");
    if (!form.price || isNaN(parseInt(form.price))) return setError("Giá không hợp lệ");

    setSaving(true);
    const payload = {
      ...form,
      price: parseInt(form.price),
      originalPrice: form.originalPrice ? parseInt(form.originalPrice) : null,
      discount: form.discount ? parseInt(form.discount) : null,
      stock: form.stock ? parseInt(form.stock) : null,
      sortOrder: form.sortOrder ? parseInt(form.sortOrder) : 0,
      features: form.features.split("\n").map((s) => s.trim()).filter(Boolean),
    };

    try {
      const url = isEdit ? `/api/admin/services/${service!.id}` : "/api/admin/services";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) onSaved();
      else setError(data.message || "Lỗi không xác định");
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        .sm-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,.7); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px; animation: smFade .25s; overflow-y: auto;
        }
        @keyframes smFade { from { opacity: 0; } to { opacity: 1; } }
        .sm-modal {
          width: 100%; max-width: 720px;
          background: linear-gradient(180deg, #14142a, #0f0f1f);
          border: 1px solid rgba(167,139,250,.2);
          border-radius: 20px;
          box-shadow: 0 30px 80px rgba(0,0,0,.7);
          animation: smIn .35s cubic-bezier(.2,.7,.2,1);
          max-height: 90vh;
          display: flex; flex-direction: column;
        }
        @keyframes smIn { from { opacity: 0; transform: translateY(20px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .sm-header {
          padding: 22px 26px;
          border-bottom: 1px solid rgba(167,139,250,.12);
          display: flex; justify-content: space-between; align-items: center;
        }
        .sm-title { font-size: 19px; font-weight: 900; color: #f5f5ff; }
        .sm-close {
          width: 34px; height: 34px; border-radius: 10px;
          background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
          color: #c7c5db; font-size: 18px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .sm-close:hover { background: rgba(239,68,68,.2); color: #f87171; }
        .sm-body { flex: 1; overflow-y: auto; padding: 24px 26px; }
        .sm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .sm-field { display: flex; flex-direction: column; gap: 6px; }
        .sm-field.full { grid-column: 1 / -1; }
        .sm-label { font-size: 12px; font-weight: 700; color: #c7c5db; text-transform: uppercase; letter-spacing: .5px; }
        .sm-input, .sm-select, .sm-textarea {
          padding: 11px 14px; border-radius: 10px;
          background: rgba(0,0,0,.3); border: 1px solid rgba(167,139,250,.15);
          color: #f5f5ff; font-size: 13.5px; font-family: inherit;
          outline: none; transition: all .2s;
        }
        .sm-input:focus, .sm-select:focus, .sm-textarea:focus {
          border-color: #a78bfa; box-shadow: 0 0 0 3px rgba(167,139,250,.1);
        }
        .sm-textarea { resize: vertical; min-height: 100px; }
        .sm-hint { font-size: 11px; color: #8b88a8; }
        .sm-checkbox-row { display: flex; gap: 20px; margin: 8px 0 16px; }
        .sm-checkbox {
          display: flex; align-items: center; gap: 8px;
          font-size: 13.5px; color: #c7c5db; cursor: pointer;
        }
        .sm-checkbox input { width: 18px; height: 18px; accent-color: #a78bfa; cursor: pointer; }
        .sm-error {
          background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3);
          color: #f87171; padding: 12px 16px; border-radius: 10px;
          font-size: 13px; font-weight: 600; margin-bottom: 16px;
        }
        .sm-footer {
          padding: 18px 26px; border-top: 1px solid rgba(167,139,250,.12);
          display: flex; gap: 10px; justify-content: flex-end;
        }
        .sm-btn {
          padding: 12px 24px; border-radius: 10px;
          font-size: 13.5px; font-weight: 800; cursor: pointer;
          border: none; font-family: inherit; transition: all .2s;
        }
        .sm-btn.cancel { background: rgba(255,255,255,.06); color: #c7c5db; border: 1px solid rgba(255,255,255,.1); }
        .sm-btn.cancel:hover { background: rgba(255,255,255,.1); }
        .sm-btn.save {
          background: linear-gradient(135deg, #a78bfa, #7c3aed); color: #fff;
          box-shadow: 0 8px 24px rgba(124,58,237,.4);
        }
        .sm-btn.save:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(124,58,237,.6); }
        .sm-btn.save:disabled { opacity: .6; cursor: not-allowed; }
        @media (max-width: 640px) {
          .sm-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="sm-overlay" onClick={onClose}>
        <form className="sm-modal" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
          <div className="sm-header">
            <div className="sm-title">{isEdit ? "✏️ Sửa gói dịch vụ" : "➕ Thêm gói mới"}</div>
            <button type="button" className="sm-close" onClick={onClose}>✕</button>
          </div>

          <div className="sm-body">
            {error && <div className="sm-error">❌ {error}</div>}

            <div className="sm-row">
              <div className="sm-field">
                <label className="sm-label">Tên gói *</label>
                <input
                  className="sm-input"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="VD: Gói VIP 1"
                  required
                />
              </div>
              <div className="sm-field">
                <label className="sm-label">Slug *</label>
                <input
                  className="sm-input"
                  value={form.slug}
                  onChange={(e) => update("slug", e.target.value)}
                  placeholder="VD: vip-1"
                  required
                />
                <button type="button" onClick={autoSlug} style={{ textAlign: "left", background: "none", border: "none", cursor: "pointer", color: "#a78bfa", padding: 0, fontSize: 11 }}>
                  → Tự tạo từ tên
                </button>
              </div>
            </div>

            <div className="sm-field full" style={{ marginBottom: 16 }}>
              <label className="sm-label">Mô tả</label>
              <textarea
                className="sm-textarea"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Mô tả ngắn về gói..."
                style={{ minHeight: 70 }}
              />
            </div>

            <div className="sm-row">
              <div className="sm-field">
                <label className="sm-label">Loại *</label>
                <select className="sm-select" value={form.type} onChange={(e) => update("type", e.target.value)}>
                  {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="sm-field">
                <label className="sm-label">Nền tảng *</label>
                <select className="sm-select" value={form.platform} onChange={(e) => update("platform", e.target.value)}>
                  {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>

            <div className="sm-row">
              <div className="sm-field">
                <label className="sm-label">Giá (VNĐ) *</label>
                <input
                  className="sm-input"
                  type="number"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  placeholder="79000"
                  required
                />
              </div>
              <div className="sm-field">
                <label className="sm-label">Giá gốc (VNĐ)</label>
                <input
                  className="sm-input"
                  type="number"
                  value={form.originalPrice}
                  onChange={(e) => update("originalPrice", e.target.value)}
                  placeholder="120000"
                />
              </div>
            </div>

            <div className="sm-row">
              <div className="sm-field">
                <label className="sm-label">Thời hạn</label>
                <input
                  className="sm-input"
                  value={form.duration}
                  onChange={(e) => update("duration", e.target.value)}
                  placeholder="VD: Vĩnh viễn"
                />
              </div>
              <div className="sm-field">
                <label className="sm-label">Số lượng kho</label>
                <input
                  className="sm-input"
                  type="number"
                  value={form.stock}
                  onChange={(e) => update("stock", e.target.value)}
                  placeholder="Để trống = không giới hạn"
                />
              </div>
            </div>

            <div className="sm-field full" style={{ marginBottom: 16 }}>
              <label className="sm-label">Tính năng (mỗi dòng 1 tính năng)</label>
              <textarea
                className="sm-textarea"
                value={form.features}
                onChange={(e) => update("features", e.target.value)}
                placeholder={"Mở khóa toàn bộ tính năng Gold\nQuay video 3 giây\nUpload ảnh từ thư viện"}
              />
            </div>

            <div className="sm-row">
              <div className="sm-field">
                <label className="sm-label">Badge (nhãn)</label>
                <input
                  className="sm-input"
                  value={form.badge}
                  onChange={(e) => update("badge", e.target.value)}
                  placeholder="VD: HOT, BEST, PREMIUM"
                />
              </div>
              <div className="sm-field">
                <label className="sm-label">Màu badge</label>
                <input
                  className="sm-input"
                  value={form.badgeColor}
                  onChange={(e) => update("badgeColor", e.target.value)}
                  placeholder="#a78bfa"
                />
              </div>
            </div>

            <div className="sm-row">
              <div className="sm-field">
                <label className="sm-label">Ảnh (URL)</label>
                <input
                  className="sm-input"
                  value={form.image}
                  onChange={(e) => update("image", e.target.value)}
                  placeholder="/img/logo/icon.jpg"
                />
              </div>
              <div className="sm-field">
                <label className="sm-label">Thứ tự sắp xếp</label>
                <input
                  className="sm-input"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => update("sortOrder", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="sm-checkbox-row">
              <label className="sm-checkbox">
                <input type="checkbox" checked={form.isActive} onChange={(e) => update("isActive", e.target.checked)} />
                <span>Kích hoạt (hiển thị)</span>
              </label>
              <label className="sm-checkbox">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => update("isFeatured", e.target.checked)} />
                <span>⭐ Nổi bật</span>
              </label>
            </div>
          </div>

          <div className="sm-footer">
            <button type="button" className="sm-btn cancel" onClick={onClose}>Hủy</button>
            <button type="submit" className="sm-btn save" disabled={saving}>
              {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm gói"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
