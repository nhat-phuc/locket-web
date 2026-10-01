"use client";

import { useEffect, useState } from "react";

interface Settings {
  logo_url?: string;
  icon_url?: string;
  banner_url?: string;
}

export default function LogoIconPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: string; msg: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => { if (d.success) setSettings(d.settings); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async (key: string, value: string) => {
    setSaving(key);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ type: "success", msg: `Đã lưu ${key}` });
        setSettings((s) => ({ ...s, [key]: value }));
      } else {
        setToast({ type: "error", msg: data.message || "Lưu thất bại" });
      }
    } catch {
      setToast({ type: "error", msg: "Lỗi kết nối" });
    } finally {
      setSaving(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const items = [
    { key: "logo_url", label: "Logo chính", desc: "Hiển thị trên Header + Footer", icon: "🖼️", default: "/img/logo/icon.jpg" },
    { key: "icon_url", label: "Favicon", desc: "Icon nhỏ trên tab trình duyệt", icon: "⭐", default: "/favicon.ico" },
    { key: "banner_url", label: "Banner trang chủ", desc: "Ảnh lớn ở Hero section", icon: "🎨", default: "/img/banner.png" },
  ];

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "var(--text-2)" }}>Đang tải...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6, color: "var(--text-0)" }}>
          🎨 Logo & Icon
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: 14 }}>
          Thay đổi logo, favicon và banner của website
        </p>
      </div>

      {toast && (
        <div style={{
          padding: 14, borderRadius: 12, marginBottom: 20, fontSize: 13.5, fontWeight: 600,
          background: toast.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
          border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
          color: toast.type === "success" ? "#10b981" : "#ef4444",
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: "grid", gap: 20 }}>
        {items.map((item) => {
          const current = settings[item.key as keyof Settings] || item.default;
          return (
            <div key={item.key} style={{
              background: "var(--bg-1)", border: "1px solid var(--border)",
              borderRadius: 16, padding: 24,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, display: "grid", placeItems: "center",
                  background: "rgba(167,139,250,0.12)", borderRadius: 12, fontSize: 22,
                }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-0)" }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-2)" }}>{item.desc}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 12, overflow: "hidden",
                  background: "var(--bg-2)", border: "1px solid var(--border)",
                  display: "grid", placeItems: "center",
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={current} alt={item.label} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </div>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <input
                    type="text"
                    value={settings[item.key as keyof Settings] || ""}
                    onChange={(e) => setSettings((s) => ({ ...s, [item.key]: e.target.value }))}
                    placeholder={`URL hoặc upload file (mặc định: ${item.default})`}
                    style={{
                      width: "100%", padding: "12px 14px",
                      background: "var(--bg-2)", border: "1.5px solid var(--border)",
                      borderRadius: 10, color: "var(--text-0)", fontSize: 13.5,
                      fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>

                <button
                  onClick={() => save(item.key, settings[item.key as keyof Settings] || "")}
                  disabled={saving === item.key}
                  style={{
                    padding: "12px 24px", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg, #a78bfa, #ec4899)",
                    color: "#fff", fontWeight: 800, fontSize: 13.5,
                    cursor: saving === item.key ? "not-allowed" : "pointer",
                    opacity: saving === item.key ? 0.6 : 1,
                    fontFamily: "inherit",
                  }}
                >
                  {saving === item.key ? "Đang lưu..." : "💾 Lưu"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
