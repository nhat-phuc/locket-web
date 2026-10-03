"use client";

import { useEffect, useState } from "react";

export default function AdminReferralPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/referral")
      .then((r) => r.json())
      .then((d) => { if (d.success) setUsers(d.users || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="aref-page">
      <div className="aref-container">
        <h1 className="aref-title">🔗 Mã giới thiệu</h1>
        <p className="aref-sub">{users.length} user có mã giới thiệu</p>

        {loading ? (
          <div className="aref-loading">Đang tải...</div>
        ) : (
          <div className="aref-list">
            {users.map((u) => (
              <div key={u.id} className="aref-row">
                <div>
                  <div className="aref-name">{u.name || u.username}</div>
                  <div className="aref-email">{u.email}</div>
                </div>
                <div className="aref-code">{u.referralCode || "—"}</div>
                <div className="aref-count">{u._count?.referredBy || 0} refs</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        .aref-page { min-height: 100vh; padding: 32px 20px 80px; background: var(--bg-0); }
        .aref-container { max-width: 900px; margin: 0 auto; }
        .aref-title { font-size: 26px; font-weight: 900; color: var(--text-0); margin: 0 0 4px; }
        .aref-sub { font-size: 13px; color: var(--text-2); margin: 0 0 20px; }
        .aref-loading { text-align: center; padding: 60px; color: var(--text-2); }
        .aref-list { display: flex; flex-direction: column; gap: 8px; }
        .aref-row { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 12px; align-items: center; padding: 14px 18px; border-radius: 12px; background: rgba(255,255,255,0.7); border: 1.5px solid rgba(167,139,250,0.15); }
        .aref-name { font-size: 13px; font-weight: 700; color: var(--text-0); }
        .aref-email { font-size: 11px; color: var(--text-2); }
        .aref-code { font-family: monospace; font-size: 13px; font-weight: 800; color: #a78bfa; }
        .aref-count { font-size: 13px; font-weight: 800; color: #22c55e; text-align: right; }
      `}</style>
    </main>
  );
}
