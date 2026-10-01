"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function QuenMatKhauPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.devOtp) {
          alert(`🔗 DEV MODE - Mã OTP: ${data.devOtp}\n\n(Production: mã này gửi qua email)`);
        }
        router.push(`/nhap-otp?email=${encodeURIComponent(email)}`);
      } else {
        setError(data.error || "Có lỗi xảy ra");
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="wrap center-y" style={{ minHeight: "60vh", paddingTop: 60, paddingBottom: 60 }}>
        <div className="page-shell" style={{ maxWidth: 480 }}>
          <div className="auth-form">
            <h1 className="auth-title">Quên Mật Khẩu</h1>
            <p className="auth-sub">Nhập email để nhận mã OTP</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi Mã OTP"}
              </button>

              <div className="auth-footer">
                <Link href="/dang-nhap" style={{ color: "var(--accent-bright)" }}>
                  ← Quay lại đăng nhập
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Navbar />
    </>
  );
}
