"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GoogleLoginButton from "./GoogleLoginButton";

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^0\d{9}$/.test(phone)) {
      setError("Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)");
      return;
    }

    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password, name, phone }),
      });
      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem("locket_user", JSON.stringify(data.user));
        router.push("/tai-khoan");
      } else {
        setError(data.message || "Đăng ký thất bại");
      }
    } catch {
      setError("Lỗi kết nối, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h1 className="auth-title">Đăng ký</h1>
      <p className="auth-sub">Tạo tài khoản miễn phí để bắt đầu</p>

      {error && <div className="auth-error">{error}</div>}

      {/* Google Button */}
      <div className="auth-google-wrap">
        <GoogleLoginButton />
      </div>

      {/* Divider */}
      <div className="auth-divider">
        <span>HOẶC</span>
      </div>

      {/* Fields */}
      <div className="auth-field">
        <label>
          Email <span style={{ color: "var(--red)" }}>*</span>
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
          Username <span style={{ color: "var(--red)" }}>*</span>
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
          required
          minLength={3}
          maxLength={20}
          pattern="[a-zA-Z0-9_]+"
          autoComplete="username"
        />
        <small>Chỉ chứa chữ, số, gạch dưới (3-20 ký tự)</small>
      </div>

      <div className="auth-field">
        <label>Tên hiển thị</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nguyễn Văn A"
        />
      </div>

      <div className="auth-field">
        <label>
          Số điện thoại <span style={{ color: "var(--red)" }}>*</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="0912345678"
          required
          pattern="0[0-9]{9}"
          maxLength={10}
          autoComplete="tel"
          inputMode="numeric"
        />
        <small>10 số, bắt đầu bằng 0</small>
      </div>

      <div className="auth-field">
        <label>
          Mật khẩu <span style={{ color: "var(--red)" }}>*</span>
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>

      <div className="auth-field">
        <label>
          Xác nhận mật khẩu <span style={{ color: "var(--red)" }}>*</span>
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />
      </div>

      <button type="submit" disabled={loading} className="auth-btn">
        {loading ? "Đang đăng ký..." : "Tạo tài khoản"}
      </button>

      <p className="auth-footer">
        Đã có tài khoản?{" "}
        <Link href="/dang-nhap">Đăng nhập</Link>
      </p>

      <style jsx>{`
        .auth-form {
          width: 100%;
          max-width: 440px;
          margin: 0 auto;
        }
        .auth-google-wrap {
          margin-bottom: 20px !important;
        }
        .auth-google-wrap :global(*),
        .auth-google-wrap :global(button) {
          margin: 0 !important;
        }
        .auth-google-wrap :global(div) {
          min-height: 0 !important;
          height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0 !important;
          color: var(--text-2, #6a6a7a);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .auth-divider::before,
        .auth-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--border, rgba(0, 0, 0, 0.08));
        }
        .auth-divider span {
          flex-shrink: 0;
        }
        .auth-field {
          margin-bottom: 14px !important;
        }
        .auth-field:last-of-type {
          margin-bottom: 8px !important;
        }
        .auth-field small {
          display: block;
          margin-top: 6px;
          font-size: 12px;
          color: var(--text-2, #6a6a7a);
          line-height: 1.5;
        }
        .auth-btn {
          width: 100%;
          margin-top: 8px;
        }
        .auth-footer {
          text-align: center;
          margin-top: 18px;
          font-size: 14px;
          color: var(--text-2, #6a6a7a);
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
      `}</style>
    </form>
  );
}
