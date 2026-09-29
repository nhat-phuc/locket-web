"use client";

import { useEffect, useState } from "react";

interface Review {
  id: string;
  name: string;
  initial: string;
  text: string;
  rating: number;
  image: string | null;
  images: string | null;
  time: string;
  isFeatured: boolean;
  createdAt: string;
}

const INITIAL_COUNT = 8;
const LOAD_MORE = 8;

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [shown, setShown] = useState(INITIAL_COUNT);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews?limit=100")
      .then((r) => r.json())
      .then((d) => { if (d.success) setReviews(d.reviews); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const parseImages = (r: Review): string[] => {
    if (r.images) {
      try { return JSON.parse(r.images); } catch { return []; }
    }
    return r.image ? [r.image] : [];
  };

  const relativeTime = (date: string): string => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Vừa xong";
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  const visible = reviews.slice(0, shown);
  const hasMore = shown < reviews.length;
  const canCollapse = shown > INITIAL_COUNT;

  if (loading) {
    return (
      <section>
        <div style={{ textAlign: "center", marginTop: 40, marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-0)" }}>Đánh Giá Khách Hàng</h2>
          <p style={{ color: "var(--text-2)", fontSize: 14, marginTop: 8 }}>Hình ảnh thực tế từ khách hàng</p>
        </div>
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-2)" }}>Đang tải...</div>
      </section>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <section>
      <div style={{ textAlign: "center", marginTop: 40, marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-0)" }}>Đánh Giá Khách Hàng</h2>
        <p style={{ color: "var(--text-2)", fontSize: 14, marginTop: 8 }}>Hình ảnh thực tế từ khách hàng</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 20 }}>
        {visible.map((r, i) => {
          const imgs = parseImages(r);
          const mainImg = imgs[0];
          return (
            <div key={r.id} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: 6,
              display: "flex",
              flexDirection: "column",
              gap: 5,
              width: "calc((100% - 7 * 8px) / 8)",
              minWidth: 130,
              animation: "rvFadeIn 0.5s ease both",
              animationDelay: `${(i % LOAD_MORE) * 0.04}s`,
            }}>
              {mainImg && (
                <div
                  className={`rv-img-wrap ${r.isFeatured ? "is-featured" : ""}`}
                  onClick={() => setLightboxImg(mainImg)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mainImg}
                    alt={r.name}
                    loading="lazy"
                    className="rv-img"
                  />
                  {r.isFeatured && (
                    <div className="rv-img-star">⭐</div>
                  )}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "linear-gradient(135deg,#a78bfa,#7c3aed)",
                  color: "#fff", fontWeight: 700, fontSize: 12,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {r.initial}
                </div>
                <div style={{ fontWeight: 700, fontSize: 12, color: "var(--text-0)" }}>{r.name}</div>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-1)", lineHeight: 1.45 }}>{r.text}</div>
              <div style={{ fontSize: 10, color: "var(--text-2)" }}>{relativeTime(r.createdAt)}</div>
            </div>
          );
        })}
      </div>

      {/* Nút Xem thêm / Thu gọn */}
      <div className="rv-actions">
        {hasMore && (
          <button onClick={() => setShown((s) => s + LOAD_MORE)} className="rv-btn rv-btn-more">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
            Xem thêm đánh giá
          </button>
        )}
        {canCollapse && (
          <button onClick={() => setShown(INITIAL_COUNT)} className="rv-btn rv-btn-collapse">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 15l-6-6-6 6" />
            </svg>
            Thu gọn
          </button>
        )}
      </div>

      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.9)",
            display: "grid", placeItems: "center",
            zIndex: 999, cursor: "zoom-out",
            padding: 20,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxImg} alt="" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 12 }} />
        </div>
      )}

      <style jsx>{`
        @keyframes rvFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Ảnh review — viền trắng mờ kiểu story (3px) */
        .rv-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 9 / 16;
          border-radius: 13px;
          overflow: hidden;
          cursor: zoom-in;
          padding: 3px;
          background: linear-gradient(135deg, #a78bfa 0%, #ec4899 100%);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .rv-img-wrap:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 24px rgba(167, 139, 250, 0.4);
        }

        /* Ảnh nổi bật — viền gradient vàng gold */
        .rv-img-wrap.is-featured {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #f97316 100%);
          padding: 3px;
        }
        .rv-img-wrap.is-featured:hover {
          background: linear-gradient(135deg, #fcd34d 0%, #fbbf24 50%, #fb923c 100%);
          box-shadow: 0 8px 24px rgba(251, 191, 36, 0.4);
        }

        .rv-img-wrap :global(.rv-img) {
          position: relative;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: 10px;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background: #0a0a0f;
        }
        .rv-img-wrap:hover :global(.rv-img) {
          transform: scale(1.04);
        }

        .rv-img-wrap :global(.rv-img-star) {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          color: #fbbf24;
          font-size: 12px;
          font-weight: 900;
          padding: 3px 7px;
          border-radius: 6px;
          z-index: 3;
          border: 1px solid rgba(251, 191, 36, 0.5);
        }

        /* Actions */
        .rv-actions {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-top: 24px;
          flex-wrap: wrap;
        }
        .rv-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 24px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 800;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
        }
        .rv-btn-more {
          background: rgba(167,139,250,0.12);
          color: #a78bfa;
          border: 1.5px solid rgba(167,139,250,0.3);
        }
        .rv-btn-more:hover {
          background: rgba(167,139,250,0.2);
          border-color: rgba(167,139,250,0.5);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(167,139,250,0.2);
        }
        .rv-btn-collapse {
          background: transparent;
          color: var(--text-2);
        }
        .rv-btn-collapse:hover { color: var(--text-0); }
      `}</style>
    </section>
  );
}
