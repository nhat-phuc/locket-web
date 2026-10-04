"use client";
import { useEffect, useState } from "react";
import AdminPage from "@/components/admin/AdminPage";
export default function Page() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  useEffect(() => {
    fetch("/api/admin/logs").then(r => r.json()).then(d => { if (d.success) setLogs(d.logs); }).finally(() => setLoading(false));
  }, []);
  const filtered = logs.filter(l => !q || (l.action + (l.detail || "")).toLowerCase().includes(q.toLowerCase()));
  return (
    <AdminPage title="Logs hệ thống" description="Lịch sử hoạt động toàn hệ thống">
      <input className="admin-filter" style={{ width: "100%", marginBottom: 20 }} placeholder="🔍 Tìm theo action hoặc nội dung..." value={q} onChange={e => setQ(e.target.value)} />
      {loading ? <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div> : (
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map(l => (
            <div key={l.id} style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <b style={{ color: "var(--accent-bright)", fontSize: 13 }}>{l.action}</b>
                <span style={{ fontSize: 12, color: "var(--text-2)" }}>{new Date(l.createdAt).toLocaleString("vi-VN")}</span>
              </div>
              {l.detail && <div style={{ fontSize: 13, color: "var(--text-1)" }}>{l.detail}</div>}
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "var(--text-2)" }}>Không có log nào</div>}
        </div>
      )}
    </AdminPage>
  );
}
