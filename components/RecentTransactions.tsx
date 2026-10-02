"use client";

import { useEffect, useState } from "react";

interface Tx {
  id: string;
  kind: "order" | "recharge";
  name: string;
  initial: string;
  avatar: string | null;
  type: string;
  typeMeta: { icon: string; label: string; color: string; bg: string };
  amount: number;
  discount: number;
  discountPercent: number;
  time: string;
  timestamp: number;
}

const INITIAL_COUNT = 15;
const LOAD_MORE = 15;

function uiAvatar(name: string): string {
  const clean = name.replace(/\*/g, "").trim() || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(clean)}&background=7c3aed&color=fff&size=128&bold=true`;
}

export default function RecentTransactions() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const [shown, setShown] = useState(INITIAL_COUNT);

  useEffect(() => {
    const load = () => {
      fetch("/api/recent-transactions?limit=100")
        .then((r) => r.json())
        .then((d) => { if (d.success) setTxs(d.transactions); })
        .catch(() => {})
        .finally(() => setLoading(false));
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const visible = txs.slice(0, shown);
  const hasMore = shown < txs.length;
  const canCollapse = shown > INITIAL_COUNT;

  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ textAlign: "center", marginTop: 40, marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-0)" }}>Lịch Sử Nạp Tiền</h2>
        <p style={{ color: "var(--text-2)", fontSize: 14, marginTop: 8 }}>
          Giao dịch mua gói VIP thành công gần đây
        </p>
      </div>

      {loading && <div style={{ textAlign: "center", padding: 40, color: "var(--text-2)" }}>Đang tải...</div>}

      {!loading && txs.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-2)", fontSize: 14 }}>
          Chưa có giao dịch nào trong 24h qua
        </div>
      )}

      {!loading && txs.length > 0 && (
        <>
          <div className="tx-grid">
            {visible.map((tx, i) => {
              const useFallback = failed[tx.id] || !tx.avatar;
              const imgSrc = useFallback ? uiAvatar(tx.name) : tx.avatar!;

              return (
                <div
                  key={tx.id}
                  className="tx-card"
                  style={{
                    animationDelay: `${(i % LOAD_MORE) * 0.03}s`,
                    "--ring-color": tx.typeMeta.color,
                  } as React.CSSProperties}
                >
                  <div className="tx-avatar-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgSrc}
                      alt={tx.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="tx-avatar-img"
                      onError={() => {
                        if (!useFallback) setFailed((f) => ({ ...f, [tx.id]: true }));
                      }}
                    />
                  </div>

                  <div className="tx-body">
                    <div className="tx-head">
                      <span className="tx-name">{tx.name}</span>
                      <span
                        className="tx-type"
                        style={{ background: tx.typeMeta.bg, color: tx.typeMeta.color }}
                      >
                        {tx.typeMeta.icon} {tx.typeMeta.label}
                      </span>
                    </div>

                    {tx.discountPercent > 0 && (
                      <div className="tx-discount">✓ Giảm {tx.discountPercent}%</div>
                    )}

                    <div className="tx-bottom">
                      <span className="tx-time">{tx.time}</span>
                      <span className="tx-amount">+{tx.amount.toLocaleString("vi-VN")}đ</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="tx-actions">
            {hasMore && (
              <button onClick={() => setShown((s) => s + LOAD_MORE)} className="tx-btn tx-btn-more">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
                Xem thêm giao dịch
              </button>
            )}
            {canCollapse && (
              <button onClick={() => setShown(INITIAL_COUNT)} className="tx-btn tx-btn-collapse">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 15l-6-6-6 6" />
                </svg>
                Thu gọn
              </button>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        .tx-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 24px;
          width: 100%;
        }
        @media (max-width: 900px) {
          .tx-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .tx-grid { grid-template-columns: 1fr; gap: 10px; }
        }

        .tx-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          background: rgba(167, 139, 250, 0.04);
          border: 2px dashed rgba(167, 139, 250, 0.4);
          border-radius: 14px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: txFadeIn 0.5s ease both;
          width: 100%;
          box-sizing: border-box;
          overflow: hidden;
        }
        .tx-card:hover {
          transform: translateY(-3px);
          background: rgba(167, 139, 250, 0.08);
          border-color: rgba(167, 139, 250, 0.7);
          box-shadow: 0 12px 32px rgba(167, 139, 250, 0.2);
        }

        @keyframes txFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .tx-avatar-wrap {
          width: 56px;
          height: 56px;
          flex-shrink: 0;
          border-radius: 50%;
          padding: 2.5px;
          background: conic-gradient(
            from 0deg,
            var(--ring-color) 0%,
            var(--ring-color) 70%,
            rgba(255, 255, 255, 0.3) 85%,
            var(--ring-color) 100%
          );
          transition: all 0.3s;
          position: relative;
        }
        .tx-avatar-wrap::before {
          content: "";
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: var(--ring-color);
          opacity: 0.25;
          filter: blur(8px);
          z-index: -1;
          transition: opacity 0.3s;
        }
        .tx-card:hover .tx-avatar-wrap { transform: scale(1.05); }
        .tx-card:hover .tx-avatar-wrap::before { opacity: 0.5; }

        .tx-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          display: block;
          border: 2px solid var(--bg-0, #0a0a0f);
          background: #1a1230;
        }

        .tx-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
          overflow: hidden;
        }

        .tx-head {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .tx-name {
          font-size: 15px;
          font-weight: 800;
          color: var(--text-0);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        .tx-type {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.2px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .tx-discount {
          display: inline-block;
          padding: 3px 10px;
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border-radius: 999px;
          font-size: 10.5px;
          font-weight: 800;
          align-self: flex-start;
        }

        .tx-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 2px;
          flex-wrap: wrap;
        }
        .tx-time {
          font-size: 11.5px;
          color: var(--text-2);
          flex-shrink: 0;
        }
        .tx-amount {
          font-size: 16px;
          font-weight: 900;
          color: #a78bfa;
          white-space: nowrap;
          letter-spacing: -0.01em;
          flex-shrink: 0;
        }

        .tx-actions {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-top: 24px;
          flex-wrap: wrap;
        }
        .tx-btn {
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
        .tx-btn-more {
          background: rgba(167, 139, 250, 0.12);
          color: #a78bfa;
          border: 1.5px solid rgba(167, 139, 250, 0.3);
        }
        .tx-btn-more:hover {
          background: rgba(167, 139, 250, 0.2);
          border-color: rgba(167, 139, 250, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(167, 139, 250, 0.2);
        }
        .tx-btn-collapse {
          background: transparent;
          color: var(--text-2);
        }
        .tx-btn-collapse:hover { color: var(--text-0); }

        /* ═══ MOBILE ≤ 480px — Fix tràn số tiền ═══ */
        @media (max-width: 480px) {
          .tx-card {
            padding: 12px 12px;
            gap: 10px;
          }
          .tx-avatar-wrap {
            width: 44px;
            height: 44px;
            padding: 2px;
          }
          .tx-name {
            font-size: 14px;
          }
          .tx-type {
            font-size: 9px;
            padding: 2px 6px;
          }
          .tx-amount {
            font-size: 15px;
          }
          .tx-time {
            font-size: 11px;
          }
        }

        /* Mobile rất nhỏ */
        @media (max-width: 360px) {
          .tx-card {
            padding: 10px 10px;
            gap: 8px;
          }
          .tx-avatar-wrap {
            width: 40px;
            height: 40px;
          }
          .tx-name {
            font-size: 13px;
          }
          .tx-amount {
            font-size: 14px;
          }
        }
      `}</style>
    </section>
  );
}
