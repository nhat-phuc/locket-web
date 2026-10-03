"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function VoucherPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("locket_user");
    if (!stored) { router.push("/dang-nhap"); return; }

    fetch("/api/coupons/my", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setCoupons(d.coupons || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  if (loading) return <div style={{ padding: 60, textAlign: "center" }}>Đang tải...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "#0f0a1e" }}>🎟️ Voucher của tôi</h1>

      {coupons.length === 0 ? (
        <div style={{
          padding: 40, textAlign: "center", background: "#faf5ff",
          borderRadius: 16, border: "1px dashed #e9d5ff", color: "#94a3b8",
        }}>
          Chưa có voucher nào. Quay vòng quay để nhận nhé!
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {coupons.map((c) => (
            <div key={c.id} style={{
              background: "linear-gradient(135deg, #fdf4ff, #fce7f3)",
              border: "1px dashed #ec4899",
              borderRadius: 16, padding: 20, position: "relative",
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#ec4899", marginBottom: 6 }}>
                VOUCHER
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#0f0a1e", marginBottom: 12 }}>
                {c.discountType === "percent" ? `-${c.discountValue}%` : `-${c.discountValue.toLocaleString("vi-VN")}đ`}
              </div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
                Đơn tối thiểu: {c.minOrder?.toLocaleString("vi-VN")}đ
              </div>
              <div style={{
                background: "#fff", border: "1px dashed #a78bfa", borderRadius: 8,
                padding: "10px 14px", display: "flex", justifyContent: "space-between",
                alignItems: "center", gap: 8,
              }}>
                <code style={{ fontWeight: 800, fontSize: 14, color: "#7c3aed", letterSpacing: 1 }}>
                  {c.code}
                </code>
                <button onClick={() => copy(c.code)} style={{
                  background: "#7c3aed", color: "#fff", border: "none",
                  padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                  Copy
                </button>
              </div>
              {c.expiresAt && (
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 10 }}>
                  Hết hạn: {new Date(c.expiresAt).toLocaleDateString("vi-VN")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
