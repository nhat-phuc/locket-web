"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/orders/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setOrder(d.order); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 60, textAlign: "center" }}>Đang tải...</div>;
  if (!order) return <div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>Không tìm thấy đơn hàng</div>;

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  const statusLabels: Record<string, string> = {
    pending: "Chờ xử lý", paid: "Đã thanh toán", processing: "Đang xử lý",
    completed: "Hoàn thành", cancelled: "Đã hủy", expired: "Hết hạn",
  };

  return (
    <div>
      <Link href="/tai-khoan/don-hang" style={{ color: "#7c3aed", textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
        ← Quay lại danh sách
      </Link>

      <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 16, marginBottom: 24, color: "#0f0a1e" }}>
        📦 Đơn hàng {order.orderCode}
      </h1>

      <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #f1f5f9" }}>
        <div style={{ display: "grid", gap: 12 }}>
          {[
            { l: "Mã đơn", v: order.orderCode },
            { l: "Dịch vụ", v: order.serviceName },
            { l: "Số tiền", v: fmt(order.finalAmount) },
            { l: "Trạng thái", v: statusLabels[order.status] || order.status },
            { l: "Username Locket", v: order.locketUsername || "—" },
            { l: "Ngày tạo", v: new Date(order.createdAt).toLocaleString("vi-VN") },
            ...(order.paidAt ? [{ l: "Ngày thanh toán", v: new Date(order.paidAt).toLocaleString("vi-VN") }] : []),
            ...(order.completedAt ? [{ l: "Ngày hoàn thành", v: new Date(order.completedAt).toLocaleString("vi-VN") }] : []),
          ].map((row) => (
            <div key={row.l} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 10, borderBottom: "1px solid #f8fafc" }}>
              <span style={{ color: "#64748b", fontWeight: 600 }}>{row.l}</span>
              <span style={{ color: "#0f0a1e", fontWeight: 700, textAlign: "right" }}>{row.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
