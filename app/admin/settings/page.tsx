"use client";

import { useEffect, useState } from "react";
import AdminPage from "@/components/admin/AdminPage";

const FIELDS: { group: string; items: { key: string; label: string; placeholder?: string; type?: string; hint?: string }[] }[] = [
  {
    group: "🌐 Thông tin website",
    items: [
      { key: "site_name", label: "Tên website", placeholder: "Locket Gold" },
      { key: "site_description", label: "Mô tả ngắn", placeholder: "Dịch vụ Locket uy tín..." },
      { key: "site_logo", label: "URL Logo", placeholder: "https://..." },
      { key: "site_favicon", label: "URL Favicon", placeholder: "https://..." },
    ],
  },
  {
    group: "📞 Liên hệ",
    items: [
      { key: "contact_email", label: "Email liên hệ", placeholder: "support@locketgold.com", type: "email" },
      { key: "contact_phone", label: "Hotline", placeholder: "0123456789" },
      { key: "contact_facebook", label: "Facebook URL", placeholder: "https://facebook.com/..." },
      { key: "contact_zalo", label: "Zalo", placeholder: "https://zalo.me/..." },
    ],
  },
  {
    group: "🏦 Ngân hàng thanh toán",
    items: [
      { key: "bank_code", label: "Mã ngân hàng", placeholder: "BIDV / TPBANK / VCB...", hint: "VD: BIDV, TPBANK, VCB, MB..." },
      { key: "bank_account_number", label: "Số tài khoản", placeholder: "0123456789" },
      { key: "bank_account_name", label: "Chủ tài khoản", placeholder: "NGUYEN VAN A", hint: "IN HOA, không dấu" },
    ],
  },
  {
    group: "⚙️ Cấu hình hệ thống",
    items: [
      { key: "maintenance_mode", label: "Chế độ bảo trì", placeholder: "off", hint: "on = bật, off = tắt" },
      { key: "register_enabled", label: "Cho phép đăng ký", placeholder: "on", hint: "on / off" },
      { key: "recharge_min", label: "Nạp tối thiểu (VNĐ)", placeholder: "10000", type: "number" },
      { key: "order_expire_minutes", label: "Đơn hết hạn sau (phút)", placeholder: "15", type: "number" },
    ],
  },
];

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [original, setOriginal] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) { setValues(d.settings); setOriginal(d.settings); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const d = await res.json();
      if (d.success) {
        setOriginal(values);
        setMsg("✅ Đã lưu cài đặt thành công");
        setTimeout(() => setMsg(""), 3000);
      } else {
        setMsg("❌ " + (d.message || "Lỗi lưu"));
      }
    } catch {
      setMsg("❌ Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(values) !== JSON.stringify(original);

  return (
    <AdminPage
      title="Cài đặt hệ thống"
      description="Cấu hình thông tin website, ngân hàng, hệ thống"
      actions={
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="admin-btn"
          style={{
            background: hasChanges ? "linear-gradient(135deg, #7c3aed, #a78bfa)" : undefined,
            color: hasChanges ? "#fff" : undefined,
            borderColor: hasChanges ? "transparent" : undefined,
            fontWeight: 700,
            minWidth: 140,
          }}
        >
          {saving ? "Đang lưu..." : hasChanges ? "💾 Lưu thay đổi" : "Đã lưu"}
        </button>
      }
    >
      {msg && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            marginBottom: 20,
            fontSize: 14,
            fontWeight: 600,
            background: msg.startsWith("✅") ? "rgba(52,211,153,.12)" : "rgba(248,113,113,.12)",
            color: msg.startsWith("✅") ? "#34d399" : "#f87171",
            border: `1px solid ${msg.startsWith("✅") ? "rgba(52,211,153,.3)" : "rgba(248,113,113,.3)"}`,
          }}
        >
          {msg}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--text-2)" }}>Đang tải...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {FIELDS.map((group) => (
            <div
              key={group.group}
              style={{
                background: "var(--bg-1)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  marginBottom: 16,
                  color: "var(--text-0)",
                  paddingBottom: 12,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {group.group}
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 14,
                }}
              >
                {group.items.map((field) => (
                  <div key={field.key}>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--text-2)",
                        marginBottom: 6,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {field.label}
                    </label>
                    <input
                      type={field.type || "text"}
                      value={values[field.key] || ""}
                      onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        background: "var(--bg-0)",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        color: "var(--text-0)",
                        fontSize: 14,
                        fontFamily: "inherit",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    {field.hint && (
                      <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 4 }}>{field.hint}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPage>
  );
}
