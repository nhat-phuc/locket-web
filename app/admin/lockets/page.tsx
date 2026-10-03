"use client";

import { useEffect, useState } from "react";

interface Locket {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  cover: string | null;
  badge: string | null;
  bio: string | null;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminLocketsPage() {
  const [lockets, setLockets] = useState<Locket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () => {
    fetch("/api/locket/list?limit=200")
      .then((r) => r.json())
      .then((d) => setLockets(d.profiles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`Xóa Locket @${username}?`)) return;
    const res = await fetch("/api/locket/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.success) {
      setLockets((p) => p.filter((l) => l.id !== id));
    } else {
      alert(data.message || "Không thể xóa Locket");
    }
  };

  const filtered = lockets.filter((l) =>
    search
      ? l.username.toLowerCase().includes(search.toLowerCase()) ||
        (l.displayName || "").toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <main className="al-page">
      <div className="al-container">
        <h1 className="al-title">🎀 Quản lý Locket</h1>
        <p className="al-sub">{lockets.length} Locket trong hệ thống</p>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Tìm username hoặc tên..."
          className="al-search"
        />

        {loading ? (
          <div className="al-loading">Đang tải...</div>
        ) : (
          <div className="al-grid">
            {filtered.map((l) => (
              <div key={l.id} className="al-card">
                {l.cover && <img src={l.cover} alt="" className="al-cover" />}
                <div className="al-avatar">
                  {l.avatar ? (
                    <img src={l.avatar} alt="" />
                  ) : (
                    <div className="al-avatar-fallback">
                      {l.username[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                {l.badge && <span className="al-badge">{l.badge}</span>}
                {l.isAdmin && <span className="al-admin-badge">✓</span>}
                <div className="al-name">{l.displayName || l.username}</div>
                <div className="al-username">@{l.username}</div>
                <button
                  className="al-delete"
                  onClick={() => handleDelete(l.id, l.username)}
                >
                  🗑 Xóa
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        .al-page { min-height: 100vh; padding: 32px 20px 80px; background: var(--bg-0); }
        .al-container { max-width: 1100px; margin: 0 auto; }
        .al-title { font-size: 26px; font-weight: 900; color: var(--text-0); margin: 0 0 4px; }
        .al-sub { font-size: 13px; color: var(--text-2); margin: 0 0 16px; }
        .al-search { width: 100%; padding: 12px 16px; border-radius: 12px; background: rgba(255,255,255,0.7); border: 1.5px solid rgba(167,139,250,0.2); color: var(--text-0); font-size: 13px; outline: none; margin-bottom: 20px; box-sizing: border-box; }
        .al-loading { text-align: center; padding: 60px; color: var(--text-2); }
        .al-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
        .al-card { position: relative; padding: 14px; border-radius: 16px; background: rgba(255,255,255,0.7); border: 1.5px solid rgba(167,139,250,0.2); text-align: center; overflow: hidden; }
        .al-cover { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.2; z-index: 0; }
        .al-card > *:not(.al-cover) { position: relative; z-index: 1; }
        .al-avatar { width: 56px; height: 56px; border-radius: 50%; overflow: hidden; margin: 0 auto 8px; border: 2px solid #a78bfa; }
        .al-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .al-avatar-fallback { width: 100%; height: 100%; background: linear-gradient(135deg,#7c3aed,#a78bfa); color: #fff; font-weight: 800; font-size: 22px; display: flex; align-items: center; justify-content: center; }
        .al-badge { position: absolute; top: 8px; right: 8px; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 999px; background: linear-gradient(135deg,#7c3aed,#a78bfa); color: #fff; }
        .al-admin-badge { position: absolute; top: 8px; left: 8px; font-size: 12px; color: #1d9bf0; }
        .al-name { font-size: 13px; font-weight: 800; color: var(--text-0); margin-top: 4px; }
        .al-username { font-size: 11px; color: var(--text-2); margin-bottom: 10px; }
        .al-delete { width: 100%; padding: 8px; border-radius: 8px; background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); font-size: 12px; font-weight: 700; cursor: pointer; }
        .al-delete:hover { background: rgba(239,68,68,0.2); }
      `}</style>
    </main>
  );
}
