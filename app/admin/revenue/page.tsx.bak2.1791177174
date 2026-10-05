"use client";
import { useEffect, useState } from "react";
import AdminPage from "@/components/admin/AdminPage";
export default function Page() {
  const [data, setData] = useState<any>({ total: 0, today: 0, month: 0, items: [] });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/admin/revenue").then(r => r.json()).then(d => { if (d.success) setData(d); }).finally(() => setLoading(false));
  }, []);
  const fmt = (n: number) => (n || 0).toLocaleString("vi-VN") + "đ";
  return (
    <AdminPage title="Doanh thu" description="Thống kê doanh thu hệ thống">
      {loading ? <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div> : (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
            <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 11, color: "var(--text-2)", textTransform: "uppercase", fontWeight: 700 }}>Hôm nay</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#34d399", marginTop: 6 }}>{fmt(data.today)}</div>
            </div>
            <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 11, color: "var(--text-2)", textTransform: "uppercase", fontWeight: 700 }}>Tháng này</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#60a5fa", marginTop: 6 }}>{fmt(data.month)}</div>
            </div>
            <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 11, color: "var(--text-2)", textTransform: "uppercase", fontWeight: 700 }}>Tổng cộng</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "var(--accent-bright)", marginTop: 6 }}>{fmt(data.total)}</div>
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
