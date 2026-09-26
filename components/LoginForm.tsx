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
      <p className="auth-sub">Chào mừng bạn quay lại Locket Gold</p>

      {error && <div className="auth-error">{error}</div>}

      <div className="auth-field">
        <label>Email</label>
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
        <label>Mật khẩu</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
      </div>

      <div style={{ textAlign: "right", marginBottom: 16 }}>
        <Link
          href="/quen-mat-khau"
          style={{ fontSize: 13, color: "var(--accent-bright)" }}
        >
          Quên mật khẩu?
        </Link>
      </div>

      <button type="submit" disabled={loading} className="auth-btn">
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <GoogleLoginButton />

      <p className="auth-footer">
        Chưa có tài khoản?{" "}
        <Link
          href="/dang-ky"
          style={{ color: "var(--accent-bright)", fontWeight: 700 }}
        >
          Đăng ký ngay
        </Link>
      </p>
    </form>
  );
}
