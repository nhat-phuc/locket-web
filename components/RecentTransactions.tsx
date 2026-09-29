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
    const interval = setInterval(load, 60000);
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
              const imgSrc = useFallback ? null : tx.avatar!;

              return (
                <div key={tx.id} className="tx-card" style={{ animationDelay: `${(i % LOAD_MORE) * 0.03}s` }}>
                  {/* Avatar: ảnh user + viền màu, hoặc icon type */}
                  <div
                    className="tx-avatar-wrap"
                    style={{
                      background: imgSrc ? "transparent" : tx.typeMeta.bg,
                      borderColor: tx.typeMeta.color,
                    }}
                  >
                    {imgSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imgSrc}
                        alt={tx.name}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="tx-avatar-img"
                        onError={() => setFailed((f) => ({ ...f, [tx.id]: true }))}
                      />
                    ) : (
                      <span className="tx-avatar-icon">{tx.typeMeta.icon}</span>
                    )}
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
        .tx-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 24px; }
        @media (max-width: 900px) { .tx-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .tx-grid { grid-template-columns: 1fr; } }

        .tx-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015));
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: txFadeIn 0.5s ease both;
        }
        .tx-card:hover {
          transform: translateY(-3px);
          border-color: rgba(167,139,250,0.3);
          box-shadow: 0 12px 32px rgba(0,0,0,0.25);
        }
        @keyframes txFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Avatar wrapper — hình tròn có viền màu */
        .tx-avatar-wrap {
          width: 56px;
          height: 56px;
          flex-shrink: 0;
          border-radius: 50%;
          display: grid;
          place-items: center;
          border: 2.5px solid;  /* màu set inline */
          overflow: hidden;
          position: relative;
          transition: all 0.3s;
        }
        .tx-card:hover .tx-avatar-wrap {
          transform: scale(1.05);
          box-shadow: 0 0 20px currentColor;
        }

        .tx-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: 50%;
        }

        .tx-avatar-icon {
          font-size: 26px;
          line-height: 1;
        }

        .tx-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        /* Header: tên + type badge cùng dòng */
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
          background: rgba(16,185,129,0.15);
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
        }
        .tx-time {
          font-size: 11.5px;
          color: var(--text-2);
        }
        .tx-amount {
          font-size: 16px;
          font-weight: 900;
          color: #a78bfa;
          white-space: nowrap;
          letter-spacing: -0.01em;
        }

        /* Actions */
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
          background: rgba(167,139,250,0.12);
          color: #a78bfa;
          border: 1.5px solid rgba(167,139,250,0.3);
        }
        .tx-btn-more:hover {
          background: rgba(167,139,250,0.2);
          border-color: rgba(167,139,250,0.5);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(167,139,250,0.2);
        }
        .tx-btn-collapse {
          background: transparent;
          color: var(--text-2);
        }
        .tx-btn-collapse:hover { color: var(--text-0); }
      `}</style>
    </section>
  );
}
