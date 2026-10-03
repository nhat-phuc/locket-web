"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LichSuQuayPage() {
  const router = useRouter();
  const [spins, setSpins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("locket_user");
    if (!stored) { router.push("/dang-nhap"); return; }

    fetch("/api/spin/history", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setSpins(d.spins || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f0a1e", margin: 0 }}>🎡 Lịch sử vòng quay</h1>
        <Link href="/vong-quay" style={{
          padding: "10px 20px",
          background: "linear-gradient(135deg, #fbbf24, #f472b6)",
          color: "#fff", borderRadius: 999, textDecoration: "none",
          fontWeight: 800, fontSize: 14,
        }}>
          🎯 Quay ngay
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Đang tải...</div>
      ) : spins.length === 0 ? (
        <div style={{
          padding: 40, textAlign: "center", background: "#faf5ff",
          borderRadius: 16, border: "1px dashed #e9d5ff", color: "#94a3b8",
        }}>
          Chưa có lượt quay nào
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {spins.map((s) => (
            <div key={s.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 16px", background: "#fff", border: "1px solid #f1f5f9",
              borderRadius: 12, gap: 12,
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0f0a1e", marginBottom: 3 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>
                  {new Date(s.createdAt).toLocaleString("vi-VN")}
                </div>
              </div>
              {s.value > 0 && (
                <div style={{ fontSize: 15, fontWeight: 900, color: "#10b981", whiteSpace: "nowrap" }}>
                  +{fmt(s.value)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
