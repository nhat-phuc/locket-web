"use client";

import { useEffect, useState } from "react";
import DanhGiaDichVu from "@/components/DanhGiaDichVu";

interface Order {
  id: string;
  orderCode: string;
  serviceName: string;
  finalAmount: number;
  status: string;
  locketUsername: string;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  pending: "Chờ xử lý",
  paid: "Đã thanh toán",
  processing: "Đang xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  expired: "Hết hạn",
};

export default function DonHangPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/orders")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setOrders(data.orders);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>Lịch sử đơn hàng</h1>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-2)" }}>Đang tải...</div>
      ) : orders.length === 0 ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--text-2)", background: "var(--bg-1)", borderRadius: 16, border: "1px dashed var(--border)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: 15, fontWeight: 600 }}>Chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map((o) => (
            <div key={o.id} style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontFamily: "monospace", fontWeight: 800, color: "var(--accent-bright)", fontSize: 14, marginBottom: 4 }}>{o.orderCode}</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{o.serviceName}</div>
                </div>
                <span className={`status-badge ${o.status}`}>{statusLabels[o.status] || o.status}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-2)" }}>
                <span>Locket: {o.locketUsername}</span>
                <span>{new Date(o.createdAt).toLocaleString("vi-VN")}</span>
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--text-2)" }}>Tổng tiền</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#4ade80" }}>{o.finalAmount.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== FORM ĐÁNH GIÁ DỊCH VỤ ===== */}
      <DanhGiaDichVu />
    </>
  );
}
