"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TxItem {
  id: string;
  kind: "recharge" | "order";
  title: string;
  description: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function LichSuNapTienPage() {
  const router = useRouter();
  const [items, setItems] = useState<TxItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("locket_user");
    if (!stored) { router.push("/dang-nhap"); return; }

    Promise.all([
      fetch("/api/users/transactions", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/users/orders", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([txRes, orderRes]) => {
        const list: TxItem[] = [];

        // 1. Nạp tiền
        if (txRes.success) {
          const recharges = (txRes.transactions || []).filter((t: any) =>
            ["recharge", "deposit", "admin_recharge"].includes(t.type)
          );
          for (const t of recharges) {
            list.push({
              id: `tx-${t.id}`,
              kind: "recharge",
              title: t.type === "admin_recharge" ? "Admin cộng tiền" : "Nạp tiền",
              description: t.description || "Nạp tiền vào ví",
              amount: Math.abs(t.amount),
              status: t.status,
              createdAt: t.createdAt,
            });
          }
        }

        // 2. Mua gói
        if (orderRes.success) {
          const orders = (orderRes.orders || []).filter((o: any) =>
            ["paid", "completed", "processing"].includes(o.status)
          );
          for (const o of orders) {
            list.push({
              id: `order-${o.id}`,
              kind: "order",
              title: `Mua gói: ${o.serviceName}`,
              description: `Mã đơn: ${o.orderCode}`,
              amount: o.finalAmount,
              status: o.status,
              createdAt: o.paidAt || o.createdAt,
            });
          }
        }

        // Sort mới nhất trước
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setItems(list);
      })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: "#0f0a1e" }}>
        📥 Lịch sử giao dịch
      </h1>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>
        Cả nạp tiền và mua gói VIP
      </p>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Đang tải...</div>
      ) : items.length === 0 ? (
        <div style={{
          padding: 40, textAlign: "center", background: "#faf5ff",
          borderRadius: 16, border: "1px dashed #e9d5ff", color: "#94a3b8",
        }}>
          Chưa có giao dịch nào
          <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/nap-tien" style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #10b981, #34d399)",
              color: "#fff", textDecoration: "none", borderRadius: 999,
              fontWeight: 800, fontSize: 14,
            }}>
              + Nạp tiền
            </Link>
            <Link href="/bang-gia" style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              color: "#fff", textDecoration: "none", borderRadius: 999,
              fontWeight: 800, fontSize: 14,
            }}>
              🛍️ Mua gói
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((it) => {
            const isRecharge = it.kind === "recharge";
            const color = isRecharge ? "#10b981" : "#7c3aed";
            const bg = isRecharge ? "#ecfdf5" : "#f5f3ff";
            const icon = isRecharge ? "🎉" : "🛍️";
            const success = ["completed", "success", "paid"].includes(it.status);

            return (
              <div key={it.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "14px 16px", background: "#fff",
                border: "1px solid #f1f5f9", borderRadius: 12,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: bg, display: "grid", placeItems: "center",
                  fontSize: 22, flexShrink: 0,
                }}>
                  {icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 3 }}>
                    {it.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2, wordBreak: "break-word" }}>
                    {it.description}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    {new Date(it.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color, whiteSpace: "nowrap" }}>
                    +{it.amount.toLocaleString("vi-VN")}đ
                  </div>
                  <div style={{
                    fontSize: 10.5, fontWeight: 700, marginTop: 3,
                    color: success ? "#10b981" : "#f59e0b",
                  }}>
                    {success ? "✓ Thành công" : "⏳ Chờ"}
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
