"use client";

import { useEffect, useState } from "react";

interface Coupon {
  id: string;
  code: string;
  discountType: string; // "percent" | "fixed"
  discountValue: number;
  minOrder: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function MaGiamGiaPage() {
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");

  useEffect(() => {
    fetch("/api/coupons/my")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCoupons(d.coupons || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const isExpired = (c: Coupon) => {
    if (!c.expiresAt) return false;
    return new Date(c.expiresAt) < new Date();
  };

  const isOutOfStock = (c: Coupon) => {
    if (!c.usageLimit) return false;
    return c.usedCount >= c.usageLimit;
  };

  const filtered = coupons.filter((c) => {
    if (filter === "active") return !isExpired(c) && !isOutOfStock(c);
    if (filter === "expired") return isExpired(c) || isOutOfStock(c);
    return true;
  });

  const formatVND = (n: number) => n.toLocaleString("vi-VN") + "đ";
  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "var(--text-2)" }}>
        Đang tải...
      </div>
    );
  }

  return (
    <>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>
        🎟️ Mã giảm giá
      </h1>
      <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 20 }}>
        Sao chép mã và dán vào ô "Mã giảm giá" khi thanh toán
      </p>

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>
          Tất cả ({coupons.length})
        </FilterBtn>
        <FilterBtn
          active={filter === "active"}
          onClick={() => setFilter("active")}
        >
          Còn hiệu lực (
          {coupons.filter((c) => !isExpired(c) && !isOutOfStock(c)).length})
        </FilterBtn>
        <FilterBtn
          active={filter === "expired"}
          onClick={() => setFilter("expired")}
        >
          Hết hạn / Hết lượt (
          {coupons.filter((c) => isExpired(c) || isOutOfStock(c)).length})
        </FilterBtn>
      </div>

      {/* Coupons list */}
      {filtered.length === 0 ? (
        <div
          style={{
            padding: 60,
            textAlign: "center",
            color: "var(--text-2)",
            background: "var(--bg-1)",
            borderRadius: 16,
            border: "1px dashed var(--border)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎟️</div>
          <p style={{ fontSize: 15, fontWeight: 600 }}>
            {filter === "all"
              ? "Chưa có mã giảm giá nào"
              : filter === "active"
              ? "Không có mã nào còn hiệu lực"
              : "Không có mã nào hết hạn"}
          </p>
          <p style={{ fontSize: 13, marginTop: 8 }}>
            Theo dõi Fanpage để nhận mã mới
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((c) => {
            const expired = isExpired(c);
            const outOfStock = isOutOfStock(c);
            const disabled = expired || outOfStock;
            const isPercent = c.discountType === "percent";

            return (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  background: "var(--bg-1)",
                  borderRadius: 14,
                  overflow: "hidden",
                  border: `1.5px solid ${
                    disabled
                      ? "var(--border)"
                      : "rgba(124, 58, 237, 0.3)"
                  }`,
                  opacity: disabled ? 0.6 : 1,
                }}
              >
                {/* Left: discount badge */}
                <div
                  style={{
                    width: 110,
                    background: disabled
                      ? "linear-gradient(135deg, #6b7280, #9ca3af)"
                      : "linear-gradient(135deg, #7c3aed, #a78bfa)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    padding: 12,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      lineHeight: 1.1,
                    }}
                  >
                    {isPercent
                      ? `-${c.discountValue}%`
                      : `-${Math.round(c.discountValue / 1000)}K`}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 0.5,
                      marginTop: 4,
                      opacity: 0.9,
                    }}
                  >
                    GIẢM GIÁ
                  </div>
                  {/* Notch circle */}
                  <div
                    style={{
                      position: "absolute",
                      right: -8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "var(--bg-1)",
                      border: `1.5px solid ${
                        disabled
                          ? "var(--border)"
                          : "rgba(124, 58, 237, 0.3)"
                      }`,
                      borderLeft: "none",
                    }}
                  />
                </div>

                {/* Right: info */}
                <div
                  style={{
                    flex: 1,
                    padding: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "var(--text-0)",
                      }}
                    >
                      {isPercent
                        ? `Giảm ${c.discountValue}%`
                        : `Giảm ${formatVND(c.discountValue)}`}
                    </div>
                    {c.maxDiscount && isPercent && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--text-2)",
                          fontWeight: 600,
                        }}
                      >
                        (tối đa {formatVND(c.maxDiscount)})
                      </span>
                    )}
                  </div>

                  {c.minOrder > 0 && (
                    <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                      Đơn tối thiểu {formatVND(c.minOrder)}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                      fontSize: 11.5,
                      color: "var(--text-2)",
                      marginTop: 2,
                    }}
                  >
                    {c.expiresAt && (
                      <span>📅 HSD: {formatDate(c.expiresAt)}</span>
                    )}
                    {c.usageLimit && (
                      <span>
                        • Còn {Math.max(0, c.usageLimit - c.usedCount)} lượt
                      </span>
                    )}
                  </div>

                  {disabled && (
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#ef4444",
                        marginTop: 2,
                      }}
                    >
                      {expired ? "❌ Đã hết hạn" : "❌ Đã hết lượt"}
                    </div>
                  )}

                  {/* Copy button */}
                  {!disabled && (
                    <button
                      onClick={() => copyCode(c.code)}
                      style={{
                        marginTop: 6,
                        padding: "8px 14px",
                        background:
                          copied === c.code
                            ? "linear-gradient(135deg, #10b981, #34d399)"
                            : "linear-gradient(135deg, #7c3aed, #a78bfa)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        fontWeight: 800,
                        fontSize: 13,
                        cursor: "pointer",
                        fontFamily: "monospace",
                        letterSpacing: 1,
                        transition: "all 0.2s",
                      }}
                    >
                      {copied === c.code ? "✅ Đã sao chép!" : `📋 ${c.code}`}
                    </button>
                  )}

                  {disabled && (
                    <div
                      style={{
                        marginTop: 6,
                        padding: "8px 14px",
                        background: "var(--bg-2)",
                        color: "var(--text-2)",
                        borderRadius: 10,
                        fontWeight: 800,
                        fontSize: 13,
                        fontFamily: "monospace",
                        letterSpacing: 1,
                        textAlign: "center",
                      }}
                    >
                      {c.code}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        background: active
          ? "linear-gradient(135deg, #7c3aed, #a78bfa)"
          : "var(--bg-1)",
        color: active ? "#fff" : "var(--text-1)",
        border: active
          ? "none"
          : "1.5px solid var(--border)",
        borderRadius: 999,
        fontWeight: 700,
        fontSize: 13,
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "all 0.2s",
      }}
    >
      {children}
    </button>
  );
}
