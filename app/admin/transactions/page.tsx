"use client";

import { useEffect, useState } from "react";
import AdminPage from "@/components/admin/AdminPage";

const TYPE_OPTIONS = [
  { value: "", label: "Tất cả", icon: "📋" },
  { value: "deposit", label: "Nạp tiền", icon: "💰" },
  { value: "recharge", label: "Nạp thẻ", icon: "💳" },
  { value: "payment", label: "Thanh toán", icon: "💸" },
  { value: "withdraw", label: "Rút tiền", icon: "🏦" },
  { value: "refund", label: "Hoàn tiền", icon: "↩️" },
  { value: "bonus", label: "Thưởng", icon: "🎁" },
  { value: "commission", label: "Hoa hồng", icon: "🤝" },
  { value: "admin_recharge", label: "Admin cộng", icon: "➕" },
  { value: "admin_deduct", label: "Admin trừ", icon: "➖" },
];

const TYPE_LABELS: Record<string, string> = {
  deposit: "Nạp tiền",
  recharge: "Nạp thẻ",
  payment: "Thanh toán",
  withdraw: "Rút tiền",
  refund: "Hoàn tiền",
  bonus: "Thưởng",
  commission: "Hoa hồng",
  admin_recharge: "Admin cộng",
  admin_deduct: "Admin trừ",
  admin_add: "Admin cộng",
  admin_subtract: "Admin trừ",
};

const METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Chuyển khoản",
  momo: "MoMo",
  vnpay: "VNPay",
  sepay: "SePay",
  admin: "Admin",
  lucky_wheel: "Vòng quay",
  referral: "Giới thiệu",
  system: "Hệ thống",
  manual: "Thủ công",
};

export default function Page() {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/transactions${type ? "?type=" + type : ""}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setTxs(d.transactions);
      })
      .finally(() => setLoading(false));
  }, [type]);

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  return (
    <AdminPage title="Giao dịch" description="Tất cả giao dịch trong hệ thống">
      {/* Bộ lọc */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setType(opt.value)}
            className="admin-btn"
            style={{
              background: type === opt.value ? "var(--accent)" : undefined,
              color: type === opt.value ? "#fff" : undefined,
              fontSize: 13,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Danh sách giao dịch */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {txs.map((t) => (
            <div
              key={t.id}
              style={{
                background: "var(--bg-1)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 14 }}>
                  @{t.user?.username || "?"}
                </span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 15,
                    color: t.amount > 0 ? "#34d399" : "#f87171",
                  }}
                >
                  {t.amount > 0 ? "+" : ""}
                  {fmt(t.amount)}
                </span>
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-2)",
                  marginBottom: 4,
                }}
              >
                {t.description}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "var(--text-2)",
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                <span>
                  {TYPE_LABELS[t.type] || t.type} ·{" "}
                  {METHOD_LABELS[t.method] || t.method || "—"}
                </span>
                <span>{new Date(t.createdAt).toLocaleString("vi-VN")}</span>
              </div>
            </div>
          ))}

          {txs.length === 0 && (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: "var(--text-2)",
              }}
            >
              📭 Không có giao dịch
            </div>
          )}
        </div>
      )}
    </AdminPage>
  );
}
