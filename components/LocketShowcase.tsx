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
}

export default function LocketShowcase() {
  const [lockets, setLockets] = useState<Locket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => {
      fetch("/api/locket/list?limit=100")
        .then((r) => r.json())
        .then((d) => setLockets(d.profiles || d.lockets || d.data || []))
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
        <h2 className="ls-title">🌟 Locket Đã Thêm</h2>
        <p className="ls-sub">{lockets.length} Locket mới nhất từ cộng đồng</p>
      </div>

      <Marquee items={row1} direction="left" speed={0.5} />
      {row2.length > 0 && (
        <Marquee items={row2} direction="right" speed={0.5} />
      )}
    </section>
  );
}

function Marquee({
  items,
  direction,
  speed,
}: {
  items: Locket[];
  direction: "left" | "right";
  speed: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const startAnim = () => {
      const halfWidth = track.scrollWidth / 2;

      // Nếu chạy sang phải → bắt đầu ở -halfWidth
      offsetRef.current = direction === "right" ? -halfWidth : 0;
      lastTimeRef.current = 0;

      const animate = (time: number) => {
        const delta = lastTimeRef.current ? time - lastTimeRef.current : 0;
        lastTimeRef.current = time;

        const hw = track.scrollWidth / 2;
        if (hw > 0) {
          // Trái: offset giảm | Phải: offset tăng
          offsetRef.current +=
            (direction === "left" ? -1 : 1) * speed * delta * 0.06;

          // Loop chính xác
          if (direction === "left" && offsetRef.current <= -hw) {
            offsetRef.current += hw;
          } else if (direction === "right" && offsetRef.current >= 0) {
            offsetRef.current -= hw;
          }

          track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
        }

        rafRef.current = requestAnimationFrame(animate);
      };

      rafRef.current = requestAnimationFrame(animate);
    };

    const t = setTimeout(startAnim, 100);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(rafRef.current);
    };
  }, [direction, speed, items.length]);

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
          <div className="ls-avatar-fallback">
            {l.username[0]?.toUpperCase()}
          </div>
        )}
        {l.badge && <span className="ls-badge">{l.badge}</span>}
      </div>
      <div className="ls-name">{l.displayName || l.username}</div>
      <div className="ls-username">@{l.username}</div>
    </a>
  );
}
