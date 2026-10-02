"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LocketProfile {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  badge: string | null;
  profileUrl: string | null;
  createdAt: string;
}

export default function LocketShowcase() {
  const [profiles, setProfiles] = useState<LocketProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => {
      fetch("/api/locket/list?limit=12")
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setProfiles(d.profiles || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    };
    load();
    const interval = setInterval(load, 10000); // Refresh 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="ls-section">
        <div className="ls-header">
          <h2 className="ls-title">🌟 Locket Đã Thêm</h2>
          <p className="ls-subtitle">Danh sách Locket gần đây từ cộng đồng</p>
        </div>
        <div className="ls-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ls-card ls-skeleton" />
          ))}
        </div>
      </section>
    );
  }

  if (profiles.length === 0) {
    return (
      <section className="ls-section">
        <div className="ls-header">
          <h2 className="ls-title">🌟 Locket Đã Thêm</h2>
          <p className="ls-subtitle">Chưa có Locket nào. Hãy là người đầu tiên!</p>
        </div>
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link href="/add-locket" className="ls-btn">
            ➕ Thêm Locket ngay
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="ls-section">
      <div className="ls-header">
        <h2 className="ls-title">🌟 Locket Đã Thêm</h2>
        <p className="ls-subtitle">
          {profiles.length} Locket mới nhất từ cộng đồng
        </p>
      </div>

      <div className="ls-grid">
        {profiles.map((p, i) => (
          <a
            key={p.id}
            href={p.profileUrl || `https://locket.cam/${p.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ls-card"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="ls-avatar-wrap">
              {p.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.avatar}
                  alt={p.username}
                  referrerPolicy="no-referrer"
                  className="ls-avatar"
                  loading="lazy"
                />
              ) : (
                <div className="ls-avatar ls-avatar-fallback">
                  {(p.displayName || p.username).charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="ls-info">
              <div className="ls-name">
                {p.displayName || p.username}
              </div>
              <div className="ls-username">@{p.username}</div>
              {p.bio && <div className="ls-bio">{p.bio}</div>}
            </div>

            {p.badge && (
              <div className="ls-badge">{p.badge}</div>
            )}
          </a>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Link href="/add-locket" className="ls-btn">
          ➕ Thêm Locket của bạn
        </Link>
      </div>

      <style jsx>{`
        .ls-section {
          margin-top: 60px;
          width: 100%;
        }

        .ls-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .ls-title {
          font-size: clamp(20px, 4vw, 26px);
          font-weight: 900;
          color: var(--text-0);
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }
        .ls-subtitle {
          font-size: 14px;
          color: var(--text-2);
        }

        .ls-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }
        @media (max-width: 900px) {
          .ls-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .ls-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        }

        .ls-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 20px 14px;
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(20px);
          border: 1.5px solid var(--border);
          border-radius: 18px;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: lsFadeIn 0.5s ease both;
          overflow: hidden;
        }
        .ls-card:hover {
          transform: translateY(-4px);
          border-color: #a78bfa;
          box-shadow: 0 12px 32px rgba(124, 58, 237, 0.2);
        }

        @keyframes lsFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

                /* ═══ AVATAR viền tím đơn giản ═══ */
        .ls-avatar-wrap {
          width: 64px;
          height: 64px;
          min-width: 64px;
          min-height: 64px;
          max-width: 64px;
          max-height: 64px;
          flex-shrink: 0;
          border-radius: 50%;
          overflow: hidden;
          border: 2.5px solid #a78bfa;
          background: #1a1230;
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.2);
          transition: transform 0.3s;
        }
        .ls-card:hover .ls-avatar-wrap {
          transform: scale(1.05);
          box-shadow: 0 12px 32px rgba(124, 58, 237, 0.35);
        }

.ls-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .ls-avatar-fallback {
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: #fff;
          font-size: 26px;
          font-weight: 900;
        }

        .ls-info {
          text-align: center;
          min-width: 0;
          width: 100%;
        }
        .ls-name {
          font-size: 14px;
          font-weight: 800;
          color: var(--text-0);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 2px;
        }
        .ls-username {
          font-size: 12px;
          color: var(--text-2);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ls-bio {
          font-size: 11px;
          color: var(--text-2);
          margin-top: 6px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ls-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 3px 8px;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: #fff;
          font-size: 9.5px;
          font-weight: 900;
          border-radius: 999px;
          letter-spacing: 0.3px;
        }

        .ls-skeleton {
          height: 180px;
          background: rgba(167, 139, 250, 0.08);
          border: 1.5px dashed rgba(167, 139, 250, 0.2);
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .ls-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: #fff;
          text-decoration: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 800;
          transition: all 0.3s;
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
        }
        .ls-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(124, 58, 237, 0.45);
        }

        @media (max-width: 480px) {
          .ls-avatar-wrap {
            width: 60px;
            height: 60px;
            min-width: 60px;
            min-height: 60px;
            max-width: 60px;
            max-height: 60px;
          }
          .ls-avatar-fallback { font-size: 22px; }
          .ls-card { padding: 16px 10px; border-radius: 14px; }
          .ls-name { font-size: 13px; }
          .ls-username { font-size: 11px; }
        }
      `}</style>
    </section>
  );
}
