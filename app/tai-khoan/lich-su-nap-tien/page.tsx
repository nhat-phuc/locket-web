"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LichSuNapTienPage() {
  const router = useRouter();
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("locket_user");
    if (!stored) { router.push("/dang-nhap"); return; }

    fetch("/api/users/transactions", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const recharges = (d.transactions || []).filter(
            (t: any) => ["recharge", "deposit", "admin_recharge"].includes(t.type)
          );
          setTxs(recharges);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "#0f0a1e" }}>
        📥 Lịch sử nạp tiền
      </h1>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Đang tải...</div>
      ) : txs.length === 0 ? (
        <div style={{
          padding: 40, textAlign: "center", background: "#faf5ff",
          borderRadius: 16, border: "1px dashed #e9d5ff", color: "#94a3b8",
        }}>
          Chưa có giao dịch nạp nào
          <div style={{ marginTop: 16 }}>
            <Link href="/nap-tien" style={{
              display: "inline-block",
              padding: "12px 24px",
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              color: "#fff", textDecoration: "none", borderRadius: 999,
              fontWeight: 800, fontSize: 14,
            }}>
              + Nạp tiền ngay
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {txs.map((tx) => (
            <div key={tx.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 16px", background: "#fff",
              border: "1px solid #f1f5f9", borderRadius: 12, gap: 12,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0f1a1e", marginBottom: 3 }}>
                  {tx.type === "admin_recharge" ? "Admin cộng tiền" : "Nạp tiền"}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2, wordBreak: "break-word" }}>
                  {tx.description || "—"}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>
                  {new Date(tx.createdAt).toLocaleString("vi-VN")}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#10b981", whiteSpace: "nowrap" }}>
                  +{Math.abs(tx.amount).toLocaleString("vi-VN")}đ
                </div>
                <div style={{
                  fontSize: 10.5, fontWeight: 700, marginTop: 3,
                  color: tx.status === "completed" || tx.status === "success" ? "#10b981" : "#f59e0b",
                }}>
                  {tx.status === "completed" || tx.status === "success" ? "✓ Thành công" : "⏳ Chờ"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
