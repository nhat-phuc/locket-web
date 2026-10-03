"use client";

import { useEffect, useState } from "react";

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/activity")
      .then((r) => r.json())
      .then((d) => { if (d.success) setLogs(d.logs || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="aac-page">
      <div className="aac-container">
        <h1 className="aac-title">📋 Lịch sử hoạt động</h1>
        <p className="aac-sub">Log hành động admin</p>

        {loading ? (
          <div className="aac-loading">Đang tải...</div>
        ) : (
          <div className="aac-list">
            {logs.map((l) => (
              <div key={l.id} className="aac-row">
                <div className="aac-icon">{l.action?.includes("delete") ? "🗑" : "📝"}</div>
                <div className="aac-content">
                  <div className="aac-msg">{l.message}</div>
                  <div className="aac-time">{new Date(l.createdAt).toLocaleString("vi-VN")}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        .aac-page { min-height: 100vh; padding: 32px 20px 80px; background: var(--bg-0); }
        .aac-container { max-width: 900px; margin: 0 auto; }
        .aac-title { font-size: 26px; font-weight: 900; color: var(--text-0); margin: 0 0 4px; }
        .aac-sub { font-size: 13px; color: var(--text-2); margin: 0 0 20px; }
        .aac-loading { text-align: center; padding: 60px; color: var(--text-2); }
        .aac-list { display: flex; flex-direction: column; gap: 8px; }
        .aac-row { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-radius: 12px; background: rgba(255,255,255,0.7); border: 1.5px solid rgba(167,139,250,0.15); }
        .aac-icon { font-size: 20px; }
        .aac-msg { font-size: 13px; font-weight: 700; color: var(--text-0); }
        .aac-time { font-size: 11px; color: var(--text-2); margin-top: 2px; }
      `}</style>
    </main>
  );
}
