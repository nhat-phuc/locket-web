"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  description: string;
  price: number;
  originalPrice?: number | null;
  features: string;
  isFeatured?: boolean;
  packages?: Pkg[];
}

const THEME: Record<string, { grad: string; border: string; text: string; icon: string }> = {
  gold:    { grad: "linear-gradient(135deg,#fef3c7,#fde68a)", border: "#fcd34d", text: "#b45309", icon: "🥇" },
  vip:     { grad: "linear-gradient(135deg,#ede9fe,#ddd6fe)", border: "#c4b5fd", text: "#6d28d9", icon: "💎" },
  luxury:  { grad: "linear-gradient(135deg,#fce7f3,#fbcfe8)", border: "#f9a8d4", text: "#be185d", icon: "👑" },
  premium: { grad: "linear-gradient(135deg,#fce7f3,#f9a8d4)", border: "#ec4899", text: "#9d174d", icon: "🌟" },
};

function fmt(n: number) {
  return (n || 0).toLocaleString("vi-VN") + "đ";
}

function parseFeatures(s: string): string[] {
  try {
    const arr = JSON.parse(s);
    if (Array.isArray(arr)) return arr;
  } catch {}
  return s.split("\n").filter(Boolean);
}

export default function DichVuPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>({});

  const load = () => {
    setLoading(true);
    setError(null);
    fetch("/api/services?t=" + Date.now(), { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setServices(d.services || []);
          const init: Record<string, string> = {};
          for (const s of d.services || []) {
            if (s.packages?.[0]) init[s.id] = s.packages[0].id;
          }
          setSelected(init);
        } else {
          setError(d.message || "Lỗi tải dữ liệu");
        }
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <main style={{ minHeight: "80vh", paddingTop: 32, paddingBottom: 60 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            display: "inline-block",
            padding: "6px 16px",
            background: "linear-gradient(135deg,#fce7f3,#fbcfe8)",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 800,
            color: "#be185d",
            marginBottom: 16,
            letterSpacing: 0.5,
          }}>
            ✨ BẢNG GIÁ DỊCH VỤ
          </div>
          <h1 style={{
            fontSize: 36,
            fontWeight: 900,
            marginBottom: 12,
            background: "linear-gradient(135deg,#be185d,#ec4899,#f472b6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Chọn gói phù hợp với bạn
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 15, margin: 0 }}>
            Thanh toán tự động — kích hoạt tức thì qua Telegram
          </p>
        </div>

        {/* Debug nút reload */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <button
            onClick={load}
            style={{
              padding: "8px 16px",
              background: "#fff",
              border: "1px solid #fbcfe8",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              color: "#ec4899",
              cursor: "pointer",
            }}
          >
            🔄 Tải lại
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: 80, color: "#ec4899" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💖</div>
            Đang tải bảng giá...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{
            textAlign: "center",
            padding: 40,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 16,
            color: "#dc2626",
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Lỗi tải dữ liệu</div>
            <div style={{ fontSize: 13, fontFamily: "monospace", opacity: 0.7 }}>{error}</div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && services.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: 60,
            background: "#fff",
            border: "2px dashed #fbcfe8",
            borderRadius: 20,
            color: "var(--text-2)",
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎀</div>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>
              Chưa có dịch vụ nào
            </div>
            <div style={{ fontSize: 13, marginBottom: 20 }}>
              Database chưa có service. Kiểm tra lại kết nối DB.
            </div>
            <button
              onClick={load}
              style={{
                padding: "10px 20px",
                background: "linear-gradient(135deg,#ec4899,#f472b6)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              🔄 Thử lại
            </button>
          </div>
        )}

        {/* Services */}
        {!loading && services.length > 0 && (
          <>
            <div style={{
              textAlign: "center",
              marginBottom: 20,
              fontSize: 13,
              color: "#10b981",
              fontWeight: 700,
            }}>
              ✅ Tìm thấy {services.length} dịch vụ
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
              gap: 24,
            }}>
              {services.map((s) => (
                <ServiceCard
                  key={s.id}
                  service={s}
                  selectedPkgId={selected[s.id]}
                  onSelect={(pid) => setSelected((p) => ({ ...p, [s.id]: pid }))}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function ServiceCard({
  service,
  selectedPkgId,
  onSelect,
}: {
  service: Service;
  selectedPkgId?: string;
  onSelect: (pid: string) => void;
}) {
  const theme = THEME[service.type] || THEME.vip;
  const features = parseFeatures(service.features);
  const selectedPkg =
    service.packages?.find((p) => p.id === selectedPkgId) ||
    service.packages?.[0];

  return (
    <div style={{
      background: "#fff",
      borderRadius: 24,
      border: `2px solid ${theme.border}`,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      boxShadow: `0 8px 32px ${theme.border}33`,
      position: "relative",
    }}>
      {service.isFeatured && (
        <div style={{
          position: "absolute",
          top: 14,
          right: 14,
          background: theme.grad,
          color: theme.text,
          padding: "4px 12px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 900,
          zIndex: 2,
        }}>🔥 HOT</div>
      )}

      <div style={{
        background: theme.grad,
        padding: "28px 24px 20px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>{theme.icon}</div>
        <h3 style={{
          fontSize: 22,
          fontWeight: 900,
          color: theme.text,
          margin: 0,
          marginBottom: 6,
        }}>{service.name}</h3>
        <p style={{
          fontSize: 13,
          color: theme.text,
          margin: 0,
          opacity: 0.85,
          fontWeight: 600,
        }}>{service.description}</p>
      </div>

      {features.length > 0 && (
        <div style={{ padding: "20px 24px 0" }}>
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            color: "var(--text-2)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 12,
          }}>✨ Tính năng</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {features.map((f, i) => (
              <li key={i} style={{
                display: "flex",
                gap: 8,
                marginBottom: 8,
                fontSize: 13,
                color: "var(--text-1)",
              }}>
                <span style={{ color: theme.text, fontWeight: 900 }}>✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {service.packages && service.packages.length > 0 && (
        <div style={{ padding: "20px 24px 0" }}>
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            color: "var(--text-2)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 10,
          }}>📦 Chọn thời hạn</div>
          <div style={{ display: "grid", gap: 8 }}>
            {service.packages.map((p) => {
              const isSel = p.id === selectedPkg?.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelect(p.id)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    background: isSel ? theme.grad : "#f9fafb",
                    border: isSel ? `2px solid ${theme.text}` : "2px solid #f3f4f6",
                    borderRadius: 12,
                    cursor: "pointer",
                    transition: "all .15s",
                    textAlign: "left",
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: isSel ? theme.text : "var(--text-0)",
                    }}>{p.name}</div>
                  </div>
                  <div style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: isSel ? theme.text : "var(--text-0)",
                  }}>{fmt(p.price)}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ padding: 24, marginTop: "auto" }}>
        <Link
          href={selectedPkg
            ? `/thanh-toan?service=${service.slug}&package=${selectedPkg.id}`
            : `/thanh-toan?service=${service.slug}`}
          style={{
            display: "block",
            width: "100%",
            padding: "14px 20px",
            background: theme.grad,
            color: theme.text,
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 900,
            textAlign: "center",
            textDecoration: "none",
            letterSpacing: 0.3,
          }}
        >
          🚀 Mua ngay — {selectedPkg ? fmt(selectedPkg.price) : "Liên hệ"}
        </Link>
      </div>
    </div>
  );
}
