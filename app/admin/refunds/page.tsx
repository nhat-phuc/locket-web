"use client";

import { useEffect, useState } from "react";

export default function AdminRefundsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/admin/refunds")
      .then((r) => r.json())
      .then((d) => { if (d.success) setOrders(d.orders || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRefund = async (id: string) => {
    if (!confirm("Hoàn tiền đơn này?")) return;
    const res = await fetch("/api/admin/refunds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: id }),
    });
    const data = await res.json();
    if (data.success) { alert("Đã hoàn tiền"); load(); }
    else alert(data.message || "Lỗi");
  };

  return (
    <main className="arf-page">
      <div className="arf-container">
        <h1 className="arf-title">💸 Hoàn tiền</h1>
        <p className="arf-sub">Xử lý yêu cầu hoàn tiền</p>

        {loading ? (
          <div className="arf-loading">Đang tải...</div>
        ) : orders.length === 0 ? (
          <div className="arf-empty">Không có yêu cầu hoàn tiền</div>
        ) : (
          <div className="arf-list">
            {orders.map((o) => (
              <div key={o.id} className="arf-row">
                <div>
                  <div className="arf-code">#{o.orderCode}</div>
                  <div className="arf-name">{o.serviceName}</div>
                  <div className="arf-user">{o.user?.email}</div>
                </div>
                <div className="arf-amount">{o.finalAmount.toLocaleString("vi-VN")}đ</div>
                <button className="arf-btn" onClick={() => handleRefund(o.id)}>
                  💸 Hoàn tiền
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        .arf-page { min-height: 100vh; padding: 32px 20px 80px; background: var(--bg-0); }
        .arf-container { max-width: 900px; margin: 0 auto; }
        .arf-title { font-size: 26px; font-weight: 900; color: var(--text-0); margin: 0 0 4px; }
        .arf-sub { font-size: 13px; color: var(--text-2); margin: 0 0 20px; }
        .arf-loading, .arf-empty { text-align: center; padding: 60px; color: var(--text-2); }
        .arf-list { display: flex; flex-direction: column; gap: 10px; }
        .arf-row { display: grid; grid-template-columns: 2fr 1fr auto; gap: 12px; align-items: center; padding: 16px; border-radius: 14px; background: rgba(255,255,255,0.7); border: 1.5px solid rgba(167,139,250,0.2); }
        .arf-code { font-size: 12px; font-weight: 800; color: var(--text-0); }
        .arf-name { font-size: 13px; color: var(--text-1); margin-top: 2px; }
        .arf-user { font-size: 11px; color: var(--text-2); margin-top: 2px; }
        .arf-amount { font-size: 15px; font-weight: 900; color: #22c55e; }
        .arf-btn { padding: 10px 16px; border-radius: 10px; background: linear-gradient(135deg,#ef4444,#dc2626); color: #fff; border: none; font-size: 12px; font-weight: 800; cursor: pointer; }
      `}</style>
    </main>
  );
}
