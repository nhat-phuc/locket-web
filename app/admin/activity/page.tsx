"use client";
import { useEffect, useState } from "react";
import AdminPage from "@/components/admin/AdminPage";
export default function Page() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/admin/logs?take=200").then(r => r.json()).then(d => { if (d.success) setLogs(d.logs); }).finally(() => setLoading(false));
  }, []);
  return (
    <AdminPage title="Hoạt động" description="Lịch sử hoạt động người dùng">
      {loading ? <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div> : (
        <div style={{ display: "grid", gap: 8 }}>
          {logs.map(l => (
            <div key={l.id} style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20 }}>📌</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{l.action}</div>
                {l.detail && <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>{l.detail}</div>}
                <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 4 }}>{new Date(l.createdAt).toLocaleString("vi-VN")}</div>
              </div>
            </div>
          ))}
          {logs.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "var(--text-2)" }}>Không có hoạt động</div>}
        </div>
      )}
    </AdminPage>
  );
}
