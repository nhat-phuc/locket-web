"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
// 
import Navbar from "@/components/Navbar";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  categoryColor?: string | null;
  author: string;
  authorAvatar?: string | null;
  image?: string | null;
  readTime: string;
  views: number;
  isFeatured: boolean;
  createdAt: string;
}

const categoryColors: Record<string, { c: string; bg: string }> = {
  "Hướng dẫn":      { c: "#60a5fa", bg: "rgba(96,165,250,.12)" },
  "Tin tức":        { c: "#a78bfa", bg: "rgba(167,139,250,.12)" },
  "Mẹo hay":        { c: "#4ade80", bg: "rgba(74,222,128,.12)" },
  "Kinh nghiệm":    { c: "#fbbf24", bg: "rgba(251,191,36,.12)" },
  "Thông báo":      { c: "#f472b6", bg: "rgba(244,114,182,.12)" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

export default function BaiVietPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetch("/api/posts?limit=50")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPosts(d.posts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("revealed");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [posts]);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const s = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      setProgress(s || 0);
      setShowTop(h.scrollTop > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W * 2;
    canvas.height = H * 2;
    ctx.scale(2, 2);
    const particles: Array<{ x: number; y: number; r: number; vx: number; vy: number; a: number; c: string }> = [];
    const colors = ["#a78bfa", "#f472b6", "#60a5fa", "#4ade80", "#fbbf24"];
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 2.5 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        a: Math.random() * 0.5 + 0.2,
        c: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    let raf: number;
    const anim = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = p.a;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(anim);
    };
    anim();
    const onResize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * 2; canvas.height = H * 2;
      ctx.scale(2, 2);
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  const categories = useMemo(() => {
    const set = new Set(posts.map((p) => p.category));
    return ["all", ...Array.from(set)];
  }, [posts]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (activeCategory !== "all" && p.category !== activeCategory) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.excerpt.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [posts, activeCategory, search]);

  const featured = useMemo(() => filtered.find((p) => p.isFeatured) || null, [filtered]);
  const rest = useMemo(() => filtered.filter((p) => p.id !== featured?.id), [filtered, featured]);

  return (
    <>
      <div className="bv-progress" style={{ transform: `scaleX(${progress / 100})` }} />

      <Header />

      <main className="wrap center-y" style={{ paddingTop: 32, paddingBottom: 60 }}>
        <div className="page-shell">
          {/* HERO */}
          <div className="bv-hero" data-reveal>
            <canvas ref={canvasRef} className="bv-hero-canvas" />
            <div className="bv-hero-content">
              <div className="bv-hero-badge">
                <span className="bv-hero-dot" />
                Blog Locket Gold
              </div>
              <h1 className="bv-hero-title">
                Tin tức &{" "}
                <span className="bv-hero-gradient">Hướng dẫn</span>
                <br />
                Từ Chuyên Gia
              </h1>
              <p className="bv-hero-desc">
                Cập nhật mẹo hay, hướng dẫn chi tiết và tin tức mới nhất về Locket Gold
              </p>
              <div className="bv-hero-stats">
                <div className="bv-hero-stat">
                  <span className="bv-hero-stat-num">{posts.length}</span>
                  <span className="bv-hero-stat-label">Bài viết</span>
                </div>
                <div className="bv-hero-stat-divider" />
                <div className="bv-hero-stat">
                  <span className="bv-hero-stat-num">{categories.length - 1}</span>
                  <span className="bv-hero-stat-label">Chủ đề</span>
                </div>
                <div className="bv-hero-stat-divider" />
                <div className="bv-hero-stat">
                  <span className="bv-hero-stat-num">
                    {posts.reduce((s, p) => s + (p.views || 0), 0).toLocaleString("vi-VN")}
                  </span>
                  <span className="bv-hero-stat-label">Lượt xem</span>
                </div>
              </div>
            </div>
          </div>

          {/* FILTER */}
          <div className="bv-filter" data-reveal>
            <div className="bv-search-wrap">
              <svg className="bv-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="bv-search"
                placeholder="Tìm bài viết..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="bv-tabs">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`bv-tab${activeCategory === c ? " active" : ""}`}
                >
                  {c === "all" ? "📚 Tất cả" : c}
                </button>
              ))}
            </div>
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="bv-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bv-skeleton">
                  <div className="bv-skeleton-img" />
                  <div className="bv-skeleton-line" style={{ width: "40%" }} />
                  <div className="bv-skeleton-line" style={{ width: "90%", height: 22 }} />
                  <div className="bv-skeleton-line" style={{ width: "100%" }} />
                  <div className="bv-skeleton-line" style={{ width: "70%" }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bv-empty" data-reveal>
              <div className="bv-empty-icon">📭</div>
              <h3 className="bv-empty-title">Chưa có bài viết nào</h3>
              <p className="bv-empty-desc">
                {search ? `Không tìm thấy bài viết "${search}"` : "Vui lòng quay lại sau"}
              </p>
            </div>
          ) : (
            <>
              {/* FEATURED */}
              {featured && (
                <Link
                  href={`/bai-viet/${featured.slug}`}
                  className="bv-featured"
                  data-reveal
                >
                  <div className="bv-featured-img">
                    {featured.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={featured.image} alt={featured.title} />
                    ) : (
                      <div className="bv-featured-placeholder">📰</div>
                    )}
                    <div className="bv-featured-badge">⭐ Nổi bật</div>
                  </div>
                  <div className="bv-featured-body">
                    <div className="bv-featured-meta">
                      <span
                        className="bv-cat"
                        style={{
                          color: categoryColors[featured.category]?.c || "#a78bfa",
                          background: categoryColors[featured.category]?.bg || "rgba(167,139,250,.12)",
                        }}
                      >
                        {featured.category}
                      </span>
                      <span className="bv-time">🕐 {featured.readTime}</span>
                    </div>
                    <h2 className="bv-featured-title">{featured.title}</h2>
                    <p className="bv-featured-excerpt">{featured.excerpt}</p>
                    <div className="bv-featured-foot">
                      <div className="bv-author">
                        {featured.authorAvatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={featured.authorAvatar} alt={featured.author} />
                        ) : (
                          <div className="bv-author-avatar">{featured.author[0]}</div>
                        )}
                        <span>{featured.author}</span>
                      </div>
                      <span className="bv-read-more">Đọc tiếp →</span>
                    </div>
                  </div>
                </Link>
              )}

              {/* GRID */}
              <div className="bv-grid" data-reveal>
                {rest.map((p, i) => {
                  const catColor = categoryColors[p.category] || { c: "#a78bfa", bg: "rgba(167,139,250,.12)" };
                  return (
                    <Link
                      key={p.id}
                      href={`/bai-viet/${p.slug}`}
                      className="bv-card"
                      style={{
                        animationDelay: `${i * 50}ms`,
                        ["--card-c" as any]: catColor.c,
                      }}
                    >
                      <div className="bv-card-img">
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt={p.title} loading="lazy" />
                        ) : (
                          <div className="bv-card-placeholder">📄</div>
                        )}
                        <span className="bv-card-cat" style={{ color: catColor.c, background: catColor.bg }}>
                          {p.category}
                        </span>
                      </div>
                      <div className="bv-card-body">
                        <h3 className="bv-card-title">{p.title}</h3>
                        <p className="bv-card-excerpt">{p.excerpt}</p>
                        <div className="bv-card-foot">
                          <span className="bv-card-time">🕐 {p.readTime}</span>
                          <span className="bv-card-time">👁 {p.views.toLocaleString("vi-VN")}</span>
                        </div>
                        <div className="bv-card-date">{timeAgo(p.createdAt)}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {/*  */}
      <Navbar />

      {showTop && (
        <button
          className="bv-back-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Lên đầu trang"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}

      <style>{`
        .bv-progress {
          position: fixed; top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #a78bfa, #f472b6, #60a5fa);
          transform-origin: left; z-index: 9999;
          transition: transform .1s linear;
          box-shadow: 0 0 12px rgba(167,139,250,.6);
        }

        [data-reveal] {
          opacity: 0; transform: translateY(28px);
          transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1);
        }
        [data-reveal].revealed { opacity: 1; transform: translateY(0); }

        /* HERO */
        .bv-hero {
          position: relative; text-align: center;
          margin-bottom: 56px; padding: 40px 24px;
          border-radius: 28px;
          background: radial-gradient(ellipse at center top, rgba(167,139,250,.12), transparent 70%);
          overflow: hidden; min-height: 320px;
          display: flex; align-items: center; justify-content: center;
        }
        .bv-hero-canvas {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          pointer-events: none; opacity: .8;
        }
        .bv-hero-content { position: relative; z-index: 1; }
        .bv-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 18px; border-radius: 999px;
          background: linear-gradient(135deg, rgba(167,139,250,.15), rgba(244,114,182,.1));
          border: 1px solid rgba(167,139,250,.3);
          font-size: 12px; font-weight: 700; color: var(--accent-bright);
          letter-spacing: 1px; text-transform: uppercase; margin-bottom: 20px;
          backdrop-filter: blur(10px);
        }
        .bv-hero-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--accent-bright); box-shadow: 0 0 12px var(--accent-bright);
          animation: bvPulse 2s infinite;
        }
        @keyframes bvPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(1.3); }
        }
        .bv-hero-title {
          font-size: clamp(30px, 5vw, 52px); font-weight: 900;
          line-height: 1.1; letter-spacing: -2px;
          color: var(--text-0); margin-bottom: 16px;
        }
        .bv-hero-gradient {
          background: linear-gradient(135deg, #a78bfa, #f472b6, #60a5fa, #a78bfa);
          background-size: 300% 300%;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: bvGradient 6s ease infinite;
        }
        @keyframes bvGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .bv-hero-desc {
          font-size: 15.5px; color: var(--text-2);
          max-width: 560px; margin: 0 auto 28px;
        }
        .bv-hero-stats {
          display: inline-flex; align-items: center; gap: 24px;
          padding: 16px 32px; border-radius: 20px;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(167,139,250,.15);
          backdrop-filter: blur(10px);
        }
        body[data-mode="light"] .bv-hero-stats { background: rgba(255,255,255,.7); }
        .bv-hero-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .bv-hero-stat-num {
          font-size: 22px; font-weight: 900;
          background: linear-gradient(135deg, #a78bfa, #f472b6);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -.5px;
        }
        .bv-hero-stat-label {
          font-size: 11px; color: var(--text-2);
          font-weight: 600; text-transform: uppercase; letter-spacing: .5px;
        }
        .bv-hero-stat-divider { width: 1px; height: 32px; background: rgba(167,139,250,.2); }
        @media (max-width: 640px) {
          .bv-hero { padding: 32px 16px; min-height: 280px; }
          .bv-hero-stats { padding: 12px 20px; gap: 16px; }
          .bv-hero-stat-num { font-size: 18px; }
        }

        /* FILTER */
        .bv-filter {
          display: flex; flex-direction: column; gap: 16px;
          padding: 22px; border-radius: 22px;
          background: linear-gradient(145deg, rgba(255,255,255,.03), rgba(255,255,255,.01));
          border: 1px solid var(--border);
          margin-bottom: 40px;
        }
        body[data-mode="light"] .bv-filter { background: rgba(255,255,255,.7); }
        .bv-search-wrap { position: relative; }
        .bv-search-icon {
          position: absolute; left: 16px; top: 50%;
          transform: translateY(-50%); color: var(--text-2);
          pointer-events: none;
        }
        .bv-search {
          width: 100%; padding: 14px 16px 14px 46px;
          background: rgba(0,0,0,.2);
          border: 1.5px solid var(--border);
          border-radius: 14px;
          color: var(--text-0); font-size: 14.5px;
          font-family: inherit; outline: none;
          transition: all .3s cubic-bezier(.2,.7,.2,1);
        }
        body[data-mode="light"] .bv-search { background: rgba(255,255,255,.8); }
        .bv-search:focus {
          border-color: var(--accent);
          background: rgba(167,139,250,.06);
          box-shadow: 0 0 0 4px rgba(167,139,250,.15);
        }
        .bv-tabs {
          display: flex; gap: 8px; flex-wrap: wrap;
          justify-content: center;
        }
        .bv-tab {
          padding: 9px 18px; border-radius: 999px;
          border: 1.5px solid var(--border);
          background: transparent;
          color: var(--text-2);
          font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: inherit;
          transition: all .3s cubic-bezier(.2,.7,.2,1);
        }
        .bv-tab:hover {
          border-color: var(--accent);
          color: var(--accent-bright);
          transform: translateY(-2px);
        }
        .bv-tab.active {
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 10px 24px rgba(124,58,237,.4);
          transform: translateY(-2px) scale(1.03);
        }

        /* FEATURED */
        .bv-featured {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 0;
          border-radius: 24px;
          overflow: hidden;
          background: linear-gradient(145deg, rgba(255,255,255,.04), rgba(255,255,255,.01));
          border: 1.5px solid var(--border);
          margin-bottom: 40px;
          text-decoration: none;
          transition: all .5s cubic-bezier(.2,.7,.2,1);
          position: relative;
        }
        body[data-mode="light"] .bv-featured { background: linear-gradient(145deg, rgba(255,255,255,.95), rgba(255,255,255,.75)); }
        .bv-featured::before {
          content: "";
          position: absolute; inset: 0; border-radius: 24px; padding: 1.5px;
          background: linear-gradient(135deg, transparent 30%, #fbbf24, transparent 70%);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0; transition: opacity .5s; pointer-events: none;
        }
        .bv-featured:hover::before { opacity: 1; }
        .bv-featured:hover {
          transform: translateY(-6px);
          box-shadow: 0 30px 70px -15px rgba(0,0,0,.4), 0 0 50px -10px #fbbf24;
        }
        .bv-featured-img {
          position: relative;
          min-height: 320px;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(167,139,250,.2), rgba(251,191,36,.1));
        }
        .bv-featured-img img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform .8s cubic-bezier(.2,.7,.2,1);
        }
        .bv-featured:hover .bv-featured-img img { transform: scale(1.08); }
        .bv-featured-placeholder {
          display: flex; align-items: center; justify-content: center;
          width: 100%; height: 100%;
          font-size: 96px; opacity: .6;
        }
        .bv-featured-badge {
          position: absolute; top: 16px; left: 16px;
          padding: 6px 14px; border-radius: 999px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: #000; font-size: 11px; font-weight: 900;
          letter-spacing: .8px; text-transform: uppercase;
          box-shadow: 0 6px 16px rgba(251,191,36,.5);
          animation: bvBadge 2.5s ease-in-out infinite;
        }
        @keyframes bvBadge {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        .bv-featured-body {
          padding: 32px;
          display: flex; flex-direction: column; gap: 14px;
          justify-content: center;
        }
        .bv-featured-meta {
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
        }
        .bv-cat {
          display: inline-block;
          padding: 5px 12px; border-radius: 8px;
          font-size: 11.5px; font-weight: 800;
          letter-spacing: .5px; text-transform: uppercase;
        }
        .bv-time {
          font-size: 12.5px; color: var(--text-2); font-weight: 600;
        }
        .bv-featured-title {
          font-size: clamp(20px, 2.5vw, 28px);
          font-weight: 900; letter-spacing: -.8px;
          color: var(--text-0); line-height: 1.25; margin: 0;
        }
        .bv-featured-excerpt {
          font-size: 14.5px; color: var(--text-2);
          line-height: 1.65; margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .bv-featured-foot {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; padding-top: 8px;
        }
        .bv-author {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; color: var(--text-1); font-weight: 700;
        }
        .bv-author img, .bv-author-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          object-fit: cover;
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 900; font-size: 14px;
        }
        .bv-read-more {
          font-size: 13.5px; font-weight: 900;
          color: #fbbf24;
          transition: transform .3s;
        }
        .bv-featured:hover .bv-read-more { transform: translateX(4px); }
        @media (max-width: 800px) {
          .bv-featured { grid-template-columns: 1fr; }
          .bv-featured-img { min-height: 220px; }
          .bv-featured-body { padding: 24px; }
        }

        /* GRID */
        .bv-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }
        .bv-card {
          display: flex; flex-direction: column;
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(145deg, rgba(255,255,255,.04), rgba(255,255,255,.01));
          border: 1.5px solid var(--border);
          text-decoration: none;
          transition: all .5s cubic-bezier(.2,.7,.2,1);
          position: relative;
          animation: bvCardIn .6s cubic-bezier(.2,.7,.2,1) both;
          isolation: isolate;
        }
        body[data-mode="light"] .bv-card { background: linear-gradient(145deg, rgba(255,255,255,.95), rgba(255,255,255,.75)); }
        @keyframes bvCardIn {
          from { opacity: 0; transform: translateY(20px) scale(.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .bv-card::before {
          content: "";
          position: absolute; inset: 0; border-radius: 20px; padding: 1.5px;
          background: linear-gradient(135deg, transparent 30%, var(--card-c), transparent 70%);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0; transition: opacity .5s; pointer-events: none; z-index: 2;
        }
        .bv-card:hover::before { opacity: 1; }
        .bv-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: var(--card-c);
          box-shadow: 0 30px 70px -15px rgba(0,0,0,.4), 0 0 40px -10px var(--card-c);
        }
        .bv-card-img {
          position: relative;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(167,139,250,.15), rgba(244,114,182,.1));
        }
        .bv-card-img img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform .7s cubic-bezier(.2,.7,.2,1);
        }
        .bv-card:hover .bv-card-img img { transform: scale(1.1); }
        .bv-card-placeholder {
          display: flex; align-items: center; justify-content: center;
          width: 100%; height: 100%; font-size: 64px; opacity: .5;
        }
        .bv-card-cat {
          position: absolute; top: 12px; left: 12px;
          padding: 5px 12px; border-radius: 8px;
          font-size: 10.5px; font-weight: 900;
          letter-spacing: .5px; text-transform: uppercase;
          backdrop-filter: blur(10px);
        }
        .bv-card-body {
          padding: 20px;
          display: flex; flex-direction: column; gap: 10px;
          flex: 1;
        }
        .bv-card-title {
          font-size: 16.5px; font-weight: 900;
          color: var(--text-0); line-height: 1.35;
          letter-spacing: -.3px; margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color .3s;
        }
        .bv-card:hover .bv-card-title { color: var(--card-c); }
        .bv-card-excerpt {
          font-size: 13.5px; color: var(--text-2);
          line-height: 1.6; margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .bv-card-foot {
          display: flex; gap: 14px; margin-top: auto;
          padding-top: 10px;
        }
        .bv-card-time {
          font-size: 11.5px; color: var(--text-2);
          font-weight: 600;
        }
        .bv-card-date {
          font-size: 11px; color: var(--text-2);
          opacity: .7;
        }

        /* SKELETON */
        .bv-skeleton {
          padding: 0 0 20px;
          border-radius: 20px;
          background: var(--bg-1);
          border: 1.5px solid var(--border);
          overflow: hidden;
        }
        .bv-skeleton-img {
          aspect-ratio: 16 / 10;
          background: linear-gradient(90deg, rgba(255,255,255,.02), rgba(255,255,255,.06), rgba(255,255,255,.02));
          background-size: 200% 100%;
          animation: bvShimmer 1.5s infinite;
        }
        .bv-skeleton-line {
          height: 14px; border-radius: 6px;
          background: linear-gradient(90deg, rgba(255,255,255,.02), rgba(255,255,255,.06), rgba(255,255,255,.02));
          background-size: 200% 100%;
          animation: bvShimmer 1.5s infinite;
          margin: 10px 20px 0;
        }
        @keyframes bvShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* EMPTY */
        .bv-empty {
          text-align: center; padding: 80px 24px;
          background: linear-gradient(145deg, rgba(255,255,255,.03), rgba(255,255,255,.01));
          border: 1.5px dashed var(--border);
          border-radius: 28px;
        }
        .bv-empty-icon {
          font-size: 72px; margin-bottom: 16px; opacity: .5;
          animation: bvFloat 3s ease-in-out infinite;
        }
        @keyframes bvFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .bv-empty-title {
          font-size: 22px; font-weight: 900;
          margin-bottom: 8px; color: var(--text-0);
        }
        .bv-empty-desc {
          font-size: 14.5px; color: var(--text-2);
        }

        /* BACK TO TOP */
        .bv-back-top {
          position: fixed; bottom: 90px; left: 20px;
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          color: #fff; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 10px 30px rgba(124,58,237,.5);
          z-index: 999;
          transition: all .3s cubic-bezier(.2,.7,.2,1);
        }
        .bv-back-top:hover {
          transform: translateY(-4px) scale(1.08);
          box-shadow: 0 16px 40px rgba(124,58,237,.7);
        }
        @media (min-width: 768px) { .bv-back-top { bottom: 40px; } }
      `}</style>
    </>
  );
}
