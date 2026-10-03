"use client";

import { useEffect, useState } from "react";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((r) => r.json())
      .then((d) => { if (d.success) setReports(d.reports || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="arp-page">
      <div className="arp-container">
        <h1 className="arp-title">🚨 Báo cáo vi phạm</h1>
        <p className="arp-sub">{reports.length} báo cáo</p>

        {loading ? (
          <div className="arp-loading">Đang tải...</div>
        ) : reports.length === 0 ? (
          <div className="arp-empty">Không có báo cáo nào</div>
        ) : (
          <div className="arp-list">
            {reports.map((r) => (
              <div key={r.id} className="arp-row">
                <div>
                  <div className="arp-type">{r.type}</div>
                  <div className="arp-content">{r.content}</div>
                </div>
                <div className="arp-status">{r.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        .arp-page { min-height: 100vh; padding: 32px 20px 80px; background: var(--bg-0); }
        .arp-container { max-width: 900px; margin: 0 auto; }
        .arp-title { font-size: 26px; font-weight: 900; color: var(--text-0); margin: 0 0 4px; }
        .arp-sub { font-size: 13px; color: var(--text-2); margin: 0 0 20px; }
        .arp-loading, .arp-empty { text-align: center; padding: 60px; color: var(--text-2); }
        .arp-list { display: flex; flex-direction: column; gap: 10px; }
        .arp-row { display: flex; justify-content: space-between; padding: 16px; border-radius: 14px; background: rgba(255,255,255,0.7); border: 1.5px solid rgba(167,139,250,0.2); }
        .arp-type { font-size: 13px; font-weight: 800; color: #ef4444; }
        .arp-content { font-size: 12px; color: var(--text-1); margin-top: 4px; }
        .arp-status { padding: 4px 10px; border-radius: 999px; background: rgba(167,139,250,0.1); color: #a78bfa; font-size: 11px; font-weight: 700; }
      `}</style>
    </main>
  );
}
