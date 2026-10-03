"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Pkg { id: string; name: string; price: number; }
interface Service {
  id: string; name: string; slug: string; type: string;
  price: number; originalPrice?: number | null;
  description: string;
  packages?: Pkg[];
}

export default function HomePricing() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => { if (d.success) setServices(d.services || []); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 60, textAlign: "center" }}>Đang tải bảng giá...</div>;
  if (services.length === 0) return null;

  return (
    <section style={{ padding: "60px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h2 style={{
          fontSize: 32, fontWeight: 800, margin: "0 0 8px",
          background: "linear-gradient(135deg,#a78bfa,#f472b6)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>Bảng Giá Dịch Vụ</h2>
        <p style={{ color: "#888", margin: 0 }}>Chọn gói phù hợp — thanh toán tự động</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
        {services.map((s) => (
          <div key={s.id} style={{
            background: "#fff", borderRadius: 20, padding: 24,
            boxShadow: "0 8px 32px rgba(124,58,237,.08)",
            border: "1px solid #f3e8ff", display: "flex", flexDirection: "column",
          }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>{s.name}</h3>
            <p style={{ color: "#888", fontSize: 14, margin: "0 0 16px" }}>{s.description}</p>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#7c3aed", margin: "0 0 16px" }}>
              {s.price.toLocaleString("vi-VN")}đ
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
              {(s.packages && s.packages.length > 0 ? s.packages : [{ id: "", name: "Mua ngay", price: s.price }]).map((p) => (
                <Link
                  key={p.id || p.name}
                  href={`/thanh-toan?serviceId=${s.slug}&packageId=${p.id}`}
                  style={{
                    display: "block", padding: "12px 16px",
                    background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
                    color: "#fff", borderRadius: 12, textAlign: "center",
                    textDecoration: "none", fontWeight: 700, fontSize: 14,
                  }}
                >
                  {p.name} — {p.price.toLocaleString("vi-VN")}đ
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
