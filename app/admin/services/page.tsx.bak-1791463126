"use client";

import { useEffect, useState } from "react";
import AdminPage from "@/components/admin/AdminPage";
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

const typeColors: Record<string, { color: string; bg: string }> = {
  gold:    { color: "#fbbf24", bg: "rgba(251,191,36,.15)" },
  vip:     { color: "#a78bfa", bg: "rgba(167,139,250,.15)" },
  luxury:  { color: "#f472b6", bg: "rgba(244,114,182,.15)" },
  adr:     { color: "#4ade80", bg: "rgba(74,222,128,.15)" },
  agent:   { color: "#fb923c", bg: "rgba(251,146,60,.15)" },
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [search, setSearch] = useState("");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services");
      const d = await res.json();
      if (d.success) setServices(d.services);
      else showToast(d.message || "Không tải được", "error");
    } catch {
      showToast("Lỗi kết nối", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadServices(); }, []);

  const handleDelete = async (s: Service) => {
    if (!confirm(`Xóa gói "${s.name}"? Hành động không thể hoàn tác.`)) return;
    try {
      const res = await fetch(`/api/admin/services/${s.id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        showToast(`Đã xóa "${s.name}"`);
        loadServices();
      } else {
        showToast(d.message || "Không xóa được", "error");
      }
    } catch {
      showToast("Lỗi kết nối", "error");
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
        showToast(s.isActive ? "Đã tắt gói" : "Đã bật gói");
        loadServices();
      }
    } catch {
      showToast("Lỗi", "error");
    }
  };

  const filtered = services.filter((s) =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        .sv-toolbar {
          display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;
          padding: 16px; background: rgba(255,255,255,.02);
          border: 1px solid rgba(167,139,250,.12); border-radius: 16px;
        }
        .sv-search {
          flex: 1; min-width: 220px;
          padding: 11px 16px; border-radius: 10px;
          background: rgba(0,0,0,.3); border: 1px solid rgba(167,139,250,.15);
          color: var(--text-0); font-size: 13.5px; font-family: inherit;
          outline: none; transition: all .2s;
        }
        .sv-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(167,139,250,.1); }
        .sv-add-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 22px; border-radius: 12px;
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          color: #fff; font-weight: 800; font-size: 13.5px;
          border: none; cursor: pointer; font-family: inherit;
          box-shadow: 0 8px 24px rgba(124,58,237,.4);
          transition: all .25s cubic-bezier(.2,.7,.2,1);
        }
        .sv-add-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(124,58,237,.6); }

        .sv-badge {
          display: inline-block; padding: 4px 10px; border-radius: 8px;
          font-size: 10.5px; font-weight: 800; letter-spacing: .5px;
        }
        .sv-btn {
          padding: 7px 12px; border-radius: 8px; font-size: 12px; font-weight: 700;
          border: 1px solid rgba(167,139,250,.25); background: rgba(167,139,250,.08);
          color: #c4b5fd; cursor: pointer; transition: all .2s; font-family: inherit;
        }
        .sv-btn:hover { background: rgba(167,139,250,.2); transform: translateY(-1px); }
        .sv-btn.danger { border-color: rgba(248,113,113,.3); background: rgba(248,113,113,.08); color: #f87171; }
        .sv-btn.danger:hover { background: rgba(248,113,113,.18); }

        .sv-toggle {
          width: 40px; height: 22px; border-radius: 11px;
          background: rgba(107,104,133,.4); border: none; cursor: pointer;
          position: relative; transition: background .25s;
        }
        .sv-toggle.on { background: linear-gradient(135deg, #4ade80, #22c55e); }
        .sv-toggle::after {
          content: ""; position: absolute; top: 2px; left: 2px;
          width: 18px; height: 18px; border-radius: 50%; background: #fff;
          transition: transform .25s;
        }
        .sv-toggle.on::after { transform: translateX(18px); }

        .sv-toast {
          position: fixed; bottom: 24px; right: 24px; z-index: 9999;
          padding: 14px 22px; border-radius: 12px;
          font-size: 13.5px; font-weight: 700;
          box-shadow: 0 12px 40px rgba(0,0,0,.4);
          animation: svToastIn .35s cubic-bezier(.2,.7,.2,1);
        }
        .sv-toast.success { background: rgba(34,197,94,.95); color: #fff; }
        .sv-toast.error { background: rgba(239,68,68,.95); color: #fff; }
        @keyframes svToastIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .sv-img {
          width: 44px; height: 44px; border-radius: 10px;
          background: rgba(167,139,250,.1);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; overflow: hidden;
        }
        .sv-img img { width: 100%; height: 100%; object-fit: cover; }
      `}</style>

      <AdminPage
        title="Dịch vụ"
        description="Quản lý các gói dịch vụ Locket Gold"
        actions={
          <button className="sv-add-btn" onClick={() => { setEditing(null); setModalOpen(true); }}>
            ➕ Thêm gói mới
          </button>
        }
      >
        <div className="sv-toolbar">
          <input
            className="sv-search"
            placeholder="🔍 Tìm theo tên hoặc slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên / Slug</th>
                <th>Loại</th>
                <th>Giá</th>
                <th>Đã bán</th>
                <th>Kích hoạt</th>
                <th style={{ textAlign: "right" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--text-2)" }}>Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--text-2)" }}>Chưa có dịch vụ nào</td></tr>
              ) : (
                filtered.map((s) => {
                  const meta = typeColors[s.type] || typeColors.vip;
                  return (
                    <tr key={s.id}>
                      <td>
                        <div className="sv-img">
                          {s.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.image} alt={s.name} />
                          ) : "📦"}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, marginBottom: 2 }}>
                          {s.isFeatured && <span style={{ color: "#fbbf24", marginRight: 4 }}>⭐</span>}
                          {s.name}
                        </div>
                        <code style={{ fontSize: 11.5, color: "var(--text-2)" }}>/{s.slug}</code>
                      </td>
                      <td>
                        <span className="sv-badge" style={{ background: meta.bg, color: meta.color }}>
                          {s.type.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, color: "#4ade80" }}>{s.price.toLocaleString("vi-VN")}đ</div>
                        {s.originalPrice && (
                          <div style={{ fontSize: 11, color: "var(--text-2)", textDecoration: "line-through" }}>
                            {s.originalPrice.toLocaleString("vi-VN")}đ
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 700 }}>{s.sold.toLocaleString("vi-VN")}</td>
                      <td>
                        <button
                          className={`sv-toggle${s.isActive ? " on" : ""}`}
                          onClick={() => handleToggleActive(s)}
                          title={s.isActive ? "Đang bật" : "Đang tắt"}
                        />
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <button
                            className="sv-btn"
                            onClick={() => { setEditing(s); setModalOpen(true); }}
                          >
                            ✏️ Sửa
                          </button>
                          <button className="sv-btn danger" onClick={() => handleDelete(s)}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </AdminPage>

      {modalOpen && (
        <ServiceModal
          service={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            loadServices();
            showToast(editing ? "Đã cập nhật" : "Đã thêm gói mới");
          }}
        />
      )}

      {toast && (
        <div className={`sv-toast ${toast.type}`}>
          {toast.type === "success" ? "✅ " : "❌ "}{toast.msg}
        </div>
      )}
    </>
  );
}
