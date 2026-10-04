"use client";
import { useEffect, useState } from "react";
import AdminPage from "@/components/admin/AdminPage";
export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/admin/reports").then(r => r.json()).then(d => { if (d.success) setItems(d.items || []); }).finally(() => setLoading(false));
  }, []);
  return (
    <AdminPage title="Báo cáo vi phạm" description="Xử lý báo cáo từ người dùng">
      {loading ? <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div> : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((it: any) => (
            <div key={it.id} style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <b style={{ fontSize: 14 }}>{it.title || "Báo cáo"}</b>
                <span style={{ fontSize: 11, color: "var(--text-2)" }}>{new Date(it.createdAt).toLocaleString("vi-VN")}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-1)" }}>{it.content}</div>
            </div>
          ))}
          {items.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "var(--text-2)" }}>Không có báo cáo</div>}
        </div>
      )}
    </AdminPage>
  );
}
