"use client";

import { useEffect, useState } from "react";

interface DayRevenue {
  date: string;
  amount: number;
  count: number;
}

export default function AdminRevenuePage() {
  const [data, setData] = useState<DayRevenue[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/revenue")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setData(d.days || []);
          setTotal(d.total || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  return (
    <main className="ar-page">
      <div className="ar-container">
        <h1 className="ar-title">💰 Doanh thu</h1>
        <p className="ar-sub">Biểu đồ 30 ngày gần nhất</p>

        <div className="ar-total">
          <div className="ar-total-label">Tổng doanh thu</div>
          <div className="ar-total-value">{total.toLocaleString("vi-VN")}đ</div>
        </div>

        {loading ? (
          <div className="ar-loading">Đang tải...</div>
        ) : (
          <div className="ar-chart">
            {data.map((d) => (
              <div key={d.date} className="ar-bar-wrap" title={`${d.date}: ${d.amount.toLocaleString("vi-VN")}đ`}>
                <div
                  className="ar-bar"
                  style={{ height: `${(d.amount / maxAmount) * 100}%` }}
                >
                  <span className="ar-bar-value">
                    {d.amount > 0 ? (d.amount / 1000).toFixed(0) + "k" : ""}
                  </span>
                </div>
                <div className="ar-bar-date">{d.date.slice(5)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        .ar-page { min-height: 100vh; padding: 32px 20px 80px; background: var(--bg-0); }
        .ar-container { max-width: 1000px; margin: 0 auto; }
        .ar-title { font-size: 26px; font-weight: 900; color: var(--text-0); margin: 0 0 4px; }
        .ar-sub { font-size: 13px; color: var(--text-2); margin: 0 0 20px; }
        .ar-total { padding: 20px; border-radius: 16px; background: linear-gradient(135deg,#22c55e,#16a34a); color: #fff; margin-bottom: 24px; }
        .ar-total-label { font-size: 12px; opacity: 0.9; font-weight: 700; text-transform: uppercase; }
        .ar-total-value { font-size: 32px; font-weight: 900; margin-top: 4px; }
        .ar-loading { text-align: center; padding: 60px; color: var(--text-2); }
        .ar-chart { display: flex; align-items: flex-end; gap: 4px; height: 300px; padding: 20px; border-radius: 16px; background: rgba(255,255,255,0.7); border: 1.5px solid rgba(167,139,250,0.2); }
        .ar-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
        .ar-bar { width: 100%; min-height: 2px; border-radius: 4px 4px 0 0; background: linear-gradient(180deg,#a78bfa,#7c3aed); position: relative; transition: all 0.3s; }
        .ar-bar:hover { background: linear-gradient(180deg,#ec4899,#a78bfa); }
        .ar-bar-value { position: absolute; top: -16px; left: 50%; transform: translateX(-50%); font-size: 9px; font-weight: 700; color: var(--text-1); white-space: nowrap; }
        .ar-bar-date { font-size: 9px; color: var(--text-2); }
      `}</style>
    </main>
  );
}
