"use client";
import { useEffect, useState } from "react";
import AdminPage from "@/components/admin/AdminPage";
export default function Page() {
  const [settings, setSettings] = useState<Record<string,string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => { if (d.success) setSettings(d.settings); });
  }, []);
  const save = async () => {
    setSaving(true); setMsg("");
    try {
      const r = await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      const d = await r.json();
      setMsg(d.success ? "✅ Đã lưu" : "❌ " + d.message);
    } catch { setMsg("❌ Lỗi"); }
    finally { setSaving(false); }
  };
  const field = (key: string, label: string, hint?: string) => (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", marginBottom: 6 }}>{label}</label>
      <input className="admin-btn" style={{ width: "100%", textAlign: "left" }} value={settings[key] || ""} onChange={e => setSettings({ ...settings, [key]: e.target.value })} />
      {hint && <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
  return (
    <AdminPage title="Vòng quay may mắn" description="Cấu hình vòng quay và phần thưởng"
      actions={<button onClick={save} disabled={saving} className="admin-btn" style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff", fontWeight: 700, borderColor: "transparent" }}>{saving ? "Đang lưu..." : "💾 Lưu"}</button>}>
      {msg && <div style={{ padding: 12, borderRadius: 12, marginBottom: 16, background: msg.startsWith("✅") ? "rgba(52,211,153,.12)" : "rgba(248,113,113,.12)", color: msg.startsWith("✅") ? "#34d399" : "#f87171" }}>{msg}</div>}
      <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, display: "grid", gap: 14 }}>
        {field("wheel_enabled", "Bật vòng quay", "on = bật, off = tắt")}
        {field("wheel_daily_limit", "Giới hạn lượt/ngày", "VD: 3")}
        {field("wheel_min_reward", "Phần thưởng tối thiểu (đ)", "VD: 1000")}
        {field("wheel_max_reward", "Phần thưởng tối đa (đ)", "VD: 50000")}
        {field("wheel_win_rate", "Tỉ lệ trúng (%)", "VD: 30")}
      </div>
    </AdminPage>
  );
}
