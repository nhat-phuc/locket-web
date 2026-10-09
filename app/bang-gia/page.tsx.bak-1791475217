"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./bang-gia.module.css";

interface Pkg {
  id: string;
  name: string;
  price: number;
}

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  platform: string;
  price: number;
  originalPrice?: number | null;
  discount?: number | null;
  duration?: string | null;
  features: string;
  badge?: string | null;
  badgeColor?: string | null;
  isFeatured: boolean;
  sold: number;
  packages?: Pkg[];
}

interface CardTheme {
  primary: string;
  nameColor: string;
  border: string;
  borderLight: string;
  cardBg: string;
  grad: string;
  shadow: string;
  badgeBg: string;
}

const THEME: Record<string, CardTheme> = {
  gold: {
    primary: "#dc2626",
    nameColor: "#dc2626",
    border: "#ef4444",
    borderLight: "rgba(220,38,38,.35)",
    cardBg: "linear-gradient(180deg, #fef2f2 0%, #fee2e2 50%, #fecaca 100%)",
    grad: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
    shadow: "rgba(220,38,38,.45)",
    badgeBg: "linear-gradient(135deg, #dc2626, #ef4444)",
  },
  vip: {
    primary: "#4f46e5",
    nameColor: "#059669",
    border: "#10b981",
    borderLight: "rgba(16,185,129,.35)",
    cardBg: "linear-gradient(180deg, #ffffff 0%, #f0fdf4 60%, #dcfce7 100%)",
    grad: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
    shadow: "rgba(79,70,229,.45)",
    badgeBg: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  },
  luxury: {
    primary: "#f59e0b",
    nameColor: "#f59e0b",
    border: "#fbbf24",
    borderLight: "rgba(245,158,11,.35)",
    cardBg: "linear-gradient(180deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)",
    grad: "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)",
    shadow: "rgba(234,88,12,.45)",
    badgeBg: "linear-gradient(135deg, #f59e0b, #fbbf24)",
  },
  premium: {
    primary: "#db2777",
    nameColor: "#db2777",
    border: "#ec4899",
    borderLight: "rgba(219,39,119,.35)",
    cardBg: "linear-gradient(180deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)",
    grad: "linear-gradient(135deg, #db2777 0%, #ec4899 100%)",
    shadow: "rgba(219,39,119,.45)",
    badgeBg: "linear-gradient(135deg, #db2777, #ec4899)",
  },
};

function parseFeatures(raw: string): string[] {
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return raw.split("\n").filter(Boolean);
  }
}

function splitPkgName(name: string): { label: string; price: string } {
  const idx = name.lastIndexOf("—");
  if (idx === -1) {
    const m = name.match(/^(.+?)\s+(\d+k.*)$/i);
    if (m) return { label: m[1].trim(), price: m[2].trim() };
    return { label: name, price: "" };
  }
  return { label: name.slice(0, idx).trim(), price: name.slice(idx + 1).trim() };
}

export default function BangGiaPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.services)) {
          setServices(d.services);
          if (d.services.length === 0) setError("Chưa có dịch vụ nào");
        } else {
          setError("Không tải được dịch vụ");
        }
      })
      .catch(() => setError("Lỗi kết nối"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className={styles.pkgPage}>
      <div className="pkg-bg-glow pkg-bg-glow-1" />
      <div className="pkg-bg-glow pkg-bg-glow-2" />
      <div className="pkg-bg-glow pkg-bg-glow-3" />

      <header className={styles.pkgHeader}>
        <div className={styles.pkgHeaderBadge}>💎 BẢNG GIÁ DỊCH VỤ</div>
        <h1 className={styles.pkgHeaderTitle}>Chọn Gói Phù Hợp</h1>
        <p className={styles.pkgHeaderSub}>Thanh toán tự động — kích hoạt tức thì</p>
      </header>

      {loading && (
        <div className={styles.pkgState}>
          <div className={styles.pkgSpinner} />
          <p>Đang tải dịch vụ...</p>
        </div>
      )}

      {!loading && error && (
        <div className="pkg-state pkg-error">
          <div className={styles.pkgErrorIcon}>⚠️</div>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && services.length > 0 && (
        <div className={styles.pkgGrid}>
          {services.map((s, idx) => {
            const theme = THEME[s.type] || THEME.vip;
            const features = parseFeatures(s.features);
            const discountPercent =
              s.discount ??
              (s.originalPrice
                ? Math.round(((s.originalPrice - s.price) / s.originalPrice) * 100)
                : 0);

            return (
              <article
                key={s.id}
                className={styles.pkgCard}
                style={{
                  background: theme.cardBg,
                  borderColor: theme.borderLight,
                  animationDelay: `${idx * 90}ms`,
                  ["--primary" as any]: theme.primary,
                  ["--name" as any]: theme.nameColor,
                  ["--border-strong" as any]: theme.border,
                  ["--border-soft" as any]: theme.borderLight,
                  ["--grad" as any]: theme.grad,
                  ["--shadow" as any]: theme.shadow,
                  ["--badge-bg" as any]: theme.badgeBg,
                }}
              >
                <div className={styles.pkgCardShine} />

                <div className={styles.pkgHead}>
                  <h2 className={styles.pkgName}>{s.name}</h2>
                  {s.badge && (
                    <div className={styles.pkgBadge} style={{ background: s.badgeColor || theme.badgeBg }}>
                      {s.badge}
                    </div>
                  )}
                </div>

                <p className={styles.pkgSub}>(Đã bao gồm thuế VAT &amp; Phí duy trì nền tảng)</p>

                <div className={styles.pkgPriceWrap}>
                  <div className={styles.pkgPrice}>
                    {s.price.toLocaleString("vi-VN")}
                    <span className={styles.pkgPriceUnit}>đ</span>
                  </div>
                  {s.originalPrice && s.originalPrice > s.price && (
                    <div className={styles.pkgOriginal}>{s.originalPrice.toLocaleString("vi-VN")}đ</div>
                  )}
                  {discountPercent > 0 && (
                    <div className={styles.pkgDiscount}>-{discountPercent}%</div>
                  )}
                </div>

                {features.length > 0 && (
                  <div className={styles.pkgFeaturesBlock}>
                    <div className={styles.pkgFeaturesTitle}>
                      {s.type === "premium" ? "Siêu Đặc Quyền:" : "Tính năng riêng:"}
                    </div>
                    <div className={styles.pkgFeaturesGrid}>
                      {features.map((f, i) => (
                        <div key={i} className={styles.pkgFeat} style={{ animationDelay: `${idx * 90 + i * 40}ms` }}>
                          <span className={styles.pkgFeatCheck}>✓</span>
                          <span className={styles.pkgFeatText}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {s.packages && s.packages.length > 0 ? (
                  <div className={styles.pkgBtns}>
                    {s.packages.map((p) => {
                      const parts = splitPkgName(p.name);
                      return (
                        <Link
                          key={p.id}
                          href={`/thanh-toan?serviceId=${s.slug}&packageId=${p.id}`}
                          className={styles.pkgBtn}
                        >
                          <span className={styles.pkgBtnLabel}>{parts.label}</span>
                          {parts.price && <span className={styles.pkgBtnPrice}>{parts.price}</span>}
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.pkgBtns}>
                    <Link href={`/thanh-toan?serviceId=${s.slug}`} className={styles.pkgBtn}>
                      <span className={styles.pkgBtnLabel}>Mua ngay</span>
                      <span className={styles.pkgBtnPrice}>{s.price.toLocaleString("vi-VN")}đ</span>
                    </Link>
                  </div>
                )}

                <p className={styles.pkgNote}>
                  *Lưu ý: Gói Vĩnh Viễn được Admin cam kết bảo hành tốt nhất và lâu nhất có thể cho đến khi website ngừng hoạt động. Nên yên tâm nhé!
                </p>
              </article>
            );
          })}
        </div>
      )}

      <style>{`
        .pkg-page {
          position: relative;
          max-width: 1440px;
          margin: 0 auto;
          padding: 40px 20px 100px;
          min-height: 80vh;
          overflow: hidden;
        }

        /* ═══════ BG GLOW ═══════ */
        .pkg-bg-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.45;
          pointer-events: none;
          z-index: 0;
          animation: pkgFloat 8s ease-in-out infinite;
        }
        .pkg-bg-glow-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(220,38,38,.5), transparent 70%);
          top: -100px; left: -100px;
        }
        .pkg-bg-glow-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(79,70,229,.4), transparent 70%);
          top: 40%; left: 35%;
          animation-delay: 2s;
        }
        .pkg-bg-glow-3 {
          width: 450px; height: 450px;
          background: radial-gradient(circle, rgba(219,39,119,.5), transparent 70%);
          bottom: -100px; right: -100px;
          animation-delay: 4s;
        }
        @keyframes pkgFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }

        /* ═══════ HEADER ═══════ */
        .pkg-header {
          position: relative;
          z-index: 1;
          text-align: center;
          margin-bottom: 44px;
        }
        .pkg-header-badge {
          display: inline-block;
          padding: 7px 18px;
          background: linear-gradient(135deg, rgba(236,72,153,.12), rgba(167,139,250,.12));
          border: 1px solid rgba(167,139,250,.35);
          border-radius: 999px;
          color: #a78bfa;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin-bottom: 14px;
          animation: pkgPulse 2s ease-in-out infinite;
        }
        @keyframes pkgPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(167,139,250,.4); }
          50% { box-shadow: 0 0 0 8px rgba(167,139,250,0); }
        }
        .pkg-header-title {
          font-size: clamp(28px, 4.5vw, 44px);
          font-weight: 900;
          margin: 0 0 10px;
          background: linear-gradient(135deg, #ec4899 0%, #a78bfa 50%, #60a5fa 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
          animation: pkgGradient 4s ease infinite;
        }
        @keyframes pkgGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .pkg-header-sub {
          color: #6b7280;
          font-size: 14.5px;
          margin: 0;
        }

        /* ═══════ STATES ═══════ */
        .pkg-state {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 80px 20px;
          color: #6b7280;
          font-size: 15px;
        }
        .pkg-error { color: #dc2626; }
        .pkg-error-icon { font-size: 48px; margin-bottom: 12px; }
        .pkg-spinner {
          width: 44px; height: 44px;
          margin: 0 auto 16px;
          border: 3px solid rgba(236,72,153,.15);
          border-top-color: #ec4899;
          border-radius: 50%;
          animation: pkgSpin 0.8s linear infinite;
        }
        @keyframes pkgSpin { to { transform: rotate(360deg); } }

        /* ═══════ GRID ═══════ */
        .pkg-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          align-items: stretch;
        }
        @media (max-width: 1200px) { .pkg-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .pkg-grid { grid-template-columns: 1fr; gap: 14px; } .pkg-page { padding: 24px 12px 60px; } }

        /* ═══════ CARD ═══════ */
        .pkg-card {
          position: relative;
          border: 2px solid;
          border-radius: 26px;
          padding: 24px 18px 22px;
          display: flex;
          flex-direction: column;
          animation: pkgFadeIn 0.7s cubic-bezier(0.4, 0, 0.2, 1) both;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        @keyframes pkgFadeIn {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pkg-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 50px var(--shadow), 0 0 0 1px var(--border-strong);
        }

        /* Card shine sweep on hover */
        .pkg-card-shine {
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.5), transparent);
          transition: left 0.9s;
          pointer-events: none;
          z-index: 2;
        }
        .pkg-card:hover .pkg-card-shine { left: 100%; }

        /* ═══════ HEAD ═══════ */
        .pkg-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
          position: relative;
          z-index: 3;
        }
        .pkg-name {
          font-size: 18px;
          font-weight: 900;
          color: var(--name);
          margin: 0;
          line-height: 1.2;
          letter-spacing: 0.3px;
          flex: 1;
          text-transform: uppercase;
        }
        .pkg-badge {
          padding: 5px 11px;
          border-radius: 7px;
          font-size: 9.5px;
          font-weight: 900;
          color: #fff;
          letter-spacing: 0.4px;
          white-space: nowrap;
          line-height: 1.2;
          text-align: center;
          text-transform: uppercase;
          box-shadow: 0 3px 8px rgba(0,0,0,.2);
          flex-shrink: 0;
          animation: pkgBadgeGlow 2.4s ease-in-out infinite;
        }
        @keyframes pkgBadgeGlow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }

        .pkg-sub {
          font-size: 10.5px;
          color: #9ca3af;
          text-align: center;
          margin: 0 0 14px;
          line-height: 1.5;
          font-style: italic;
          position: relative;
          z-index: 3;
        }

        /* ═══════ PRICE ═══════ */
        .pkg-price-wrap {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 18px;
          padding: 12px 10px;
          background: rgba(255,255,255,.75);
          border-radius: 14px;
          border: 1.5px dashed var(--border-soft);
          backdrop-filter: blur(4px);
          position: relative;
          z-index: 3;
        }
        .pkg-price {
          font-size: 28px;
          font-weight: 900;
          color: var(--name);
          line-height: 1;
          letter-spacing: -0.5px;
        }
        .pkg-price-unit { font-size: 17px; margin-left: 2px; }
        .pkg-original {
          font-size: 14px;
          color: #9ca3af;
          text-decoration: line-through;
          font-weight: 600;
        }
        .pkg-discount {
          padding: 4px 9px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff;
          border-radius: 7px;
          font-size: 11px;
          font-weight: 900;
          box-shadow: 0 3px 8px rgba(220,38,38,.4);
          animation: pkgDiscountPulse 2s ease-in-out infinite;
        }
        @keyframes pkgDiscountPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        /* ═══════ FEATURES ═══════ */
        .pkg-features-block {
          margin-bottom: 20px;
          position: relative;
          z-index: 3;
        }
        .pkg-features-title {
          font-size: 13.5px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 12px;
        }
        .pkg-features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .pkg-feat {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          padding: 11px 10px;
          background: #ffffff;
          border: 1.5px solid var(--border-strong);
          border-radius: 11px;
          font-size: 11.5px;
          font-weight: 700;
          color: #111827;
          line-height: 1.35;
          min-height: 62px;
          box-shadow: 0 2px 6px rgba(0,0,0,.04);
          transition: all 0.25s;
          animation: pkgFadeIn 0.5s ease both;
        }
        .pkg-feat:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(0,0,0,.1);
          border-color: var(--primary);
        }
        .pkg-feat-check {
          color: var(--border-strong);
          font-weight: 900;
          font-size: 14px;
          flex-shrink: 0;
          line-height: 1.1;
          margin-top: 1px;
        }
        .pkg-feat-text { flex: 1; }

        /* ═══════ BUTTONS ═══════ */
        .pkg-btns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: auto;
          margin-bottom: 16px;
          position: relative;
          z-index: 3;
        }
        .pkg-btn {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          padding: 14px 8px;
          background: var(--grad);
          color: #ffffff;
          border-radius: 999px;
          font-weight: 800;
          text-decoration: none;
          text-align: center;
          line-height: 1.2;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 5px 16px var(--shadow);
          min-height: 68px;
          overflow: hidden;
        }
        .pkg-btn::before {
          content: "";
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent);
          transition: left 0.6s;
          z-index: 1;
        }
        .pkg-btn:hover::before { left: 100%; }
        .pkg-btn:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 14px 32px var(--shadow), 0 0 0 3px rgba(255,255,255,.5);
          filter: brightness(1.08);
        }
        .pkg-btn:active { transform: translateY(-1px) scale(1); }
        .pkg-btn-label {
          font-size: 11.5px;
          font-weight: 800;
          opacity: 0.95;
          letter-spacing: 0.2px;
          position: relative;
          z-index: 2;
        }
        .pkg-btn-price {
          font-size: 17px;
          font-weight: 900;
          letter-spacing: 0.3px;
          text-shadow: 0 1px 3px rgba(0,0,0,.2);
          position: relative;
          z-index: 2;
        }

        /* ═══════ NOTE ═══════ */
        .pkg-note {
          font-size: 10.5px;
          color: #9ca3af;
          line-height: 1.55;
          margin: 0;
          text-align: center;
          font-style: italic;
          padding: 0 4px;
          position: relative;
          z-index: 3;
        }

        /* ═══════ MOBILE ═══════ */
        @media (max-width: 640px) {
          .pkg-card { padding: 20px 14px 18px; border-radius: 20px; }
          .pkg-name { font-size: 16px; }
          .pkg-price { font-size: 24px; }
          .pkg-btn-label { font-size: 11px; }
          .pkg-btn-price { font-size: 15px; }
        }
      `}</style>
    </main>
  );
}
