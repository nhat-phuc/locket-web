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

// Fallback: dùng UI Avatars nếu không có picture
function getAvatarUrl(avatar: string | null, name: string): string {
  if (avatar && avatar.startsWith("http")) return avatar;
  const cleanName = name.replace(/\*/g, "").trim() || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=a78bfa&color=fff&size=128&bold=true`;
}

export default function RecentTransactions() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => {
      fetch("/api/recent-transactions")
        .then((r) => r.json())
        .then((d) => { if (d.success) setTxs(d.transactions); })
        .catch(() => {})
        .finally(() => setLoading(false));
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ textAlign: "center", marginTop: 40, marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-0)" }}>
          Lịch Sử Nạp Tiền
        </h2>
        <p style={{ color: "var(--text-2)", fontSize: 14, marginTop: 8 }}>
          Giao dịch mua gói VIP thành công gần đây
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-2)" }}>Đang tải...</div>
      )}

      {!loading && txs.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-2)", fontSize: 14 }}>
          Chưa có giao dịch nào trong 24h qua
        </div>
      )}

      {!loading && txs.length > 0 && (
        <div className="tx-grid">
          {txs.map((tx, i) => (
            <div key={tx.id} className="tx-card" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="tx-avatar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getAvatarUrl(tx.avatar, tx.name)} alt={tx.name} loading="lazy" />
              </div>

              <div className="tx-body">
                <div className="tx-name">{tx.name}</div>
                <div className="tx-badges">
                  <span className="tx-badge" style={{ background: tx.typeMeta.bg, color: tx.typeMeta.color }}>
                    {tx.typeMeta.icon} {tx.typeMeta.label}
                  </span>
                  {tx.discountPercent > 0 && (
                    <span className="tx-badge tx-badge-discount">✓ Giảm {tx.discountPercent}%</span>
                  )}
                </div>
                <div className="tx-time">{tx.time}</div>
              </div>

              <div className="tx-amount">+{tx.amount.toLocaleString("vi-VN")}đ</div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .tx-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 24px;
        }
        @media (max-width: 900px) { .tx-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .tx-grid { grid-template-columns: 1fr; } }
        .tx-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
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
        .tx-avatar {
          width: 52px;
          height: 52px;
          flex-shrink: 0;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid rgba(167,139,250,0.3);
          background: rgba(255,255,255,0.05);
        }
        .tx-avatar :global(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .tx-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
        .tx-name {
          font-size: 15px;
          font-weight: 800;
          color: var(--text-0);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tx-badges { display: flex; gap: 6px; flex-wrap: wrap; }
        .tx-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 9px;
          border-radius: 999px;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.2px;
          white-space: nowrap;
        }
        .tx-badge-discount { background: rgba(16,185,129,0.15); color: #10b981; }
        .tx-time { font-size: 11.5px; color: var(--text-2); }
        .tx-amount {
          flex-shrink: 0;
          font-size: 15px;
          font-weight: 900;
          color: #a78bfa;
          white-space: nowrap;
        }
      `}</style>
    </section>
  );
}
