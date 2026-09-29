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

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [shown, setShown] = useState(8);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews?limit=50")
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
        {reviews.slice(0, shown).map((r) => {
          const imgs = parseImages(r);
          const mainImg = imgs[0];
          return (
            <div key={r.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 6, display: "flex", flexDirection: "column", gap: 5, width: "calc((100% - 7 * 8px) / 8)", minWidth: 130 }}>
              {mainImg && (
                <div style={{ width: "100%", aspectRatio: "9 / 16", borderRadius: 10, overflow: "hidden", cursor: "zoom-in", position: "relative" }} onClick={() => setLightboxImg(mainImg)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mainImg} alt={r.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  {r.isFeatured && (
                    <div style={{ position: "absolute", top: 6, right: 6, background: "#fbbf24", color: "#fff", fontSize: 10, fontWeight: 900, padding: "2px 6px", borderRadius: 4 }}>
                      ⭐
                    </div>
                  )}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#a78bfa,#7c3aed)", color: "#fff", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{r.initial}</div>
                <div style={{ fontWeight: 700, fontSize: 12, color: "var(--text-0)" }}>{r.name}</div>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-1)", lineHeight: 1.45 }}>{r.text}</div>
              <div style={{ fontSize: 10, color: "var(--text-2)" }}>{relativeTime(r.createdAt)}</div>
            </div>
          );
        })}
      </div>

      {shown < reviews.length && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button
            onClick={() => setShown((s) => s + 8)}
            style={{
              padding: "10px 24px",
              background: "rgba(167,139,250,0.1)",
              color: "var(--accent-bright)",
              border: "1px solid rgba(167,139,250,0.3)",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Xem thêm ({reviews.length - shown})
          </button>
        </div>
      )}

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
    </section>
  );
}
