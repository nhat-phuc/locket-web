"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function QuenMatKhauPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [devLink, setDevLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Có lỗi xảy ra");
        return;
      }

      setSuccess(true);
      if (data.devResetLink) setDevLink(data.devResetLink);
    } catch {
      setError("Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main
        className="wrap center-y"
        style={{ minHeight: "60vh", paddingTop: 60, paddingBottom: 60 }}
      >
        <div className="page-shell" style={{ maxWidth: 480 }}>
          <div className="auth-form">
            <h1 className="auth-title">Quên Mật Khẩu</h1>
            <p className="auth-sub">
              Nhập email đã đăng ký để nhận link đặt lại mật khẩu
            </p>

            {error && <div className="auth-error">{error}</div>}

            {success ? (
              <div
                style={{
                  background: "rgba(52, 211, 153, 0.1)",
                  border: "1px solid rgba(52, 211, 153, 0.3)",
                  borderRadius: 12,
                  padding: 20,
                  textAlign: "center",
                  color: "var(--green)",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
                <strong style={{ display: "block", marginBottom: 8 }}>
                  Đã gửi email!
                </strong>
                Nếu email <strong>{email}</strong> tồn tại trong hệ thống, bạn
                sẽ nhận được link đặt lại mật khẩu trong vài phút.
                <br />
                <span style={{ color: "var(--text-2)", fontSize: 12 }}>
                  Kiểm tra cả hộp thư Spam nếu không thấy.
                </span>

                {devLink && (
                  <div
                    style={{
                      marginTop: 16,
                      padding: 12,
                      background: "rgba(167, 139, 250, 0.1)",
                      border: "1px dashed var(--accent)",
                      borderRadius: 8,
                      fontSize: 12,
                      textAlign: "left",
                      wordBreak: "break-all",
                    }}
                  >
                    <strong style={{ color: "var(--accent-bright)" }}>
                      [DEV] Link test:
                    </strong>
                    <br />
                    <a href={devLink} style={{ color: "var(--accent-bright)" }}>
                      {devLink}
                    </a>
                  </div>
                )}

                <div style={{ marginTop: 20 }}>
                  <Link
                    href="/dang-nhap"
                    style={{ color: "var(--accent-bright)", fontWeight: 700 }}
                  >
                    ← Quay lại đăng nhập
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="auth-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  className="auth-btn"
                  disabled={loading || !email}
                >
                  {loading ? "Đang gửi..." : "Gửi Link Đặt Lại Mật Khẩu"}
                </button>

                <div className="auth-footer">
                  <Link
                    href="/dang-nhap"
                    style={{ color: "var(--accent-bright)", fontWeight: 600 }}
                  >
                    ← Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Navbar />
      <Footer />
    </>
  );
}