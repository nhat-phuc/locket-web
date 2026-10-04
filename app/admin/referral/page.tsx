"use client";
import { useEffect, useState } from "react";
import AdminPage from "@/components/admin/AdminPage";
export default function Page() {
  const [data, setData] = useState<any>({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/admin/referral").then(r => r.json()).then(d => { if (d.success) setData(d); }).finally(() => setLoading(false));
  }, []);
  return (
    <AdminPage title="Mã giới thiệu" description="Quản lý hoa hồng giới thiệu">
      {loading ? <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div> : (
        <div>
          <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "var(--text-2)", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Tổng hoa hồng đã trả</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "var(--accent-bright)" }}>{(data.total || 0).toLocaleString("vi-VN")}đ</div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {(data.items || []).map((it: any, i: number) => (
              <div key={i} style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13 }}>@{it.username}</span>
                <b style={{ color: "#34d399" }}>+{(it.amount || 0).toLocaleString("vi-VN")}đ</b>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminPage>
  );
}
