"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function KichHoatPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleCheck = async () => {
    if (!username.trim()) return;
    setLoading(true);
    setResult(null);

    await new Promise((r) => setTimeout(r, 1000));

    setResult({
      success: true,
      message: `Username "${username}" hợp lệ. Vào Bảng giá để chọn gói và thanh toán.`,
    });
    setLoading(false);
  };

  return (
    <>
      <Header />
      <main className="wrap center-y" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ width: "100%", maxWidth: 560 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>Kích hoạt dịch vụ</h1>
            <p style={{ color: "var(--text-2)", fontSize: 15 }}>Nhập username Locket của bạn để kiểm tra</p>
          </div>

          <div className="auth-form">
            <div className="auth-field">
              <label>Username hoặc link Locket <span style={{ color: "var(--red)" }}>*</span></label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username hoặc https://locket.cam/username"
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              />
              <small style={{ color: "var(--text-2)", fontSize: 12 }}>Chúng tôi không cần mật khẩu, chỉ cần username công khai</small>
            </div>

            <button onClick={handleCheck} disabled={loading || !username.trim()} className="auth-btn">
              {loading ? "Đang kiểm tra..." : "Kiểm tra username"}
            </button>
          </div>

          {result && (
            <div style={{ marginTop: 24, padding: 20, borderRadius: 14, background: result.success ? "rgba(52,211,153,.1)" : "rgba(248,113,113,.1)", border: `1px solid ${result.success ? "rgba(52,211,153,.3)" : "rgba(248,113,113,.3)"}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: result.success ? "#34d399" : "#f87171", marginBottom: 8 }}>
                {result.success ? "✅ Hợp lệ" : "❌ Lỗi"}
              </div>
              <p style={{ fontSize: 14, color: "var(--text-1)", marginBottom: 16 }}>{result.message}</p>
              {result.success && (
                <Link href="/bang-gia" className="auth-btn" style={{ display: "inline-block", textDecoration: "none", textAlign: "center" }}>
                  🛒 Chọn gói ngay
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
