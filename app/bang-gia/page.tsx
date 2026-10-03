"use client";

import { useEffect, useState } from "react";

interface Pkg {
  id: string;
  name: string;
  duration?: string;
  price: number;
  originalPrice?: number | null;
  isPopular?: boolean;
}
interface Service {
  id: string;
  name: string;
  slug: string;
  type: string;
  price: number;
  originalPrice?: number | null;
  description: string;
  features: string;
  packages?: Pkg[];
}

const THEME: Record<string, { accent: string; bg: string; border: string; text: string }> = {
  gold:    { accent: "#e63946", bg: "#fef2f3", border: "#fca5a5", text: "#991b1b" },
  vip:     { accent: "#4f46e5", bg: "#eef2ff", border: "#a5b4fc", text: "#3730a3" },
  luxury:  { accent: "#f59e0b", bg: "#fffbeb", border: "#fcd34d", text: "#92400e" },
  adr:     { accent: "#10b981", bg: "#ecfdf5", border: "#6ee7b7", text: "#065f46" },
  agent:   { accent: "#fb923c", bg: "#fff7ed", border: "#fdba74", text: "#9a3412" },
};

function formatPrice(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

function parseFeatures(s: string): string[] {
  try {
    const arr = JSON.parse(s);
    if (Array.isArray(arr)) return arr;
  } catch {}
  return s.split("\n").filter(Boolean);
}

export default function BangGiaPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => { if (d.success) setServices(d.services || []); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="pr-page">
      <div className="pr-bg" />
      <div className="pr-wrap">
        <header className="pr-header">
          <h1>Bảng Giá Dịch Vụ</h1>
          <p>Chọn gói phù hợp — thanh toán tự động, kích hoạt tức thì</p>
        </header>

        {loading && <div className="pr-loading">Đang tải bảng giá...</div>}

        {!loading && services.length === 0 && (
          <div className="pr-empty">Chưa có dịch vụ nào</div>
        )}

        {!loading && services.length > 0 && (
          <div className="pr-cards">
            {services.map((s) => (
              <PriceCard key={s.id} service={s} />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .pr-page {
          min-height: 100vh;
          padding: 40px 16px 80px;
          position: relative;
          overflow: hidden;
        }
        .pr-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 15% 20%, rgba(167,139,250,.18), transparent 40%),
            radial-gradient(circle at 85% 80%, rgba(244,114,182,.15), transparent 40%);
          pointer-events: none;
        }
        .pr-wrap {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
        }
        .pr-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .pr-header h1 {
          font-size: 36px;
          font-weight: 800;
          margin: 0 0 8px;
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .pr-header p {
          color: #64748b;
          margin: 0;
          font-size: 15px;
        }
        .pr-loading,
        .pr-empty {
          text-align: center;
          color: #94a3b8;
          padding: 60px 0;
        }
        .pr-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        @media (max-width: 768px) {
          .pr-header h1 { font-size: 28px; }
        }
      `}</style>
    </main>
  );
}

function PriceCard({ service }: { service: Service }) {
  const theme = THEME[service.type] || THEME.gold;
  const features = parseFeatures(service.features);
  const packages = service.packages || [];

  return (
    <div
      className="pc-card"
      style={{
        borderColor: theme.border,
        background: `linear-gradient(180deg, #fff 0%, ${theme.bg} 100%)`,
      }}
    >
      <div className="pc-head">
        <h3 style={{ color: theme.accent }}>{service.name}</h3>
        <span className="pc-badge" style={{ background: theme.accent }}>
          {service.type.toUpperCase()}
        </span>
      </div>

      <p className="pc-desc">{service.description}</p>

      <div className="pc-feats">
        {features.map((f, i) => (
          <div key={i} className="pc-feat">
            <span className="pc-check" style={{ color: theme.accent }}>✓</span>
            <span>{f}</span>
          </div>
        ))}
      </div>

      <div className="pc-packs">
        {packages.length === 0 && (
          <a
            href={`/thanh-toan?serviceId=${service.slug}`}
            className="pc-pack"
            style={{ background: theme.accent, borderColor: theme.accent }}
          >
            <div className="pc-pack-name">Mua ngay</div>
            <div className="pc-pack-price">{formatPrice(service.price)}</div>
          </a>
        )}
        {packages.map((p) => (
          <a
            key={p.id}
            href={`/thanh-toan?serviceId=${service.slug}&packageId=${p.id}`}
            className="pc-pack"
            style={{ background: theme.accent, borderColor: theme.accent }}
          >
            <div className="pc-pack-name">{p.name}</div>
            <div className="pc-pack-price">{formatPrice(p.price)}</div>
          </a>
        ))}
      </div>

      <style jsx>{`
        .pc-card {
          border: 2px solid;
          border-radius: 24px;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          transition: transform .2s, box-shadow .2s;
          box-shadow: 0 8px 30px rgba(0,0,0,.04);
        }
        .pc-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,.08);
        }
        .pc-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .pc-head h3 {
          font-size: 22px;
          font-weight: 800;
          margin: 0;
        }
        .pc-badge {
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 999px;
          letter-spacing: 0.5px;
        }
        .pc-desc {
          color: #64748b;
          font-size: 13px;
          margin: 0 0 16px;
          line-height: 1.5;
        }
        .pc-feats {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
          flex: 1;
        }
        .pc-feat {
          display: flex;
          gap: 8px;
          font-size: 13px;
          color: #334155;
        }
        .pc-check {
          font-weight: 800;
          flex-shrink: 0;
        }
        .pc-packs {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .pc-pack {
          display: block;
          padding: 10px 8px;
          border-radius: 999px;
          color: #fff;
          text-decoration: none;
          text-align: center;
          font-weight: 700;
          font-size: 12px;
          transition: transform .15s, opacity .15s;
        }
        .pc-pack:hover {
          transform: scale(1.04);
          opacity: .92;
        }
        .pc-pack-name {
          line-height: 1.2;
        }
        .pc-pack-price {
          font-size: 11px;
          margin-top: 2px;
          opacity: .9;
        }
        @media (max-width: 400px) {
          .pc-packs { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
