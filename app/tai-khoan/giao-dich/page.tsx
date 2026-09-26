"use client";

import { useEffect, useState } from "react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: string;
  description: string;
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  deposit: "Nạp tiền",
  withdraw: "Rút tiền",
  purchase: "Mua hàng",
  refund: "Hoàn tiền",
  bonus: "Thưởng",
};

export default function GiaoDichPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/transactions")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTransactions(data.transactions);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>Lịch sử giao dịch</h1>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-2)" }}>Đang tải...</div>
      ) : transactions.length === 0 ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--text-2)", background: "var(--bg-1)", borderRadius: 16, border: "1px dashed var(--border)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💸</div>
          <p style={{ fontSize: 15, fontWeight: 600 }}>Chưa có giao dịch nào</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {transactions.map((t) => (
            <div key={t.id} style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{typeLabels[t.type] || t.type}</div>
                <div style={{ fontSize: 12, color: "var(--text-2)" }}>{t.description}</div>
                <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 4 }}>{new Date(t.createdAt).toLocaleString("vi-VN")}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: t.amount > 0 ? "#4ade80" : "#f87171" }}>
                  {t.amount > 0 ? "+" : ""}{t.amount.toLocaleString("vi-VN")}đ
                </div>
                <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 4 }}>Số dư: {t.balanceAfter.toLocaleString("vi-VN")}đ</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
