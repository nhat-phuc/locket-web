"use client";

import { useEffect, useState } from "react";

interface Review {
  id: string;
  name: string;
  initial: string;
  avatar?: string | null;
  text: string;
  rating: number;
  image: string | null;
  images: string | null;
  time: string;
  isFeatured: boolean;
  createdAt: string;
}

function uiAvatar(name: string): string {
  const clean = name.replace(/\*/g, "").trim() || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(clean)}&background=7c3aed&color=fff&size=128&bold=true`;
}

const INITIAL_COUNT = 6;
const LOAD_MORE = 6;

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [shown, setShown] = useState(INITIAL_COUNT);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [detailReview, setDetailReview] = useState<Review | null>(null);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews?limit=100")
      .then((r) => r.json())
      .then((d) => { if (d.success) setReviews(d.reviews); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ESC để đóng tất cả
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxImg(null);
        setDetailReview(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock scroll khi mở popup/lightbox
  useEffect(() => {
    if (lightboxImg || detailReview) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightboxImg, detailReview]);

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

  const getAvatar = (r: Review) => {
    if (failed[r.id] || !r.avatar) return uiAvatar(r.name);
    return r.avatar;
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

  const detailImg = detailReview ? parseImages(detailReview)[0] : null;

  return (
    <section>
      <div style={{ textAlign: "center", marginTop: 40, marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-0)" }}>Đánh Giá Khách Hàng</h2>
        <p style={{ color: "var(--text-2)", fontSize: 14, marginTop: 8 }}>Hình ảnh thực tế từ khách hàng</p>
      </div>

      <div className="rv-grid">
        {visible.map((r, i) => {
          const imgs = parseImages(r);
          const mainImg = imgs[0];
          if (!mainImg) return null;

          return (
            <div key={r.id} className="rv-card" style={{ animationDelay: `${(i % LOAD_MORE) * 0.04}s` }}>
              {/* VÙNG 1: ẢNH → click mở lightbox */}
              <div
                className={`rv-img-wrap ${r.isFeatured ? "is-featured" : ""}`}
                onClick={() => setLightboxImg(mainImg)}
                title="Xem ảnh lớn"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mainImg} alt={r.name} loading="lazy" className="rv-img" />
                {r.isFeatured && <div className="rv-img-star">⭐</div>}
              </div>

              {/* VÙNG 2: TEXT/INFO → click mở popup chi tiết */}
              <div
                className="rv-info"
                onClick={() => setDetailReview(r)}
                title="Xem chi tiết đánh giá"
              >
                <div className="rv-meta">
                  <div className="rv-avatar">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getAvatar(r)}
                      alt={r.name}
                      referrerPolicy="no-referrer"
                      onError={() => setFailed((f) => ({ ...f, [r.id]: true }))}
                    />
                  </div>
                  <div className="rv-name">{r.name}</div>
                </div>

                <div className="rv-text">{r.text}</div>
                <div className="rv-time">{relativeTime(r.createdAt)}</div>
              </div>
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

      {/* ═══════════ LIGHTBOX ẢNH (click vào ảnh) ═══════════ */}
      {lightboxImg && (
        <div
          className="rv-lightbox"
          onClick={() => setLightboxImg(null)}
        >
          <button className="rv-lightbox-close" onClick={() => setLightboxImg(null)} aria-label="Đóng">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImg}
            alt=""
            className="rv-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ═══════════ POPUP CHI TIẾT (click vào text) ═══════════ */}
      {detailReview && detailImg && (
        <div
          className="rv-modal-overlay"
          onClick={() => setDetailReview(null)}
        >
          <div className="rv-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header — ảnh */}
            <div className="rv-modal-header">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={detailImg}
                alt={detailReview.name}
                className="rv-modal-img"
                onClick={() => {
                  setDetailReview(null);
                  setLightboxImg(detailImg);
                }}
                title="Xem ảnh lớn"
              />
              <button className="rv-modal-close" onClick={() => setDetailReview(null)} aria-label="Đóng">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="rv-modal-body">
              <div className="rv-modal-user">
                <div className="rv-modal-avatar">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getAvatar(detailReview)}
                    alt={detailReview.name}
                    referrerPolicy="no-referrer"
                    onError={() => setFailed((f) => ({ ...f, [detailReview.id]: true }))}
                  />
                </div>
                <div className="rv-modal-user-info">
                  <div className="rv-modal-name">{detailReview.name}</div>
                  <div className="rv-modal-time">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {relativeTime(detailReview.createdAt)}
                  </div>
                </div>
              </div>

              <div className="rv-modal-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < detailReview.rating ? "is-filled" : ""}>★</span>
                ))}
              </div>

              <div className="rv-modal-text">{detailReview.text}</div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Grid 6 ảnh/hàng */
        .rv-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
          margin-top: 24px;
        }
        @media (max-width: 1200px) { .rv-grid { grid-template-columns: repeat(5, 1fr); } }
        @media (max-width: 1000px) { .rv-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 768px)  { .rv-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; } }
        @media (max-width: 500px)  { .rv-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; } }

        .rv-card {
          display: flex;
          flex-direction: column;
          gap: 6px;
          animation: rvFadeIn 0.5s ease both;
        }

        @keyframes rvFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Khung ảnh */
        .rv-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 9 / 16;
          border-radius: 14px;
          overflow: hidden;
          cursor: zoom-in;
          padding: 3px;
          background: linear-gradient(135deg, #a78bfa 0%, #ec4899 100%);
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }
        .rv-img-wrap:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 16px 40px rgba(167, 139, 250, 0.5);
        }
        .rv-img-wrap.is-featured {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #f97316 100%);
        }
        .rv-img-wrap :global(.rv-img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: 11px;
          background: #0a0a0f;
        }
        .rv-img-wrap :global(.rv-img-star) {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(10px);
          color: #fbbf24;
          font-size: 11px;
          font-weight: 900;
          padding: 3px 7px;
          border-radius: 6px;
          z-index: 3;
          border: 1px solid rgba(251, 191, 36, 0.5);
        }

        /* Vùng info (click → popup) */
        .rv-info {
          cursor: pointer;
          padding: 4px 6px;
          border-radius: 8px;
          transition: background 0.2s;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .rv-info:hover {
          background: rgba(167, 139, 250, 0.08);
        }

        .rv-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rv-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          border: 2px solid rgba(167, 139, 250, 0.3);
          background: #f3f4f6;
        }
        .rv-avatar :global(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .rv-name {
          font-weight: 700;
          font-size: 12px;
          color: var(--text-0);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .rv-text {
          font-size: 12.5px;
          color: var(--text-1);
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .rv-time {
          font-size: 10.5px;
          color: var(--text-2);
        }

        /* Actions */
        .rv-actions {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-top: 28px;
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
        }
        .rv-btn-collapse {
          background: transparent;
          color: var(--text-2);
        }
        .rv-btn-collapse:hover { color: var(--text-0); }

        /* ═══════ LIGHTBOX ẢNH ═══════ */
        .rv-lightbox {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.95);
          display: grid;
          place-items: center;
          z-index: 1000;
          cursor: zoom-out;
          padding: 20px;
          animation: rvFadeIn 0.2s ease;
        }
        .rv-lightbox-img {
          max-width: 90vw;
          max-height: 90vh;
          border-radius: 12px;
          cursor: default;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.8);
        }
        .rv-lightbox-close {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #fff;
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: all 0.2s;
          z-index: 2;
        }
        .rv-lightbox-close:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }
        .rv-lightbox-close svg {
          width: 20px;
          height: 20px;
        }

        /* ═══════ POPUP CHI TIẾT ═══════ */
        .rv-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          z-index: 999;
          display: grid;
          place-items: center;
          padding: 20px;
          animation: rvFadeIn 0.25s ease;
        }
        .rv-modal {
          background: #fff;
          border-radius: 24px;
          max-width: 520px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: rvModalIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
        }
        @keyframes rvModalIn {
          0% { opacity: 0; transform: scale(0.85) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        .rv-modal-header {
          position: relative;
          width: 100%;
          background: #1a1230;
          flex-shrink: 0;
        }
        .rv-modal-img {
          width: 100%;
          max-height: 50vh;
          object-fit: contain;
          display: block;
          background: #1a1230;
          cursor: zoom-in;
        }
        .rv-modal-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #fff;
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: all 0.2s;
          z-index: 2;
        }
        .rv-modal-close:hover {
          background: rgba(255, 255, 255, 0.35);
          transform: scale(1.1);
        }
        .rv-modal-close svg { width: 16px; height: 16px; }

        .rv-modal-body {
          padding: 24px;
          background: #fff;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .rv-modal-user {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .rv-modal-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          border: 3px solid #fff;
          box-shadow: 0 8px 20px rgba(167, 139, 250, 0.3);
          background: #f3f4f6;
        }
        .rv-modal-avatar :global(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .rv-modal-user-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .rv-modal-name {
          font-size: 18px;
          font-weight: 900;
          color: #111827;
        }
        .rv-modal-time {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          background: #f3f4f6;
          border-radius: 999px;
          font-size: 12px;
          color: #6b7280;
          font-weight: 600;
          align-self: flex-start;
        }
        .rv-modal-stars {
          display: flex;
          gap: 4px;
          font-size: 28px;
          line-height: 1;
        }
        .rv-modal-stars :global(span) {
          color: #e5e7eb;
        }
        .rv-modal-stars :global(span.is-filled) {
          color: #fbbf24;
          filter: drop-shadow(0 2px 4px rgba(251, 191, 36, 0.4));
        }
        .rv-modal-text {
          padding: 16px 18px;
          background: #f9fafb;
          border-left: 4px solid #a78bfa;
          border-radius: 12px;
          font-size: 15px;
          color: #374151;
          line-height: 1.6;
          position: relative;
        }

        @media (max-width: 600px) {
          .rv-modal-overlay { padding: 12px; }
          .rv-modal { border-radius: 20px; max-height: 92vh; }
          .rv-modal-body { padding: 18px; gap: 14px; }
          .rv-modal-avatar { width: 48px; height: 48px; }
          .rv-modal-name { font-size: 16px; }
          .rv-modal-stars { font-size: 24px; }
          .rv-modal-text { font-size: 14px; padding: 14px 16px; }
        }
      `}</style>
    </section>
  );
}
