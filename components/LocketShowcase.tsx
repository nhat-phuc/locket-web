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

  useEffect(() => {
    const load = () => {
      fetch("/api/locket/list?limit=100")
        .then((r) => r.json())
        .then((d) => setLockets(d.profiles || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    };
    load();
    window.addEventListener("locket-added", load);
    return () => window.removeEventListener("locket-added", load);
  }, []);

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
        <h2 className="ls-title">Kết bạn <span className="ls-title-gradient">Locket</span></h2>
        <p className="ls-sub">Khám phá {lockets.length} Locket mới nhất từ cộng đồng</p>
      </div>

      <Marquee items={row1} speed={0.5} />
      {row2.length > 0 && <Marquee items={row2} speed={0.5} />}
    </section>
  );
}

function Marquee({ items, speed }: { items: Locket[]; speed: number }) {
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
          <Card key={`m-${i}`} l={l} />
        ))}
      </div>
    </div>
  );
}

function Card({ l }: { l: Locket }) {
  return (
    <a
      href={l.profileUrl || `https://locket.cam/${l.username}`}
      target="_blank"
      rel="noopener noreferrer"
      className="ls-card"
    >
      {l.cover && (
        <div className="ls-cover">
          <img src={l.cover} alt="" loading="lazy" />
        </div>
      )}
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
          <div className="ls-avatar-fallback">{l.username[0]?.toUpperCase()}</div>
        )}

        {/* Badge admin xanh */}
        {l.isAdmin && (
          <svg className="ls-admin-badge" viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="#1d9bf0"
              d="M12 1.5l2.4 1.8 3-.3.9 2.9 2.6 1.5-1 2.8 1 2.8-2.6 1.5-.9 2.9-3-.3L12 19.5l-2.4-1.8-3 .3-.9-2.9L3.1 13.6l1-2.8-1-2.8 2.6-1.5.9-2.9 3 .3L12 1.5z"
            />
            <path
              fill="#fff"
              d="M10.6 13.2l-2-2-1.2 1.2 3.2 3.2 5.8-5.8-1.2-1.2-4.6 4.6z"
            />
          </svg>
        )}

        {l.badge && <span className="ls-badge">{l.badge}</span>}
      </div>
      <div className="ls-name">{l.displayName || l.username}</div>
      <div className="ls-username">@{l.username}</div>
    </a>
  );
}
