"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GoogleLoginButton from "./GoogleLoginButton";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem("locket_user", JSON.stringify(data.user));
        router.push("/tai-khoan");
        router.refresh();
      } else {
        setError(data.message || "Đăng nhập thất bại");
      }
    } catch {
      setError("Lỗi kết nối, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h1 className="auth-title">Đăng nhập</h1>
      <p className="auth-sub">Chào mừng bạn trở lại!</p>

      {error && <div className="auth-error">{error}</div>}

      <div className="auth-field">
        <label>
          Email <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="auth-field">
        <label>
          Mật khẩu <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
      </div>

      <div style={{ textAlign: "right", marginBottom: 16, marginTop: -8 }}>
        <Link href="/quen-mat-khau" style={{ fontSize: 13, color: "#7c3aed", fontWeight: 600 }}>
          Quên mật khẩu?
        </Link>
      </div>

      <button type="submit" className="auth-btn" disabled={loading}>
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      {/* Divider */}
      <div className="auth-divider">
        <span>HOẶC</span>
      </div>

      {/* Google Login */}
      <GoogleLoginButton />

      <p className="auth-footer">
        Chưa có tài khoản?{" "}
        <Link href="/dang-ky">Đăng ký ngay</Link>
      </p>

      <style jsx>{`
        .auth-form {
          width: 100%;
          max-width: 440px;
          margin: 0 auto;
          background: #ffffff;
          border: 1.5px solid rgba(167, 139, 250, 0.2);
          border-radius: 20px;
          padding: 28px 24px;
          box-shadow: 0 8px 32px rgba(167, 139, 250, 0.1);
          box-sizing: border-box;
        }
        .auth-title {
          font-size: 26px;
          font-weight: 900;
          text-align: center;
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 6px;
          letter-spacing: -0.5px;
        }
        .auth-sub {
          font-size: 14px;
          color: #6b7280;
          text-align: center;
          margin-bottom: 24px;
        }
        .auth-error {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .auth-field {
          margin-bottom: 16px;
        }
        .auth-field label {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }
        .auth-field input {
          width: 100%;
          padding: 13px 16px;
          background: #fafafa;
          border: 1.5px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          font-size: 15px;
          font-family: inherit;
          color: #111827;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .auth-field input:focus {
          border-color: #a78bfa;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(167, 139, 250, 0.15);
        }
        .auth-btn {
          width: 100%;
          padding: 15px;
          border-radius: 12px;
          font-size: 15.5px;
          font-weight: 800;
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          color: #ffffff;
          border: none;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .auth-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(124, 58, 237, 0.4);
        }
        .auth-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
          color: #6b7280;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .auth-divider::before,
        .auth-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: rgba(0, 0, 0, 0.08);
        }
        .auth-divider span {
          flex-shrink: 0;
        }
        .auth-footer {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
          color: #6b7280;
        }
        .auth-footer :global(a) {
          color: #a78bfa;
          font-weight: 700;
          text-decoration: none;
        }
        .auth-footer :global(a:hover) {
          color: #7c3aed;
          text-decoration: underline;
        }
        @media (max-width: 480px) {
          .auth-form { padding: 20px 16px; border-radius: 16px; }
          .auth-title { font-size: 22px; }
          .auth-field { margin-bottom: 14px; }
          .auth-field input { padding: 12px 14px; font-size: 14.5px; }
        }
      `}</style>
    </form>
  );
}
