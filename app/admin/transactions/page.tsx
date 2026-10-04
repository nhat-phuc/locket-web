"use client";
import { useEffect, useState } from "react";
import AdminPage from "@/components/admin/AdminPage";
export default function Page() {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
  useEffect(() => {
    fetch(`/api/admin/transactions${type ? "?type=" + type : ""}`).then(r => r.json()).then(d => { if (d.success) setTxs(d.transactions); }).finally(() => setLoading(false));
  }, [type]);
  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";
  return (
    <AdminPage title="Giao dịch" description="Tất cả giao dịch trong hệ thống">
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["", "deposit", "recharge", "payment", "withdraw", "refund", "bonus"].map(t => (
          <button key={t} onClick={() => setType(t)} className="admin-btn" style={{ background: type === t ? "var(--accent)" : undefined, color: type === t ? "#fff" : undefined, fontSize: 13 }}>
            {t || "Tất cả"}
          </button>
        ))}
      </div>
      {loading ? <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div> : (
        <div style={{ display: "grid", gap: 10 }}>
          {txs.map(t => (
            <div key={t.id} style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>@{t.user?.username || "?"}</span>
                <span style={{ fontWeight: 800, fontSize: 15, color: t.amount > 0 ? "#34d399" : "#f87171" }}>{t.amount > 0 ? "+" : ""}{fmt(t.amount)}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 4 }}>{t.description}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-2)" }}>
                <span>{t.type} · {t.method}</span>
                <span>{new Date(t.createdAt).toLocaleString("vi-VN")}</span>
              </div>
            </div>
          ))}
          {txs.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "var(--text-2)" }}>Không có giao dịch</div>}
        </div>
      )}
    </AdminPage>
  );
}
