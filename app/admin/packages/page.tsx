"use client";
import { useEffect, useState } from "react";
import AdminPage from "@/components/admin/AdminPage";
export default function Page() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/admin/packages").then(r => r.json()).then(d => { if (d.success) setPackages(d.packages); }).finally(() => setLoading(false));
  }, []);
  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";
  return (
    <AdminPage title="Gói dịch vụ" description="Quản lý các gói của dịch vụ">
      {loading ? <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {packages.map(p => (
            <div key={p.id} style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 11, color: "var(--text-2)", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>{p.service?.name || "Dịch vụ"}</div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>{p.name}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "var(--accent-bright)", marginBottom: 8 }}>{fmt(p.price)}</div>
              <div style={{ fontSize: 13, color: "var(--text-2)" }}>⏱ {p.duration}</div>
            </div>
          ))}
          {packages.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "var(--text-2)", gridColumn: "1/-1" }}>Chưa có gói nào</div>}
        </div>
      )}
    </AdminPage>
  );
}
