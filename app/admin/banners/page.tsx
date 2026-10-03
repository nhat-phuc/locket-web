"use client";

import { useEffect, useState } from "react";
import AdminPage from "@/components/admin/AdminPage";

const IMAGE_FIELDS = [
  { key: "logo_url", label: "Ảnh Logo (Header)", fallback: "/img/logo/logo.jpg" },
  { key: "loader_url", label: "Ảnh Loading (mèo)", fallback: "/img/logo/logo.jpg" },
  { key: "home_banner_url", label: "Banner trang chủ", fallback: "/img/logo/banner.jpg" },
];

const POPUP_FIELDS = [
  { key: "popup_title", label: "Tiêu đề popup", placeholder: "Thông Báo", type: "text" },
  { key: "popup_content", label: "Nội dung popup", placeholder: "Nội dung...", type: "textarea" },
  { key: "popup_icon", label: "Icon (emoji)", placeholder: "🌟", type: "text" },
  { key: "popup_button", label: "Chữ nút chính", placeholder: "Đã hiểu", type: "text" },
  { key: "popup_close_hours", label: "Giờ không hiện lại (sau khi bấm nút phụ)", placeholder: "24", type: "number" },
];

export default function AdminBannersPage() {
  const [tab, setTab] = useState<"images" | "popup">("popup");
  const [values, setValues] = useState<Record<string, string>>({});
  const [popup, setPopup] = useState<Record<string, string>>({});
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch("/api/site-images").then((r) => r.json()),
        fetch("/api/site-popup").then((r) => r.json()),
      ]);
      if (r1.success) setValues(r1.images || {});
      if (r2.success) {
        setPopup(r2.popup || {});
        setEnabled(r2.popup?.popup_enabled === "true");
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (key: string, file: File) => {
    setUploading(key);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await r.json();
      if (d.success && d.url) {
        setValues((v) => ({ ...v, [key]: d.url }));
        setMsg("✅ Upload xong! Bấm Lưu để áp dụng");
      } else {
        setMsg("❌ " + (d.message || "Upload thất bại"));
      }
    } catch {
      setMsg("❌ Lỗi kết nối");
    }
    setUploading(null);
  };

  const saveImages = async () => {
    setSaving(true); setMsg("");
    try {
      for (const f of IMAGE_FIELDS) {
        if (values[f.key]) {
          await fetch("/api/admin/settings", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: f.key, value: values[f.key] }),
          });
        }
      }
      setMsg("✅ Đã lưu ảnh!");
    } catch { setMsg("❌ Lỗi khi lưu"); }
    setSaving(false);
  };

  const savePopup = async () => {
    setSaving(true); setMsg("");
    try {
      await fetch("/api/admin/settings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "popup_enabled", value: enabled ? "true" : "false" }),
      });
      for (const f of POPUP_FIELDS) {
        if (popup[f.key] !== undefined) {
          await fetch("/api/admin/settings", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: f.key, value: popup[f.key] }),
          });
        }
      }
      setMsg("✅ Đã lưu popup!");
    } catch { setMsg("❌ Lỗi khi lưu"); }
    setSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    background: "#fff",
    color: "#0f0a1e",
    fontFamily: "inherit",
  };

  return (
    <AdminPage title="Popup & Ảnh" description="Quản lý popup thông báo, logo, banner">
      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid #e2e8f0" }}>
        {[
          { k: "popup", label: "📢 Popup thông báo" },
          { k: "images", label: "🖼️ Ảnh (logo, banner)" },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => { setTab(t.k as any); setMsg(""); }}
            style={{
              padding: "12px 20px",
              background: "transparent",
              border: "none",
              borderBottom: tab === t.k ? "3px solid #7c3aed" : "3px solid transparent",
              color: tab === t.k ? "#7c3aed" : "#64748b",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8", padding: 40, textAlign: "center" }}>Đang tải...</p>
      ) : tab === "popup" ? (
        <div style={{ maxWidth: 720 }}>
          {/* Toggle bật/tắt */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: 16, background: "#faf5ff", border: "1px solid #e9d5ff",
            borderRadius: 14, marginBottom: 20,
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0f0a1e", marginBottom: 4 }}>
                Bật popup khi user vào trang
              </div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                Popup hiện lần đầu user vào web, có thể đóng
              </div>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              style={{
                width: 56, height: 32, borderRadius: 999,
                background: enabled ? "#7c3aed" : "#cbd5e1",
                border: "none", cursor: "pointer", position: "relative",
                transition: "all .2s",
              }}
            >
              <div style={{
                width: 24, height: 24, borderRadius: "50%", background: "#fff",
                position: "absolute", top: 4,
                left: enabled ? 28 : 4,
                transition: "all .2s",
                boxShadow: "0 2px 6px rgba(0,0,0,.2)",
              }} />
            </button>
          </div>

          {/* Fields */}
          {POPUP_FIELDS.map((f) => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                {f.label}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  value={popup[f.key] || ""}
                  onChange={(e) => setPopup((p) => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              ) : (
                <input
                  type={f.type}
                  value={popup[f.key] || ""}
                  onChange={(e) => setPopup((p) => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={inputStyle}
                />
              )}
            </div>
          ))}

          {msg && (
            <div style={{
              padding: 12, borderRadius: 10, marginBottom: 16, fontSize: 14,
              background: msg.startsWith("✅") ? "#f0fdf4" : "#fef2f2",
              color: msg.startsWith("✅") ? "#10b981" : "#dc2626",
            }}>{msg}</div>
          )}

          <button
            onClick={savePopup}
            disabled={saving}
            style={{
              padding: "14px 32px",
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              color: "#fff", border: "none", borderRadius: 12,
              fontSize: 15, fontWeight: 800,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1,
              boxShadow: "0 6px 20px rgba(124,58,237,.3)",
            }}
          >
            {saving ? "Đang lưu..." : "💾 Lưu popup"}
          </button>
        </div>
      ) : (
        <div style={{ maxWidth: 720 }}>
          {IMAGE_FIELDS.map((f) => {
            const currentUrl = values[f.key] || f.fallback;
            return (
              <div key={f.key} style={{
                background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16,
                padding: 20, marginBottom: 16, display: "flex", gap: 20, alignItems: "center",
              }}>
                <div style={{
                  width: 100, height: 100, borderRadius: 12, background: "#f8fafc",
                  border: "1px solid #e2e8f0", display: "flex", alignItems: "center",
                  justifyContent: "center", overflow: "hidden", flexShrink: 0,
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={currentUrl} alt={f.label} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8, color: "#0f0a1e" }}>{f.label}</div>
                  <input type="file" accept="image/*"
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(f.key, file); }}
                    disabled={uploading === f.key} style={{ marginBottom: 8, fontSize: 13 }} />
                  <input type="text" value={currentUrl}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    placeholder="URL ảnh" style={inputStyle} />
                  {uploading === f.key && <div style={{ fontSize: 12, color: "#7c3aed", marginTop: 6 }}>⏳ Đang upload...</div>}
                </div>
              </div>
            );
          })}

          {msg && (
            <div style={{
              padding: 12, borderRadius: 10, marginBottom: 16, fontSize: 14,
              background: msg.startsWith("✅") ? "#f0fdf4" : "#fef2f2",
              color: msg.startsWith("✅") ? "#10b981" : "#dc2626",
            }}>{msg}</div>
          )}

          <button onClick={saveImages} disabled={saving}
            style={{
              padding: "14px 32px", background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800,
              cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1,
              boxShadow: "0 6px 20px rgba(124,58,237,.3)",
            }}>
            {saving ? "Đang lưu..." : "💾 Lưu ảnh"}
          </button>
        </div>
      )}
    </AdminPage>
  );
}
