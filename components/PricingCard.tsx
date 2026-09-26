"use client";

import { useState } from "react";

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
  image?: string | null;
  isFeatured: boolean;
  sold: number;
}

const typeMeta: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  gold:    { color: "#fbbf24", bg: "rgba(251,191,36,.12)",  icon: "⭐", label: "GOLD" },
  vip:     { color: "#a78bfa", bg: "rgba(167,139,250,.12)", icon: "💜", label: "VIP" },
  luxury:  { color: "#f472b6", bg: "rgba(244,114,182,.12)", icon: "💎", label: "LUXURY" },
  adr:     { color: "#4ade80", bg: "rgba(74,222,128,.12)",  icon: "📱", label: "ANDROID" },
  agent:   { color: "#fb923c", bg: "rgba(251,146,60,.12)",  icon: "🤝", label: "ĐẠI LÝ" },
};

export default function PricingCard({ service }: { service: Service }) {
  const [showAll, setShowAll] = useState(false);
  const meta = typeMeta[service.type] || typeMeta.vip;

  let features: string[] = [];
  try {
    features = JSON.parse(service.features);
  } catch {
    features = service.features.split("\n").filter(Boolean);
  }

  const visibleFeatures = showAll ? features : features.slice(0, 5);
  const hasMore = features.length > 5;

  const discountPercent =
    service.discount ??
    (service.originalPrice
      ? Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)
      : 0);

  return (
    <div
      className={`pc-card${service.isFeatured ? " pc-featured" : ""}`}
      style={{ ["--pc-color" as any]: meta.color, ["--pc-bg" as any]: meta.bg }}
    >
      {service.badge && (
        <div
          className="pc-badge"
          style={{
            background: service.badgeColor
              ? `linear-gradient(135deg, ${service.badgeColor}, ${service.badgeColor}cc)`
              : `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
          }}
        >
          {service.badge}
        </div>
      )}

      {service.isFeatured && !service.badge && (
        <div className="pc-badge pc-badge-featured">🔥 PHỔ BIẾN</div>
      )}

      <div className="pc-glow" />

      <div className="pc-content">
        {/* HEAD */}
        <div className="pc-head">
          <div className="pc-icon" style={{ background: meta.bg, color: meta.color }}>
            {meta.icon}
          </div>
          <div className="pc-type" style={{ background: meta.bg, color: meta.color }}>
            {meta.label}
          </div>
        </div>

        {/* NAME */}
        <h3 className="pc-name">{service.name}</h3>

        {service.description && (
          <p className="pc-desc">{service.description}</p>
        )}

        {/* PRICE */}
        <div className="pc-price-wrap">
          <div className="pc-price">
            {service.price.toLocaleString("vi-VN")}
            <span className="pc-price-unit">đ</span>
          </div>
          {service.originalPrice && service.originalPrice > service.price && (
            <div className="pc-original">
              {service.originalPrice.toLocaleString("vi-VN")}đ
            </div>
          )}
          {discountPercent > 0 && (
            <div className="pc-discount">-{discountPercent}%</div>
          )}
        </div>

        {/* DURATION */}
        {service.duration && (
          <div className="pc-duration">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {service.duration}
          </div>
        )}

        {/* FEATURES */}
        <div className="pc-features">
          <div className="pc-features-title">Bao gồm:</div>
          <ul>
            {visibleFeatures.map((f, i) => (
              <li key={i} style={{ animationDelay: `${i * 40}ms` }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="pc-check">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          {hasMore && (
            <button className="pc-more" onClick={() => setShowAll((s) => !s)}>
              {showAll ? "Thu gọn ▲" : `Xem thêm ${features.length - 5} tính năng ▼`}
            </button>
          )}
        </div>

        {/* FOOT */}
        <div className="pc-foot">
          <div className="pc-sold">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            Đã bán {service.sold.toLocaleString("vi-VN")}
          </div>
          <a
            href={`/thanh-toan?serviceId=${service.slug}`}
            className="pc-buy"
          >
            <span>Mua ngay</span>
            <span className="pc-buy-shine" />
          </a>
        </div>
      </div>
    </div>
  );
}
