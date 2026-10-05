"use client";

import { useEffect, useRef, useState } from "react";

interface Locket {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  cover: string | null;
  badge: string | null;
  profileUrl: string | null;
  isAdmin?: boolean;
}

export default function LocketShowcase() {
  const [lockets, setLockets] = useState<Locket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadLockets = () => {
    fetch("/api/locket/list?limit=100")
      .then((r) => r.json())
      .then((d) => setLockets(d.profiles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLockets();

    // Check admin
    fetch("/api/users/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user?.role === "admin") {
          setIsAdmin(true);
        }
      })
      .catch(() => {});

    window.addEventListener("locket-added", loadLockets);
    return () => window.removeEventListener("locket-added", loadLockets);
  }, []);

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`Xóa Locket @${username}?`)) return;

    const res = await fetch("/api/locket/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();

    if (data.success) {
      setLockets((prev) => prev.filter((l) => l.id !== id));
    } else {
      alert(data.message || "Lỗi xóa");
    }
  };

  if (loading || lockets.length === 0) return null;

  const half = Math.ceil(lockets.length / 2);
  const row1 = lockets.slice(0, half);
  const row2 = lockets.slice(half);

  return (
    <section className="ls-section">
      <div className="ls-header">
        <div className="ls-hero-badge">
          <span className="ls-hero-badge-spark">🚀</span>
          <span>Nền tảng kết bạn Locket số 1 Việt Nam</span>
        </div>
        <h2 className="ls-title">
          Kết bạn <span className="ls-title-gradient">Locket</span>
        </h2>
        <p className="ls-sub">
          Khám phá {lockets.length} Locket mới nhất từ cộng đồng
        </p>
      </div>

      <Marquee items={row1} speed={0.5} isAdmin={isAdmin} onDelete={handleDelete} />
      {row2.length > 0 && (
        <Marquee items={row2} speed={0.5} isAdmin={isAdmin} onDelete={handleDelete} />
      )}
    </section>
  );
}

function Marquee({
  items,
  speed,
  isAdmin,
  onDelete,
}: {
  items: Locket[];
  speed: number;
  isAdmin: boolean;
  onDelete: (id: string, username: string) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const startAnim = () => {
      const animate = (time: number) => {
        const delta = lastTimeRef.current ? time - lastTimeRef.current : 0;
        lastTimeRef.current = time;
        const halfWidth = track.scrollWidth / 2;
        if (halfWidth > 0) {
          offsetRef.current -= speed * delta * 0.06;
          if (offsetRef.current <= -halfWidth) offsetRef.current += halfWidth;
          track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
        }
        rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
    };
    offsetRef.current = 0;
    lastTimeRef.current = 0;
    const t = setTimeout(startAnim, 100);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(rafRef.current);
    };
  }, [speed, items.length]);

  return (
    <div className="ls-marquee">
      <div className="ls-track" ref={trackRef}>
        {[...items, ...items].map((l, i) => (
          <Card key={`m-${i}`} l={l} isAdmin={isAdmin} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

function Card({
  l,
  isAdmin,
  onDelete,
}: {
  l: Locket;
  isAdmin: boolean;
  onDelete: (id: string, username: string) => void;
}) {
  return (
    <div className="ls-card-wrap">
      <a
        href={l.profileUrl || `https://locket.cam/${l.username}`}
        target="_blank"
        rel="noopener noreferrer"
        className="ls-card"
      >
        <div className="ls-cover" style={{ background: l.cover ? "#000" : `linear-gradient(135deg, hsl(${(l.username.charCodeAt(0) * 7) % 360}, 70%, 75%), hsl(${(l.username.charCodeAt(0) * 13) % 360}, 70%, 65%))` }}>
          {l.cover && <img src={l.cover} alt="" loading="lazy" />}
        </div>
        <div className="ls-avatar-wrap">
          {l.avatar ? (
            <img
              src={l.avatar}
              alt={l.username}
              className="ls-avatar"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(l.username)}&background=7c3aed&color=fff`;
              }}
            />
          ) : (
            <div className="ls-avatar-fallback">
              {l.username[0]?.toUpperCase()}
            </div>
          )}
          {l.badge && <span className="ls-badge">{l.badge}</span>}
        </div>
        <div className="ls-name">{l.displayName || l.username}</div>
        <div className="ls-username">@{l.username}</div>
      </a>

      {/* Nút xóa chỉ hiện cho admin */}
      {isAdmin && (
        <button
          className="ls-delete-btn"
          onClick={() => onDelete(l.id, l.username)}
          title="Xóa Locket"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      )}
    </div>
  );
}
