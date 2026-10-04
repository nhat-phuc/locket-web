"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function Content() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/payments/check?orderId=${orderId}`)
        .then(r => r.json())
        .then(d => { if (d.success) setOrder(d); })
        .catch(() => {});
    }
  }, [orderId]);

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px", background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)" }}>
      <div style={{ maxWidth: 480, width: "100%", background: "#fff", borderRadius: 24, padding: "40px 28px", boxShadow: "0 20px 60px rgba(16,185,129,.15)", border: "2px solid #a7f3d0", textAlign: "center" }}>
        <div style={{ width: 100, height: 100, background: "linear-gradient(135deg, #10b981, #34d399)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 56, boxShadow: "0 12px 40px rgba(16,185,129,.4)" }}>💰</div>

        <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 8px", color: "#10b981" }}>Nạp tiền thành công!</h1>
        <p style={{ color: "#64748b", margin: "0 0 24px", fontSize: 14 }}>Số dư đã được cộng vào ví của bạn</p>

        <div style={{ background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)", borderRadius: 16, padding: "20px 24px", marginBottom: 24, border: "1px solid #a7f3d0" }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: "#10b981", marginBottom: 6 }}>SỐ TIỀN NẠP</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#059669", lineHeight: 1.1 }}>+{order ? fmt(order.finalAmount) : "—"}</div>
          {order && <div style={{ fontSize: 12, color: "#64748b", marginTop: 8, fontFamily: "monospace" }}>Mã đơn: {order.orderCode}</div>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          <button onClick={() => router.push("/nap-tien")} style={{ padding: "14px", background: "linear-gradient(135deg, #10b981, #34d399)", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>💰 Nạp tiếp</button>
          <button onClick={() => router.push("/tai-khoan/vi")} style={{ padding: "14px", background: "#f1f5f9", color: "#334155", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>👛 Về ví</button>
        </div>

        <button onClick={() => router.push("/")} style={{ width: "100%", padding: "12px", background: "transparent", border: "1px solid #e2e8f0", borderRadius: 12, color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← Về trang chủ</button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: "center" }}>Đang tải...</div>}>
      <Content />
    </Suspense>
  );
}
