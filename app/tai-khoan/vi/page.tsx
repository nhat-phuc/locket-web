"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ViPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("locket_user");
    if (!stored) { router.push("/dang-nhap"); return; }
    const u = JSON.parse(stored);
    setUser(u);

    Promise.all([
      fetch(`/api/balance?email=${encodeURIComponent(u.email)}`).then((r) => r.json()),
      fetch("/api/users/transactions", { credentials: "include" }).then((r) => r.json()),
    ]).then(([b, t]) => {
      if (typeof b.balance === "number") setBalance(b.balance);
      if (t.success) setTxs(t.transactions || []);
    }).finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div style={{ padding: 60, textAlign: "center" }}>Đang tải...</div>;

  const typeLabels: Record<string, string> = {
    recharge: "Nạp tiền",
    deposit: "Nạp tiền",
    admin_recharge: "Admin cộng",
    withdraw: "Rút tiền",
    purchase: "Mua dịch vụ",
    payment: "Thanh toán",
    refund: "Hoàn tiền",
    bonus: "Thưởng",
    referral_bonus: "Hoa hồng giới thiệu",
    gift: "Quà tặng",
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "#0f0a1e" }}>💳 Ví tiền</h1>

      {/* Số dư */}
      <div style={{
        background: "linear-gradient(135deg, #a78bfa, #ec4899)",
        borderRadius: 20, padding: 32, color: "#fff",
        marginBottom: 24, boxShadow: "0 12px 40px rgba(167,139,250,.4)",
      }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, opacity: .9, marginBottom: 8 }}>
          SỐ DƯ HIỆN TẠI
        </div>
        <div style={{ fontSize: 42, fontWeight: 900, marginBottom: 20 }}>
          {balance.toLocaleString("vi-VN")}đ
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/nap-tien" style={{
            background: "#fff", color: "#7c3aed", padding: "12px 24px",
            borderRadius: 999, textDecoration: "none", fontWeight: 800, fontSize: 14,
          }}>
            + Nạp tiền
          </Link>
          <Link href="/rut-tien" style={{
            background: "rgba(255,255,255,.2)", color: "#fff", padding: "12px 24px",
            borderRadius: 999, textDecoration: "none", fontWeight: 800, fontSize: 14,
            border: "1px solid rgba(255,255,255,.4)",
          }}>
            - Rút tiền
          </Link>
        </div>
      </div>

      {/* Lịch sử */}
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: "#0f0a1e" }}>
        📜 Lịch sử giao dịch ({txs.length})
      </h2>

      {txs.length === 0 ? (
        <div style={{
          padding: 40, textAlign: "center", background: "#faf5ff",
          borderRadius: 16, border: "1px dashed #e9d5ff", color: "#94a3b8",
        }}>
          Chưa có giao dịch nào
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {txs.map((tx) => {
            const isPlus = ["recharge", "deposit", "admin_recharge", "refund", "bonus", "referral_bonus", "gift"].includes(tx.type);
            return (
              <div key={tx.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 16px", background: "#fff", border: "1px solid #f1f5f9",
                borderRadius: 12, gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0f0a1e", marginBottom: 3 }}>
                    {typeLabels[tx.type] || tx.type}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>
                    {tx.description || "—"}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    {new Date(tx.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{
                    fontSize: 15, fontWeight: 900,
                    color: isPlus ? "#10b981" : "#ef4444",
                    whiteSpace: "nowrap",
                  }}>
                    {isPlus ? "+" : "-"}{Math.abs(tx.amount).toLocaleString("vi-VN")}đ
                  </div>
                  <div style={{
                    fontSize: 10.5, fontWeight: 700, marginTop: 3,
                    color: tx.status === "completed" || tx.status === "success" ? "#10b981" : "#f59e0b",
                  }}>
                    {tx.status === "completed" || tx.status === "success" ? "✓ Thành công" : "⏳ Chờ"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
